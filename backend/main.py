# from flask import Flask, Response, jsonify
# from flask_cors import CORS
# import cv2
# import dlib
# import numpy as np
# import pygame
# from tensorflow.keras.models import load_model
# import math
# import time
# import requests
# import threading
# import json
# import os
# import base64
# import serial

# # Add this to your Flask app to serve the React frontend

# # Initialize Flask app
# # Initialize Flask app
# app = Flask(__name__)  # This should be before using @app.route
# CORS(app)  # Enable CORS for all routes

# # Add this to your Flask app to serve the React frontend
# from flask import send_from_directory

# # Serve React static files
# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def serve(path):
#     if path != "" and os.path.exists("build/" + path):
#         return send_from_directory('build', path)
#     else:
#         return send_from_directory('build', 'index.html')
# arduino_serial = None
# SERIAL_PORT = "COM3"  # Change this to match your Arduino's serial port
# BAUD_RATE = 9600

# # Arduino WiFi settings
# ARDUINO_IP = "192.168.204.152"  # Replace with your Arduino's IP address
# ARDUINO_PORT = "80"
# ARDUINO_URL = f"http://{ARDUINO_IP}:{ARDUINO_PORT}"

# # Global variables to store detection results
# detection_results = {
#     "isRunning": False,
#     "isDrowsy": False,
#     "earValue": 0.35,
#     "fatigueLevel": "Not Drowsy",
#     "blinkCount": 0,
#     "headPose": {"yaw": 0, "pitch": 0, "roll": 0},
#     "alertHistory": [],
#     "counter": 0
# }

# # Define thresholds and variables for EAR, blink detection, and head position
# EAR_THRESHOLD = 0.25
# CONSEC_FRAMES = 30
# COUNTER = 0
# ALERT = False
# last_alert_status = False
# blink_count = 0
# blink_start_time = None
# blink_threshold = 0.2
# blink_duration_threshold = 1.0
# fatigue_level = "Not Drowsy"

# # Shared variables
# cam = None
# detection_thread = None
# stop_event = threading.Event()
# frame_lock = threading.Lock()
# current_frame = None

# # Setup paths - adjust these based on your file locations
# MODEL_PATH = "models/drowsiness_model.h5"
# LANDMARKS_PATH = "models/shape_predictor_68_face_landmarks.dat"
# ALARM_SOUND_PATH = "sounds/alarm.wav"

# # Create directory structure if it doesn't exist
# os.makedirs("models", exist_ok=True)
# os.makedirs("sounds", exist_ok=True)

# # Function to download files if they don't exist (you'd need to replace these URLs)
# def ensure_file_exists(file_path, url):
#     if not os.path.exists(file_path):
#         print(f"Downloading {file_path}...")
#         r = requests.get(url)
#         with open(file_path, 'wb') as f:
#             f.write(r.content)
#         print(f"Downloaded {file_path}")

# # Check if model files exist, provide placeholders if not
# def check_model_files():
#     if not os.path.exists(MODEL_PATH):
#         print("Warning: Drowsiness model not found. Using fallback detection.")
#     if not os.path.exists(LANDMARKS_PATH):
#         print("Warning: Face landmarks model not found. Using fallback detection.")
#     if not os.path.exists(ALARM_SOUND_PATH):
#         print("Warning: Alarm sound not found. Using fallback sound.")
#         # Create a simple beep sound
#         pygame.mixer.init()
#         sound = pygame.mixer.Sound("sounds/alarm.wav")
#         with open(ALARM_SOUND_PATH, 'wb') as f:
#             f.write(sound._samples)

# # Initialize computer vision components
# try:
#     # Check if model files exist
#     check_model_files()
    
#     # Initialize detector
#     detector = dlib.get_frontal_face_detector()
    
#     # Try to load the predictor if it exists
#     if os.path.exists(LANDMARKS_PATH):
#         predictor = dlib.shape_predictor(LANDMARKS_PATH)
#     else:
#         predictor = None
    
#     # Try to load the model if it exists
#     if os.path.exists(MODEL_PATH):
#         model = load_model(MODEL_PATH)
#     else:
#         model = None
    
#     # Initialize pygame for audio
#     pygame.mixer.init()
#     if os.path.exists(ALARM_SOUND_PATH):
#         alarm_sound = pygame.mixer.Sound(ALARM_SOUND_PATH)
#     else:
#         alarm_sound = None
    
# except Exception as e:
#     print(f"Error initializing components: {e}")
#     detector = None
#     predictor = None
#     model = None
#     alarm_sound = None
# def initialize_serial():
#     global arduino_serial
#     try:
#         arduino_serial = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
#         time.sleep(2)  # Allow time for the Arduino to reset
#         print(f"Serial connection established on {SERIAL_PORT}")
#         return True
#     except Exception as e:
#         print(f"Failed to connect to Arduino via serial: {e}")
#         return False
# # Function to send alert to Arduino over WiFi
# def send_alert_to_arduino(is_drowsy):
#     global last_alert_status, arduino_serial
    
#     # Only send if status has changed
#     if is_drowsy != last_alert_status:
#         try:
#             if arduino_serial is None or not arduino_serial.is_open:
#                 if not initialize_serial():
#                     print("Could not initialize serial connection")
#                     return False
            
#             if is_drowsy:
#                 arduino_serial.write(b'D\n')  # 'D' for drowsy
#                 print("Drowsiness alert sent to Arduino via serial")
#             else:
#                 arduino_serial.write(b'A\n')  # 'A' for alert cleared
#                 print("Alert cleared via serial")
            
#             # Wait for acknowledgment
#             response = arduino_serial.readline().decode('utf-8').strip()
#             print(f"Arduino response: {response}")
            
#             last_alert_status = is_drowsy
#             return True
#         except Exception as e:
#             print(f"Failed to communicate with Arduino via serial: {e}")
#             try:
#                 if arduino_serial and arduino_serial.is_open:
#                     arduino_serial.close()
#                 arduino_serial = None
#             except:
#                 pass
#             return False
#     return True

# # Eye Aspect Ratio Calculation
# def get_eye_aspect_ratio(eye_points, facial_landmarks):
#     eye = []
#     for i in eye_points:
#         eye.append((facial_landmarks.part(i).x, facial_landmarks.part(i).y))
    
#     eye = np.array(eye)
    
#     # Compute the distances
#     A = np.linalg.norm(eye[1] - eye[5])
#     B = np.linalg.norm(eye[2] - eye[4])
#     C = np.linalg.norm(eye[0] - eye[3])
    
