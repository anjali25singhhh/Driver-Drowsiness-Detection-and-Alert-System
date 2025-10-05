# Driver Drowsiness Detection and Alert System

A real-time driver drowsiness detection system that uses computer vision and machine learning to monitor driver alertness and prevent accidents caused by fatigue.

## 🚀 Features

- **Real-time Detection**: Monitors driver's eyes and facial expressions in real-time
- **Multiple Alert Methods**: Audio alerts + Arduino hardware integration (buzzer/LED)
- **Eye Aspect Ratio (EAR)**: Advanced algorithm to detect eye closure patterns
- **Blink Detection**: Analyzes blink frequency and duration
- **Head Pose Estimation**: Detects head nodding and unusual head positions
- **Machine Learning**: Optional TensorFlow model for enhanced accuracy
- **Web Dashboard**: React-based interface for monitoring and control
- **Data Visualization**: Real-time charts showing drowsiness metrics
- **Hardware Integration**: Serial and WiFi communication with Arduino

## 🛠️ Tech Stack

### Backend
- **Flask** - Web framework for API endpoints
- **OpenCV** - Computer vision and image processing
- **dlib** - Face detection and landmark extraction
- **TensorFlow/Keras** - Deep learning model (optional)
- **NumPy** - Numerical computations
- **pygame** - Audio alert system
- **pySerial** - Arduino communication
- **MySQL** - Database for logging (optional)

### Frontend
- **React 19** - User interface framework
- **React Router** - Navigation and routing
- **Recharts** - Data visualization and charts
- **Bootstrap** - UI components and styling
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations and transitions
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icons

### Hardware
- **Arduino** - Microcontroller for alerts
- **Buzzer/LED** - Physical alert mechanisms
- **Webcam** - Video input for detection

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- Webcam/Camera
- Arduino (optional, for hardware alerts)

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/anjali25singhhh/Driver-Drowsiness-Detection-and-Alert-System.git
cd Driver-Drowsiness-Detection-and-Alert-System
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install
```

### 4. Download Required Models (Optional)
- Download `shape_predictor_68_face_landmarks.dat` from dlib
- Place TensorFlow model file (`.h5`) in `backend/models/` if using ML enhancement

## 🚀 Usage

### 1. Start Backend Server
```bash
cd backend
python main.py
```
The Flask server will start on `http://localhost:5000`

### 2. Start Frontend Development Server
```bash
cd frontend
npm start
```
The React app will open at `http://localhost:3000`

### 3. Arduino Setup (Optional)
- Connect Arduino via USB or configure WiFi
- Upload the provided Arduino sketch
- Update `SERIAL_PORT` or `ARDUINO_IP` in `main.py`

## 📊 How It Works

### Detection Algorithm
1. **Face Detection**: Uses dlib's frontal face detector
2. **Landmark Extraction**: Identifies 68 facial landmarks
3. **Eye Aspect Ratio (EAR)**: Calculates EAR for both eyes
4. **Drowsiness Logic**: 
   - EAR < threshold for consecutive frames → Drowsy
   - Excessive blink frequency → Fatigue
   - Head pose deviation → Distraction
5. **Alert System**: Triggers audio and hardware alerts

### EAR Formula
```
EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
```

## 🎛️ API Endpoints

- `GET /status` - Current detection status and metrics
- `POST /control/start` - Start detection
- `POST /control/stop` - Stop detection
- `GET /history` - Alert history (if logging enabled)

## 🔧 Configuration

### Backend Configuration (`main.py`)
```python
EAR_THRESHOLD = 0.25          # Eye aspect ratio threshold
CONSEC_FRAMES = 30            # Consecutive frames for alert
ARDUINO_IP = "192.168.1.100"  # Arduino IP address
SERIAL_PORT = "COM3"          # Serial port for Arduino
```

### Frontend Configuration
- API endpoint: Update in frontend source if backend port changes
- Polling interval: Configurable in React components

## 📱 Screenshots

### Dashboard
![Dashboard Screenshot](screenshots/dashboard.png)

### Detection in Action
![Detection Screenshot](screenshots/detection.png)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **dlib** for facial landmark detection
- **OpenCV** community for computer vision tools
- **Flask** and **React** communities
- Research papers on drowsiness detection algorithms

## 📞 Contact

**Anjali Singh** - [GitHub](https://github.com/anjali25singhhh)

Project Link: [https://github.com/anjali25singhhh/Driver-Drowsiness-Detection-and-Alert-System](https://github.com/anjali25singhhh/Driver-Drowsiness-Detection-and-Alert-System)

## 🔮 Future Enhancements

- [ ] Mobile app integration
- [ ] Cloud deployment with Docker
- [ ] Multi-driver support
- [ ] Advanced ML models (YOLOv8, MediaPipe)
- [ ] Real-time video streaming
- [ ] Driver behavior analytics
- [ ] Integration with car systems

---

⭐ **Star this repository if you found it helpful!**