#     # Calculate EAR
#     ear = (A + B) / (2.0 * C)
#     return ear

# # Head Pose Estimation
# def get_head_pose(landmarks):
#     image_points = np.array([
#         (landmarks.part(30).x, landmarks.part(30).y),  # Nose tip
#         (landmarks.part(8).x, landmarks.part(8).y),    # Chin
#         (landmarks.part(36).x, landmarks.part(36).y),  # Left eye left corner
#         (landmarks.part(45).x, landmarks.part(45).y),  # Right eye right corner
#         (landmarks.part(48).x, landmarks.part(48).y),  # Left mouth corner
#         (landmarks.part(54).x, landmarks.part(54).y)   # Right mouth corner
#     ], dtype="double")

#     model_points = np.array([
#         (0.0, 0.0, 0.0),
#         (0.0, -330.0, -65.0),
#         (-225.0, 170.0, -135.0),
#         (225.0, 170.0, -135.0),
#         (-150.0, -150.0, -125.0),
#         (150.0, -150.0, -125.0)
#     ])

#     focal_length = 1.0
#     center = (0.0, 0.0)
#     camera_matrix = np.array([
#         [focal_length, 0, center[0]],
#         [0, focal_length, center[1]],
#         [0, 0, 1]
#     ])

#     dist_coeffs = np.zeros((4, 1))

#     _, rotation_vector, translation_vector = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs)
#     rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

#     sy = math.sqrt(rotation_matrix[0, 0] ** 2 + rotation_matrix[1, 0] ** 2)
#     singular = sy < 1e-6
#     if not singular:
#         x = math.atan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
#         y = math.atan2(-rotation_matrix[2, 0], sy)
#         z = math.atan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
#     else:
#         x = math.atan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
#         y = math.atan2(-rotation_matrix[2, 0], sy)
#         z = 0

#     # Convert from radians to degrees
#     x, y, z = math.degrees(x), math.degrees(y), math.degrees(z)
    
#     return z, y, x  # yaw, pitch, roll

# # Fatigue Level Prediction based on EAR and Head Tilt
# def predict_fatigue_level(ear, pitch):
#     if ear < 0.2 and abs(pitch) > 20:
#         return "Severe Fatigue"
#     elif ear < 0.3 or abs(pitch) > 15:
#         return "Moderate Fatigue"
#     else:
#         return "Mild Fatigue"

# # Fallback detection when models are not available
# def fallback_detection(frame):
#     global detection_results, COUNTER, ALERT, blink_count
    
#     # Generate random but consistent values
#     t = time.time()
#     detection_results["earValue"] = 0.3 + 0.05 * math.sin(t)
#     detection_results["headPose"]["yaw"] = 10 * math.sin(t / 5)
#     detection_results["headPose"]["pitch"] = 10 * math.cos(t / 3)
#     detection_results["headPose"]["roll"] = 5 * math.sin(t / 4)
    
#     # Simulate blinks
#     if random.random() > 0.95:
#         blink_count += 1
#         detection_results["blinkCount"] = blink_count
    
#     # Update drowsiness based on simulated EAR
#     if detection_results["earValue"] < EAR_THRESHOLD:
#         COUNTER += 1
#         if COUNTER >= CONSEC_FRAMES:
#             detection_results["isDrowsy"] = True
#             detection_results["fatigueLevel"] = "Moderate Fatigue"
#             if not ALERT:
#                 ALERT = True
#                 # Play sound in fallback mode
#                 if pygame.mixer.get_init():
#                     pygame.mixer.Sound(ALARM_SOUND_PATH).play()
#     else:
#         COUNTER = 0
#         detection_results["isDrowsy"] = False
#         detection_results["fatigueLevel"] = "Mild Fatigue"
#         ALERT = False
    
#     detection_results["counter"] = COUNTER
    
#     # Draw some visual cues on the frame
#     height, width = frame.shape[:2]
#     # Draw a face oval
#     cv2.ellipse(frame, (width//2, height//2), (100, 140), 0, 0, 360, (0, 255, 0), 2)
#     # Draw eyes
#     eye_y = height//2 - 20
#     left_eye_x = width//2 - 40
#     right_eye_x = width//2 + 40
#     # Calculate eye openness
#     openness = max(5, (detection_results["earValue"] - 0.15) * 80)
#     # Draw eyes
#     cv2.ellipse(frame, (left_eye_x, eye_y), (20, int(openness)), 0, 0, 360, (0, 255, 0), 2)
#     cv2.ellipse(frame, (right_eye_x, eye_y), (20, int(openness)), 0, 0, 360, (0, 255, 0), 2)
#     # Draw mouth
#     cv2.ellipse(frame, (width//2, height//2 + 50), (30, 15), 0, 0, 360, (0, 255, 0), 2)
    
#     # Add text
#     cv2.putText(frame, f"EAR: {detection_results['earValue']:.3f}", (10, 30), 
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#     cv2.putText(frame, f"Drowsy: {detection_results['isDrowsy']}", (10, 60), 
#                 cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255) if detection_results['isDrowsy'] else (0, 255, 0), 2)
    
#     return frame

# # Main detection function
# def detect_drowsiness(frame):
#     global detection_results, COUNTER, ALERT, blink_count, blink_start_time
    
#     # If no detector or predictor available, use fallback
#     if detector is None or predictor is None:
#         return fallback_detection(frame)
    
#     # Convert to grayscale
#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     faces = detector(gray)
    
#     # Default state - if no face is detected
#         # Default state - if no face is detected
#     if not faces:
#         return frame

#     # Process each face detected
#     for face in faces:
#         landmarks = predictor(gray, face)

#         # Calculate Eye Aspect Ratio (EAR) for both eyes
#         left_eye = [36, 37, 38, 39, 40, 41]
#         right_eye = [42, 43, 44, 45, 46, 47]
#         left_ear = get_eye_aspect_ratio(left_eye, landmarks)
#         right_ear = get_eye_aspect_ratio(right_eye, landmarks)
#         ear = (left_ear + right_ear) / 2.0

#         # Head pose estimation
#         yaw, pitch, roll = get_head_pose(landmarks)

#         # Predict fatigue level based on EAR and head pose
#         fatigue_level = predict_fatigue_level(ear, pitch)

#         # Update global detection results
#         detection_results["earValue"] = ear
#         detection_results["headPose"] = {"yaw": yaw, "pitch": pitch, "roll": roll}
#         detection_results["fatigueLevel"] = fatigue_level

#         # Blink detection
#         if ear < EAR_THRESHOLD:
#             COUNTER += 1
#             if COUNTER >= CONSEC_FRAMES:
#                 detection_results["isDrowsy"] = True
#                 if not ALERT:
#                     ALERT = True
#                     if pygame.mixer.get_init() and alarm_sound:
#                         alarm_sound.play()
#                     # Send alert to Arduino when drowsy
#                     send_alert_to_arduino(True)
#         else:
#             COUNTER = 0
#             detection_results["isDrowsy"] = False
#             ALERT = False
#             # Send alert to Arduino to clear drowsy alert
#             send_alert_to_arduino(False)

#         # Draw facial landmarks and EAR on the frame
#         for n in range(36, 48):
#             (x, y) = landmarks.part(n).x, landmarks.part(n).y
#             cv2.circle(frame, (x, y), 1, (0, 255, 0), -1)

#         # Draw head pose arrows
#         cv2.putText(frame, f"Yaw: {yaw:.2f}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#         cv2.putText(frame, f"Pitch: {pitch:.2f}", (10, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#         cv2.putText(frame, f"Roll: {roll:.2f}", (10, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

#         # Draw EAR value and fatigue level
#         cv2.putText(frame, f"EAR: {ear:.3f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
#         cv2.putText(frame, f"Fatigue Level: {fatigue_level}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

#     return frame

# # Flask route to handle video stream
# @app.route("/video_feed")
# def video_feed():
#     def generate():
#         global current_frame
#         while not stop_event.is_set():
#             if current_frame is not None:
#                 _, jpeg = cv2.imencode(".jpg", current_frame)
#                 frame = jpeg.tobytes()
#                 yield (b"--frame\r\n"
#                        b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n\r\n")

#     return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

# # Flask route to handle drowsiness results
# @app.route("/status", methods=["GET"])
# def get_status():
#     return jsonify(detection_results)

# # Flask route to handle starting the camera stream
# @app.route("/start", methods=["GET"])
# def start_detection():
#     global cam, detection_thread, stop_event

#     if cam is None or not cam.isOpened():
#         cam = cv2.VideoCapture(0)  # Open default camera (0)
#         if not cam.isOpened():
#             return "Camera could not be opened", 500

#     # Start the detection thread
#     stop_event.clear()
#     detection_thread = threading.Thread(target=run_detection)
#     detection_thread.start()
#     return "Detection started", 200

# # Flask route to handle stopping the camera stream
# @app.route("/stop", methods=["GET"])
# def stop_detection():
#     global stop_event, detection_thread
#     stop_event.set()
#     if detection_thread:
#         detection_thread.join()
#     if cam:
#         cam.release()
#     return "Detection stopped", 200

# # Function to continuously capture frames and run detection
# def run_detection():
#     global current_frame
#     while not stop_event.is_set():
#         ret, frame = cam.read()
#         if ret:
#             frame = detect_drowsiness(frame)
#             with frame_lock:
#                 current_frame = frame
#         else:
#             print("Failed to grab frame.")
#             stop_event.set()

# if __name__ == "__main__":
#     # Start the Flask app
#     app.run(host="0.0.0.0", port=5000, threaded=True)

from flask import Flask, Response, jsonify, request, send_from_directory
from flask_cors import CORS
import cv2
import dlib
import numpy as np
import pygame
from tensorflow.keras.models import load_model
import math
import time
import requests
import threading
import json
import os
import base64
import serial
import mysql.connector
from mysql.connector import Error
import random


# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'drowsiness_detection',
    'user': 'root',
    'password': 'anjali'  # Replace with your MySQL password
}

# Serve React static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("build/" + path):
        return send_from_directory('build', path)
    else:
        return send_from_directory('build', 'index.html')

# Arduino settings
arduino_serial = None
SERIAL_PORT = "COM3"  # Change this to match your Arduino's serial port
BAUD_RATE = 9600

# Arduino WiFi settings
ARDUINO_IP = "192.168.204.152"  # Replace with your Arduino's IP address
ARDUINO_PORT = "80"
ARDUINO_URL = f"http://{ARDUINO_IP}:{ARDUINO_PORT}"

# Global variables to store detection results
detection_results = {
    "isRunning": False,
    "isDrowsy": False,
    "earValue": 0.35,
    "fatigueLevel": "Not Drowsy",
    "blinkCount": 0,
    "headPose": {"yaw": 0, "pitch": 0, "roll": 0},
    "alertHistory": [],
    "counter": 0
}

# Define thresholds and variables for EAR, blink detection, and head position
EAR_THRESHOLD = 0.25
CONSEC_FRAMES = 30
COUNTER = 0
ALERT = False
last_alert_status = False
blink_count = 0
blink_start_time = None
blink_threshold = 0.2
blink_duration_threshold = 1.0
fatigue_level = "Not Drowsy"

# Driver profile variables
current_driver_id = None
current_session_id = None

# Shared variables
cam = None
detection_thread = None
stop_event = threading.Event()
frame_lock = threading.Lock()
current_frame = None

# Setup paths - adjust these based on your file locations
MODEL_PATH = "models/drowsiness_model.h5"
LANDMARKS_PATH = "models/shape_predictor_68_face_landmarks.dat"
ALARM_SOUND_PATH = "sounds/alarm.wav"

# Create directory structure if it doesn't exist
os.makedirs("models", exist_ok=True)
os.makedirs("sounds", exist_ok=True)

# Database connection function
def create_initial_connection():
    try:
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL server: {e}")
        return None
def create_db_connection():
    try:
        connection = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database='drowsiness_detection'
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        return None

# Function to initialize database and tables if they don't exist
def initialize_database():
    # First connect without specifying a database
    connection = create_initial_connection()
    if connection is None:
        return False
    
    cursor = connection.cursor()
    
    # Create database if it doesn't exist
    try:
        cursor.execute("CREATE DATABASE IF NOT EXISTS drowsiness_detection")
        print("Database created or already exists")
        
        # Switch to the database
        cursor.execute("USE drowsiness_detection")
        
        # Create drivers table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS drivers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            age INT,
            driving_experience_years INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
        """)
        
        # Create driver_settings table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS driver_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id INT NOT NULL,
            ear_threshold FLOAT DEFAULT 0.25,
            consecutive_frames INT DEFAULT 30,
            blink_threshold FLOAT DEFAULT 0.2,
            head_pose_sensitivity FLOAT DEFAULT 1.0,
            FOREIGN KEY (driver_id) REFERENCES drivers(id)
        )
        """)
        
        # Create driver_sessions table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS driver_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id INT NOT NULL,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP NULL,
            duration_minutes INT DEFAULT 0,
            FOREIGN KEY (driver_id) REFERENCES drivers(id)
        )
        """)
        
        # Create drowsiness_alerts table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS drowsiness_alerts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            alert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ear_value FLOAT,
            fatigue_level VARCHAR(50),
            head_yaw FLOAT,
            head_pitch FLOAT,
            head_roll FLOAT,
            FOREIGN KEY (session_id) REFERENCES driver_sessions(id)
        )
        """)
        
        # Create driver_statistics table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS driver_statistics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id INT NOT NULL,
            date DATE,
            avg_ear FLOAT,
            blink_rate FLOAT,
            drowsiness_incidents INT DEFAULT 0,
            total_driving_minutes INT DEFAULT 0,
            FOREIGN KEY (driver_id) REFERENCES drivers(id),
            UNIQUE KEY (driver_id, date)
        )
        """)
        
        connection.commit()
        print("Database and tables created successfully")
        return True
    
    except Error as e:
        print(f"Error initializing database: {e}")
        return False
    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Get all drivers
def get_all_drivers():
    connection = create_db_connection()
    if connection is None:
        return []
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM drivers ORDER BY name")
        drivers = cursor.fetchall()
        return drivers
    except Error as e:
        print(f"Error fetching drivers: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Add a new driver
def add_driver(name, age=None, driving_experience_years=None):
    connection = create_db_connection()
    if connection is None:
        return None
    
    try:
        cursor = connection.cursor()
        sql = "INSERT INTO drivers (name, age, driving_experience_years) VALUES (%s, %s, %s)"
        values = (name, age, driving_experience_years)
        cursor.execute(sql, values)
        connection.commit()
        
        # Get the ID of the new driver
        driver_id = cursor.lastrowid
        
        # Create default settings for this driver
        cursor.execute("""
        INSERT INTO driver_settings (driver_id, ear_threshold, consecutive_frames, blink_threshold, head_pose_sensitivity)
        VALUES (%s, 0.25, 30, 0.2, 1.0)
        """, (driver_id,))
        connection.commit()
        
        return driver_id
    except Error as e:
        print(f"Error adding driver: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Get driver by ID
def get_driver(driver_id):
    connection = create_db_connection()
    if connection is None:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM drivers WHERE id = %s", (driver_id,))
        driver = cursor.fetchone()
        
        # Get driver settings
        if driver:
            cursor.execute("SELECT * FROM driver_settings WHERE driver_id = %s", (driver_id,))
            settings = cursor.fetchone()
            if settings:
                driver['settings'] = settings
        
        return driver
    except Error as e:
        print(f"Error fetching driver: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Update driver settings
def update_driver_settings(driver_id, ear_threshold=None, consecutive_frames=None, blink_threshold=None, head_pose_sensitivity=None):
    connection = create_db_connection()
    if connection is None:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Get current settings
        cursor.execute("SELECT * FROM driver_settings WHERE driver_id = %s", (driver_id,))
        current_settings = cursor.fetchone()
        
        if not current_settings:
            return False
        
        # Update only provided settings
        updates = []
        values = []
        
        if ear_threshold is not None:
            updates.append("ear_threshold = %s")
            values.append(ear_threshold)
        
        if consecutive_frames is not None:
            updates.append("consecutive_frames = %s")
            values.append(consecutive_frames)
        
        if blink_threshold is not None:
            updates.append("blink_threshold = %s")
            values.append(blink_threshold)
        
        if head_pose_sensitivity is not None:
            updates.append("head_pose_sensitivity = %s")
            values.append(head_pose_sensitivity)
        
        if not updates:
            return True  # Nothing to update
        
        # Add driver_id for WHERE clause
        values.append(driver_id)
        
        # Construct and execute update query
        sql = f"UPDATE driver_settings SET {', '.join(updates)} WHERE driver_id = %s"
        cursor.execute(sql, values)
        connection.commit()
        
        return True
    except Error as e:
        print(f"Error updating driver settings: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Start a new driving session
def start_driver_session(driver_id):
    connection = create_db_connection()
    if connection is None:
        return None
    
    try:
        cursor = connection.cursor()
        cursor.execute("INSERT INTO driver_sessions (driver_id) VALUES (%s)", (driver_id,))
        connection.commit()
        session_id = cursor.lastrowid
        return session_id
    except Error as e:
        print(f"Error starting session: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# End a driving session
def end_driver_session(session_id):
    connection = create_db_connection()
    if connection is None:
        return False
    
    try:
        cursor = connection.cursor()
        cursor.execute("""
        UPDATE driver_sessions 
        SET end_time = CURRENT_TIMESTAMP, 
            duration_minutes = TIMESTAMPDIFF(MINUTE, start_time, CURRENT_TIMESTAMP)
        WHERE id = %s
        """, (session_id,))
        connection.commit()
        return True
    except Error as e:
        print(f"Error ending session: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Log a drowsiness alert
def log_drowsiness_alert(session_id, ear_value, fatigue_level, head_yaw, head_pitch, head_roll):
    connection = create_db_connection()
    if connection is None:
        return False
    
    try:
        cursor = connection.cursor()
        sql = """
        INSERT INTO drowsiness_alerts 
        (session_id, ear_value, fatigue_level, head_yaw, head_pitch, head_roll)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        values = (session_id, ear_value, fatigue_level, head_yaw, head_pitch, head_roll)
        cursor.execute(sql, values)
        connection.commit()
        return True
    except Error as e:
        print(f"Error logging drowsiness alert: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Update driver statistics
def update_driver_statistics(driver_id, ear_value, blink_detected=False, drowsiness_detected=False, session_minutes=0):
    connection = create_db_connection()
    if connection is None:
        return False
    
    today = time.strftime('%Y-%m-%d')
    
    try:
        cursor = connection.cursor()
        
        # Check if there's already a record for today
        cursor.execute("SELECT * FROM driver_statistics WHERE driver_id = %s AND date = %s", (driver_id, today))
        existing_record = cursor.fetchone()
        
        if existing_record:
            # Update existing record
            cursor.execute("""
            UPDATE driver_statistics
            SET avg_ear = ((avg_ear * total_driving_minutes) + (%s * %s)) / (total_driving_minutes + %s),
                blink_rate = blink_rate + %s,
                drowsiness_incidents = drowsiness_incidents + %s,
                total_driving_minutes = total_driving_minutes + %s
            WHERE driver_id = %s AND date = %s
            """, (
                ear_value, 
                session_minutes if session_minutes > 0 else 1, 
                session_minutes if session_minutes > 0 else 1,
                1 if blink_detected else 0,
                1 if drowsiness_detected else 0,
                session_minutes if session_minutes > 0 else 0,
                driver_id,
                today
            ))
        else:
            # Create new record
            cursor.execute("""
            INSERT INTO driver_statistics
            (driver_id, date, avg_ear, blink_rate, drowsiness_incidents, total_driving_minutes)
            VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                driver_id,
                today,
                ear_value,
                1 if blink_detected else 0,
                1 if drowsiness_detected else 0,
                session_minutes if session_minutes > 0 else 1
            ))
        
        connection.commit()
        return True
    except Error as e:
        print(f"Error updating statistics: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Get driver statistics
def get_driver_statistics(driver_id, days=7):
    connection = create_db_connection()
    if connection is None:
        return []
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
        SELECT * FROM driver_statistics
        WHERE driver_id = %s AND date >= DATE_SUB(CURRENT_DATE, INTERVAL %s DAY)
        ORDER BY date
        """, (driver_id, days))
        
        statistics = cursor.fetchall()
        return statistics
    except Error as e:
        print(f"Error fetching statistics: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Get drowsiness alerts for a driver
def get_driver_alerts(driver_id, limit=50):
    connection = create_db_connection()
    if connection is None:
        return []
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
        SELECT a.* FROM drowsiness_alerts a
        JOIN driver_sessions s ON a.session_id = s.id
        WHERE s.driver_id = %s
        ORDER BY a.alert_time DESC
        LIMIT %s
        """, (driver_id, limit))
        
        alerts = cursor.fetchall()
        return alerts
    except Error as e:
        print(f"Error fetching alerts: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Get recommended threshold adjustments based on driver history
def get_threshold_recommendations(driver_id):
    connection = create_db_connection()
    if connection is None:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get average EAR from last 7 days
        cursor.execute("""
        SELECT AVG(avg_ear) as avg_ear FROM driver_statistics
        WHERE driver_id = %s AND date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
        """, (driver_id,))
        
        stats = cursor.fetchone()
        if not stats or stats['avg_ear'] is None:
            return None
        
        # Get current settings
        cursor.execute("SELECT * FROM driver_settings WHERE driver_id = %s", (driver_id,))
        settings = cursor.fetchone()
        if not settings:
            return None
        
        # Calculate recommended EAR threshold
        # Use a percentage of the driver's average EAR as the threshold
        avg_ear = float(stats['avg_ear'])
        recommended_ear_threshold = round(avg_ear * 0.75, 3)
        
        # Don't let it get too high or too low
        recommended_ear_threshold = max(0.18, min(0.3, recommended_ear_threshold))
        
        return {
            'current_ear_threshold': settings['ear_threshold'],
            'recommended_ear_threshold': recommended_ear_threshold,
            'avg_ear': avg_ear
        }
    except Error as e:
        print(f"Error calculating recommendations: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Function to download files if they don't exist (you'd need to replace these URLs)
def ensure_file_exists(file_path, url):
    if not os.path.exists(file_path):
        print(f"Downloading {file_path}...")
        r = requests.get(url)
        with open(file_path, 'wb') as f:
            f.write(r.content)
        print(f"Downloaded {file_path}")

# Check if model files exist, provide placeholders if not
def check_model_files():
    if not os.path.exists(MODEL_PATH):
        print("Warning: Drowsiness model not found. Using fallback detection.")
    if not os.path.exists(LANDMARKS_PATH):
        print("Warning: Face landmarks model not found. Using fallback detection.")
    if not os.path.exists(ALARM_SOUND_PATH):
        print("Warning: Alarm sound not found. Using fallback sound.")
        # Create a simple beep sound
        pygame.mixer.init()
        sound = pygame.mixer.Sound("sounds/alarm.wav")
        with open(ALARM_SOUND_PATH, 'wb') as f:
            f.write(sound._samples)

# Initialize serial connection to Arduino
def initialize_serial():
    global arduino_serial
    try:
        arduino_serial = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)  # Allow time for the Arduino to reset
        print(f"Serial connection established on {SERIAL_PORT}")
        return True
    except Exception as e:
        print(f"Failed to connect to Arduino via serial: {e}")
        return False

# Function to send alert to Arduino over WiFi or serial
def send_alert_to_arduino(is_drowsy):
    global last_alert_status, arduino_serial
    
    # Only send if status has changed
    if is_drowsy != last_alert_status:
        try:
            if arduino_serial is None or not arduino_serial.is_open:
                if not initialize_serial():
                    print("Could not initialize serial connection")
                    return False
            
            if is_drowsy:
                arduino_serial.write(b'D\n')  # 'D' for drowsy
                print("Drowsiness alert sent to Arduino via serial")
            else:
                arduino_serial.write(b'A\n')  # 'A' for alert cleared
                print("Alert cleared via serial")
            
            # Wait for acknowledgment
            response = arduino_serial.readline().decode('utf-8').strip()
            print(f"Arduino response: {response}")
            
            last_alert_status = is_drowsy
            return True
        except Exception as e:
            print(f"Failed to communicate with Arduino via serial: {e}")
            try:
                if arduino_serial and arduino_serial.is_open:
                    arduino_serial.close()
                arduino_serial = None
            except:
                pass
            return False
    return True

# Eye Aspect Ratio Calculation
def get_eye_aspect_ratio(eye_points, facial_landmarks):
    eye = []
    for i in eye_points:
        eye.append((facial_landmarks.part(i).x, facial_landmarks.part(i).y))
    
    eye = np.array(eye)
    
    # Compute the distances
    A = np.linalg.norm(eye[1] - eye[5])
    B = np.linalg.norm(eye[2] - eye[4])
    C = np.linalg.norm(eye[0] - eye[3])
    
    # Calculate EAR
    ear = (A + B) / (2.0 * C)
    return ear

# Head Pose Estimation
def get_head_pose(landmarks):
    image_points = np.array([
        (landmarks.part(30).x, landmarks.part(30).y),  # Nose tip
        (landmarks.part(8).x, landmarks.part(8).y),    # Chin
        (landmarks.part(36).x, landmarks.part(36).y),  # Left eye left corner
        (landmarks.part(45).x, landmarks.part(45).y),  # Right eye right corner
        (landmarks.part(48).x, landmarks.part(48).y),  # Left mouth corner
        (landmarks.part(54).x, landmarks.part(54).y)   # Right mouth corner
    ], dtype="double")

    model_points = np.array([
        (0.0, 0.0, 0.0),
        (0.0, -330.0, -65.0),
        (-225.0, 170.0, -135.0),
        (225.0, 170.0, -135.0),
        (-150.0, -150.0, -125.0),
        (150.0, -150.0, -125.0)
    ])

    focal_length = 1.0
    center = (0.0, 0.0)
    camera_matrix = np.array([
        [focal_length, 0, center[0]],
        [0, focal_length, center[1]],
        [0, 0, 1]
    ])

    dist_coeffs = np.zeros((4, 1))

    _, rotation_vector, translation_vector = cv2.solvePnP(model_points, image_points, camera_matrix, dist_coeffs)
    rotation_matrix, _ = cv2.Rodrigues(rotation_vector)

    sy = math.sqrt(rotation_matrix[0, 0] ** 2 + rotation_matrix[1, 0] ** 2)
    singular = sy < 1e-6
    if not singular:
        x = math.atan2(rotation_matrix[2, 1], rotation_matrix[2, 2])
        y = math.atan2(-rotation_matrix[2, 0], sy)
        z = math.atan2(rotation_matrix[1, 0], rotation_matrix[0, 0])
    else:
        x = math.atan2(-rotation_matrix[1, 2], rotation_matrix[1, 1])
        y = math.atan2(-rotation_matrix[2, 0], sy)
        z = 0

    # Convert from radians to degrees
    x, y, z = math.degrees(x), math.degrees(y), math.degrees(z)
    
    return z, y, x  # yaw, pitch, roll

# Fatigue Level Prediction based on EAR and Head Tilt
def predict_fatigue_level(ear, pitch):
    if ear < 0.2 and abs(pitch) > 20:
        return "Severe Fatigue"
    elif ear < 0.3 or abs(pitch) > 15:
        return "Moderate Fatigue"
    elif ear < 0.35:
        return "Mild Fatigue"
    else:
        return "Not Drowsy"

# Fallback detection when models are not available
def fallback_detection(frame):
    global detection_results, COUNTER, ALERT, blink_count, current_driver_id, current_session_id
    
    # Generate random but consistent values
    t = time.time()
    detection_results["earValue"] = 0.3 + 0.05 * math.sin(t)
    detection_results["headPose"]["yaw"] = 10 * math.sin(t / 5)
    detection_results["headPose"]["pitch"] = 10 * math.cos(t / 3)
    detection_results["headPose"]["roll"] = 5 * math.sin(t / 4)
    
    # Simulate blinks
    if random.random() > 0.95:
        blink_count += 1
        detection_results["blinkCount"] = blink_count
        
        # Update statistics if a driver is selected
        if current_driver_id:
            update_driver_statistics(current_driver_id, detection_results["earValue"], blink_detected=True)
    
    # Update drowsiness based on simulated EAR
    if detection_results["earValue"] < EAR_THRESHOLD:
        COUNTER += 1
        if COUNTER >= CONSEC_FRAMES:
            detection_results["isDrowsy"] = True
            detection_results["fatigueLevel"] = "Moderate Fatigue"
            
            # Log alert if not already triggered and a session is active
            if not ALERT and current_session_id:
                log_drowsiness_alert(
                    current_session_id,
                    detection_results["earValue"],
                    detection_results["fatigueLevel"],
                    detection_results["headPose"]["yaw"],
                    detection_results["headPose"]["pitch"],
                    detection_results["headPose"]["roll"]
                )
                
                # Update statistics if a driver is selected
                if current_driver_id:
                    update_driver_statistics(current_driver_id, detection_results["earValue"], drowsiness_detected=True)
            
            if not ALERT:
                # Play sound
                if pygame.mixer.get_init():
                    pygame.mixer.Sound(ALARM_SOUND_PATH).play()
                
                # Send alert to Arduino
                send_alert_to_arduino(True)
                
                ALERT = True
    else:
        COUNTER = 0
        detection_results["isDrowsy"] = False
        detection_results["fatigueLevel"] = "Mild Fatigue"
        
        if ALERT:
            # Clear alert status
            send_alert_to_arduino(False)
            ALERT = False
    
    detection_results["counter"] = COUNTER
    
    # Draw some visual cues on the frame
    height, width = frame.shape[:2]
    # Draw a face oval
    cv2.ellipse(frame, (width//2, height//2), (100, 140), 0, 0, 360, (0, 255, 0), 2)
    # Draw eyes
    eye_y = height//2 - 20
    left_eye_x = width//2 - 40
    right_eye_x = width//2 + 40
    # Calculate eye openness
    openness = max(5, (detection_results["earValue"] - 0.15) * 80)
    # Draw eyes
    cv2.ellipse(frame, (left_eye_x, eye_y), (20, int(openness)), 0, 0, 360, (0, 255, 0), 2)
    cv2.ellipse(frame, (right_eye_x, eye_y), (20, int(openness)), 0, 0, 360, (0, 255, 0), 2)
    # Draw mouth
    cv2.ellipse(frame, (width//2, height//2 + 50), (30, 15), 0, 0, 360, (0, 255, 0), 2)
    
    # Add text
    cv2.putText(frame, f"EAR: {detection_results['earValue']:.3f}", (10, 30), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    cv2.putText(frame, f"Drowsy: {detection_results['isDrowsy']}", (10, 60), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255) if detection_results['isDrowsy'] else (0, 255, 0), 2)
    
    # If driver profile is active, show driver name
    if current_driver_id:
        driver = get_driver(current_driver_id)
        if driver:
            cv2.putText(frame, f"Driver: {driver['name']}", (10, 90), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
    
    return frame

# Main detection function
def detect_drowsiness(frame):
    global detection_results, COUNTER, ALERT, blink_count, blink_start_time, current_driver_id, current_session_id
    
    # If no detector or predictor available, use fallback
    if detector is None or predictor is None:
        return fallback_detection(frame)
    
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray)
    
    # Default state - if no face is detected
    if not faces:
        return frame

    # Process each face detected
    for face in faces:
        landmarks = predictor(gray, face)

        # Calculate Eye Aspect Ratio (EAR) for both eyes
        left_eye = [36, 37, 38, 39, 40, 41]
        right_eye = [42, 43, 44, 45, 46, 47]
        left_ear = get_eye_aspect_ratio(left_eye, landmarks)
        right_ear = get_eye_aspect_ratio(right_eye, landmarks)
        ear = (left_ear + right_ear) / 2.0

        # Head pose estimation
        yaw, pitch, roll = get_head_pose(landmarks)

        # Predict fatigue level based on EAR and head pose
        fatigue_level = predict_fatigue_level(ear, pitch)

        # Update global detection results
        detection_results["earValue"] = ear
        detection_results["headPose"] = {"yaw": yaw, "pitch": pitch, "roll": roll}
        detection_results["fatigueLevel"] = fatigue_level

        # Draw facial landmarks
        for n in range(0, 68):
            x = landmarks.part(n).x
            y = landmarks.part(n).y
            cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)

        # Draw rectangles around the eyes
        left_eye_rect = cv2.convexHull(np.array([(landmarks.part(n).x, landmarks.part(n).y) for n in left_eye]))
        right_eye_rect = cv2.convexHull(np.array([(landmarks.part(n).x, landmarks.part(n).y) for n in right_eye]))
        cv2.drawContours(frame, [left_eye_rect], -1, (0, 255, 0), 1)
        cv2.drawContours(frame, [right_eye_rect], -1, (0, 255, 0), 1)

        # Check for blinking
        if ear < blink_threshold:
            # Possible blink detected
            if blink_start_time is None:
                blink_start_time = time.time()
        else:
            # Eyes are open
            if blink_start_time is not None:
                # Check if blink duration is within normal range
                blink_duration = time.time() - blink_start_time
                if blink_duration < blink_duration_threshold:
                    blink_count += 1
                    detection_results["blinkCount"] = blink_count
                    
                    # Update statistics if active session
                    if current_session_id and current_driver_id:
                        update_driver_statistics(current_driver_id, ear, blink_detected=True)
                
                blink_start_time = None

        # Check for drowsiness based on EAR
        if ear < EAR_THRESHOLD:
            COUNTER += 1
            # Update HUD
            cv2.putText(frame, f"EAR: {ear:.2f} < {EAR_THRESHOLD}", (10, 30), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
            # Check if drowsiness is persistent
            if COUNTER >= CONSEC_FRAMES:
                # Driver is drowsy
                detection_results["isDrowsy"] = True
                
                # Log alert if not already triggered
                if not ALERT and current_session_id:
                    log_drowsiness_alert(
                        current_session_id,
                        ear,
                        fatigue_level,
                        yaw,
                        pitch,
                        roll
                    )
                    
                    # Update statistics
                    if current_driver_id:
                        update_driver_statistics(current_driver_id, ear, drowsiness_detected=True)
                
                # Trigger alarm if not already active
                if not ALERT:
                    # Play sound
                    if alarm_sound:
                        alarm_sound.play()
                    
                    # Send alert to Arduino
                    send_alert_to_arduino(True)
                    
                    ALERT = True
                
                # Visual indicator for drowsiness
                cv2.putText(frame, "DROWSINESS ALERT!", (10, 60), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            
        else:
            # Reset counter if eyes are sufficiently open
            COUNTER = 0
            detection_results["isDrowsy"] = False
            
            if ALERT:
                # Clear alert status
                send_alert_to_arduino(False)
                ALERT = False
            
            # Update HUD
            cv2.putText(frame, f"EAR: {ear:.2f}", (10, 30), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Update detection results counter
        detection_results["counter"] = COUNTER
        
        # Display head pose information
        cv2.putText(frame, f"Head Yaw: {yaw:.1f}", (10, 90), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        cv2.putText(frame, f"Head Pitch: {pitch:.1f}", (10, 120), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        cv2.putText(frame, f"Head Roll: {roll:.1f}", (10, 150), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        # Display blink count
        cv2.putText(frame, f"Blink Count: {blink_count}", (10, 180), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # Display fatigue level
        cv2.putText(frame, f"Fatigue: {fatigue_level}", (10, 210), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        
        # If driver profile is active, show driver name
        if current_driver_id:
            driver = get_driver(current_driver_id)
            if driver:
                cv2.putText(frame, f"Driver: {driver['name']}", (10, 240), 
                          cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
    
    return frame

# Initialize computer vision components
try:
    # Check if model files exist
    check_model_files()
    
    # Initialize detector
    detector = dlib.get_frontal_face_detector()
    
    # Try to load the predictor if it exists
    if os.path.exists(LANDMARKS_PATH):
        predictor = dlib.shape_predictor(LANDMARKS_PATH)
    else:
        predictor = None
    
    # Try to load the model if it exists
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
    else:
        model = None
    
    # Initialize pygame for audio
    pygame.mixer.init()
    if os.path.exists(ALARM_SOUND_PATH):
        alarm_sound = pygame.mixer.Sound(ALARM_SOUND_PATH)
    else:
        alarm_sound = None
    
except Exception as e:
    print(f"Error initializing components: {e}")
    detector = None
    predictor = None
    model = None
    alarm_sound = None

# Initialize database
initialize_database()

# Video streaming generator function
def generate_frames():
    global cam, stop_event, current_frame
    
    try:
        while not stop_event.is_set():
            if cam is None or current_frame is None:
                # If camera isn't initialized or frame isn't available, return a blank frame
                blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(blank_frame, "Camera not started", (150, 240), 
                          cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                ret, buffer = cv2.imencode('.jpg', blank_frame)
                frame = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
                time.sleep(0.1)  # Don't hammer CPU with blank frames
            else:
                with frame_lock:
                    if current_frame is not None:
                        # Copy the frame to avoid modification while it's being encoded
                        frame_to_send = current_frame.copy()
                
                # Encode the frame to JPEG
                try:
                    ret, buffer = cv2.imencode('.jpg', frame_to_send)
                    frame_bytes = buffer.tobytes()
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                except Exception as e:
                    print(f"Error encoding frame: {e}")
                    time.sleep(0.1)
    except GeneratorExit:
        print("Video stream client disconnected")
    except Exception as e:
        print(f"Error in frame generator: {e}")

# Continuous video processing function
def process_video():
    global cam, stop_event, current_frame
    
    try:
        while not stop_event.is_set():
            ret, frame = cam.read()
            if not ret:
                print("Failed to grab frame")
                time.sleep(0.1)
                continue
            
            # Process the frame for drowsiness detection
            processed_frame = detect_drowsiness(frame)
            
            # Update the current frame
            with frame_lock:
                current_frame = processed_frame
            
            # Small sleep to reduce CPU usage
            time.sleep(0.01)
    except Exception as e:
        print(f"Error in video processing thread: {e}")
    finally:
        if cam is not None:
            cam.release()
            cam = None
        print("Video processing stopped")

# Route for video streaming
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# Route to start detection
@app.route('/start')
def start_detection():
    global cam, detection_thread, stop_event, current_driver_id, current_session_id
    
    # Check if we have an active driver
    if current_driver_id is None:
        return jsonify({"error": "No driver selected. Please select a driver profile first."}), 400
    
    # Check if already running
    if cam is not None and detection_thread is not None and detection_thread.is_alive():
        return jsonify({"message": "Detection already running"})
    
    # Clear stop event
    stop_event.clear()
    
    # Initialize camera
    try:
        cam = cv2.VideoCapture(0)  # Use default camera
        if not cam.isOpened():
            return jsonify({"error": "Could not open camera"}), 500
        
        # Start video processing in a separate thread
        detection_thread = threading.Thread(target=process_video)
        detection_thread.daemon = True
        detection_thread.start()
        
        # Update detection status
        detection_results["isRunning"] = True
        
        return jsonify({"message": "Detection started successfully"})
    except Exception as e:
        if cam is not None:
            cam.release()
            cam = None
        return jsonify({"error": f"Error starting detection: {str(e)}"}), 500

# Route to stop detection
@app.route('/stop')
def stop_detection():
    global cam, detection_thread, stop_event, COUNTER, ALERT, blink_count, blink_start_time
    
    # Set stop event to signal thread to stop
    stop_event.set()
    
    # Wait for thread to finish (with timeout)
    if detection_thread is not None and detection_thread.is_alive():
        detection_thread.join(timeout=3.0)
    
    # Reset variables
    COUNTER = 0
    ALERT = False
    blink_count = 0
    blink_start_time = None
    
    # Update detection status
    detection_results["isRunning"] = False
    detection_results["isDrowsy"] = False
    detection_results["counter"] = 0
    detection_results["blinkCount"] = 0
    
    return jsonify({"message": "Detection stopped successfully"})

# Route to get current status
@app.route('/status')
def get_status():
    return jsonify(detection_results)

# Driver profile management API routes
@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    drivers = get_all_drivers()
    return jsonify(drivers)

@app.route('/api/drivers', methods=['POST'])
def create_driver():
    data = request.json
    name = data.get('name')
    age = data.get('age')
    experience = data.get('driving_experience_years')
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    driver_id = add_driver(name, age, experience)
    if driver_id:
        return jsonify({'id': driver_id, 'message': 'Driver created successfully'}), 201
    else:
        return jsonify({'error': 'Failed to create driver'}), 500

@app.route('/api/drivers/<int:driver_id>', methods=['GET'])
def get_driver_info(driver_id):
    driver = get_driver(driver_id)
    if driver:
        return jsonify(driver)
    else:
        return jsonify({'error': 'Driver not found'}), 404

@app.route('/api/drivers/<int:driver_id>/settings', methods=['PUT'])
def update_settings(driver_id):
    data = request.json
    ear_threshold = data.get('ear_threshold')
    consecutive_frames = data.get('consecutive_frames')
    blink_threshold = data.get('blink_threshold')
    head_pose_sensitivity = data.get('head_pose_sensitivity')
    
    success = update_driver_settings(
        driver_id, 
        ear_threshold, 
        consecutive_frames, 
        blink_threshold, 
        head_pose_sensitivity
    )
    
    if success:
        return jsonify({'message': 'Settings updated successfully'})
    else:
        return jsonify({'error': 'Failed to update settings'}), 500

@app.route('/api/drivers/<int:driver_id>/statistics', methods=['GET'])
def get_stats(driver_id):
    days = request.args.get('days', default=7, type=int)
    statistics = get_driver_statistics(driver_id, days)
    return jsonify(statistics)

@app.route('/api/drivers/<int:driver_id>/alerts', methods=['GET'])
def get_alerts(driver_id):
    limit = request.args.get('limit', default=50, type=int)
    alerts = get_driver_alerts(driver_id, limit)
    return jsonify(alerts)

@app.route('/api/drivers/<int:driver_id>/recommendations', methods=['GET'])
def get_recommendations(driver_id):
    recommendations = get_threshold_recommendations(driver_id)
    if recommendations:
        return jsonify(recommendations)
    else:
        return jsonify({'error': 'Unable to generate recommendations'}), 404

@app.route('/api/session/start', methods=['POST'])
def start_session():
    global current_driver_id, current_session_id, EAR_THRESHOLD, CONSEC_FRAMES, blink_threshold
    
    data = request.json
    driver_id = data.get('driver_id')
    
    if not driver_id:
        return jsonify({'error': 'Driver ID is required'}), 400
    
    # End any existing session
    if current_session_id:
        end_driver_session(current_session_id)
    
    # Start new session
    session_id = start_driver_session(driver_id)
    if session_id:
        current_driver_id = driver_id
        current_session_id = session_id
        
        # Load driver's settings
        driver = get_driver(driver_id)
        if driver and 'settings' in driver:
            EAR_THRESHOLD = driver['settings']['ear_threshold']
            CONSEC_FRAMES = driver['settings']['consecutive_frames']
            blink_threshold = driver['settings']['blink_threshold']
        
        return jsonify({
            'session_id': session_id,
            'driver_id': driver_id,
            'message': 'Session started successfully'
        })
    else:
        return jsonify({'error': 'Failed to start session'}), 500

@app.route('/api/session/end', methods=['POST'])
def end_session():
    global current_driver_id, current_session_id
    
    if not current_session_id:
        return jsonify({'error': 'No active session'}), 400
    
    success = end_driver_session(current_session_id)
    if success:
        current_driver_id = None
        session_id = current_session_id
        current_session_id = None
        return jsonify({
            'session_id': session_id,
            'message': 'Session ended successfully'
        })
    else:
        return jsonify({'error': 'Failed to end session'}), 500

@app.route('/api/session/status', methods=['GET'])
def session_status():
    global current_driver_id, current_session_id
    return jsonify({
        'active': current_session_id is not None,
        'driver_id': current_driver_id,
        'session_id': current_session_id
    })

# Run the app
if __name__ == '__main__':
    # Try to load models before starting
    try:
        check_model_files()
    except Exception as e:
        print(f"Warning: Error checking model files: {e}")
    
    # Try to establish serial connection to Arduino
    try:
        initialize_serial()
    except Exception as e:
        print(f"Warning: Error initializing serial: {e}")
    
    # Run the app
    app.run(debug=True, threaded=True)


