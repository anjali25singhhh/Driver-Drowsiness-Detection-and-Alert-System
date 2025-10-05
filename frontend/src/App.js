// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Container, Row, Col, Card, Button, Alert, ProgressBar } from 'react-bootstrap';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlay, faStop, faExclamationTriangle, faBed, faEye, faHeadSideMask } from '@fortawesome/free-solid-svg-icons';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.css';
// import DrowsinessGauge from './components/DrowsinessGauge';
// import HeadPoseVisualizer from './components/HeadPoseVisualizer';
// import AlertHistoryTable from './components/AlertHistoryTable';


// function App() {
//   const [isRunning, setIsRunning] = useState(false);
//   const [status, setStatus] = useState({
//     isDrowsy: false,
//     earValue: 0.35,
//     fatigueLevel: "Not Drowsy",
//     blinkCount: 0,
//     headPose: { yaw: 0, pitch: 0, roll: 0 },
//     alertHistory: [],
//     counter: 0
//   });
//   const [alertData, setAlertData] = useState([]);
//   const [earHistory, setEarHistory] = useState([]);
//   const [error, setError] = useState(null);

//   const API_BASE_URL = 'http://localhost:5000';
  
//   useEffect(() => {
//     let statusInterval;
    
//     if (isRunning) {
//       // Poll for status updates every 500ms when system is running
//       statusInterval = setInterval(fetchStatus, 500);
//     }
    
//     return () => {
//       if (statusInterval) clearInterval(statusInterval);
//     };
//   }, [isRunning]);

  
//   useEffect(() => {
//     // Update EAR history when new values come in
//     if (isRunning && status.earValue) {
//       const timestamp = new Date().toLocaleTimeString();
//       setEarHistory(prev => {
//         const newHistory = [...prev, { time: timestamp, ear: status.earValue }];
//         // Keep only the last 20 data points for the chart
//         return newHistory.slice(-20);
//       });
//     }
    
//     // Update alert history
//     if (status.isDrowsy && !alertData.some(alert => alert.time === new Date().toLocaleTimeString())) {
//       setAlertData(prev => [...prev, { 
//         time: new Date().toLocaleTimeString(), 
//         level: status.fatigueLevel, 
//         ear: status.earValue,
//         headPose: status.headPose
//       }]);
//     }
//   }, [status, isRunning]);

//   const fetchStatus = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/status`);
//       setStatus(response.data);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching status:', err);
//       setError('Failed to connect to the server. Please ensure the backend is running.');
//     }
//   };

//   const startDetection = async () => {
//     try {
//       await axios.get(`${API_BASE_URL}/start`);
//       setIsRunning(true);
//       setError(null);
//     } catch (err) {
//       console.error('Error starting detection:', err);
//       setError('Failed to start detection. Please check if the camera is accessible and the backend is running.');
//     }
//   };

//   const stopDetection = async () => {
//     try {
//       await axios.get(`${API_BASE_URL}/stop`);
//       setIsRunning(false);
//     } catch (err) {
//       console.error('Error stopping detection:', err);
//       setError('Failed to stop detection. The application might need to be restarted.');
//     }
//   };

//   const getFatigueLevelColor = (level) => {
//     switch (level) {
//       case 'Severe Fatigue': return 'danger';
//       case 'Moderate Fatigue': return 'warning';
//       case 'Mild Fatigue': return 'info';
//       default: return 'success';
//     }
//   };

//   return (
//     <Container fluid className="app-container p-4">
//       <h1 className="text-center mb-4">Drowsiness Detection System</h1>
      
//       {error && <Alert variant="danger">{error}</Alert>}
      
//       <Row className="mb-4">
//         <Col xs={12} className="text-center">
//           <Button 
//             variant={isRunning ? "danger" : "primary"} 
//             size="lg" 
//             onClick={isRunning ? stopDetection : startDetection}
//             className="control-button"
//           >
//             <FontAwesomeIcon icon={isRunning ? faStop : faPlay} /> 
//             {isRunning ? " Stop Detection" : " Start Detection"}
//           </Button>
//         </Col>
//       </Row>
      
//       <Row>
//         <Col md={8}>
//           <Card className="mb-4">
//             <Card.Header as="h5">Video Feed</Card.Header>
//             <Card.Body className="video-container">
//               {isRunning ? (
//                 <img 
//                   src={`${API_BASE_URL}/video_feed`} 
//                   alt="Drowsiness detection video feed" 
//                   className="video-feed"
//                 />
//               ) : (
//                 <div className="camera-placeholder">
//                   <p>Camera feed will appear here when detection starts</p>
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
        
//         <Col md={4}>
//           <Card className="mb-4">
//             <Card.Header as="h5">Detection Status</Card.Header>
//             <Card.Body>
//               <div className="status-indicator">
//                 <DrowsinessGauge 
//                   isAwake={!status.isDrowsy} 
//                   earValue={status.earValue} 
//                   fatigueLevel={status.fatigueLevel}
//                 />
//               </div>
              
//               <Alert variant={status.isDrowsy ? "danger" : "success"} className="text-center">
//                 <FontAwesomeIcon icon={status.isDrowsy ? faExclamationTriangle : faEye} className="me-2" />
//                 {status.isDrowsy ? "DROWSINESS DETECTED!" : "Driver Alert"}
//               </Alert>
              
//               <div className="mt-3">
//                 <h6>Eye Openness (EAR): {status.earValue.toFixed(3)}</h6>
//                 <ProgressBar 
//                   now={Math.min(status.earValue * 100, 100)} 
//                   variant={status.earValue < 0.25 ? "danger" : "success"} 
//                 />
//               </div>
              
//               <div className="mt-3">
//                 <h6>Fatigue Level</h6>
//                 <Alert variant={getFatigueLevelColor(status.fatigueLevel)} className="mb-0">
//                   <FontAwesomeIcon icon={faBed} className="me-2" />
//                   {status.fatigueLevel}
//                 </Alert>
//               </div>
              
//               <div className="mt-3">
//                 <h6>Blink Count: {status.blinkCount}</h6>
//               </div>
//             </Card.Body>
//           </Card>
          
//           <Card className="mb-4">
//             <Card.Header as="h5">Head Position</Card.Header>
//             <Card.Body>
//               <HeadPoseVisualizer headPose={status.headPose} />
//               <div className="head-pose-values mt-2">
//                 <div><strong>Yaw:</strong> {status.headPose.yaw.toFixed(2)}°</div>
//                 <div><strong>Pitch:</strong> {status.headPose.pitch.toFixed(2)}°</div>
//                 <div><strong>Roll:</strong> {status.headPose.roll.toFixed(2)}°</div>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
      
//       <Row>
//         <Col md={8}>
//           <Card className="mb-4">
//             <Card.Header as="h5">EAR Monitoring</Card.Header>
//             <Card.Body>
//               <ResponsiveContainer width="100%" height={250}>
//                 <LineChart
//                   data={earHistory}
//                   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="time" />
//                   <YAxis domain={[0, 0.5]} />
//                   <Tooltip />
//                   <Legend />
//                   <Line 
//                     type="monotone" 
//                     dataKey="ear" 
//                     name="Eye Aspect Ratio" 
//                     stroke="#8884d8" 
//                     activeDot={{ r: 8 }} 
//                   />
//                   {/* Draw threshold line */}
//                   <Line 
//                     type="monotone" 
//                     dataKey={() => 0.25} 
//                     name="Drowsiness Threshold" 
//                     stroke="red" 
//                     strokeDasharray="5 5" 
//                     dot={false}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Card.Body>
//           </Card>
//         </Col>
        
//         <Col md={4}>
//           <Card>
//             <Card.Header as="h5">Alert History</Card.Header>
//             <Card.Body>
//               <AlertHistoryTable alerts={alertData} />
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, ProgressBar, Tabs, Tab,Badge } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faExclamationTriangle, faBed, faEye, faHeadSideMask, faUser } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import DrowsinessGauge from './components/DrowsinessGauge';
import HeadPoseVisualizer from './components/HeadPoseVisualizer';
import AlertHistoryTable from './components/AlertHistoryTable';
import DriverProfileManager from './components/DriverProfileManager';
import DriverDashboard from './components/DriverDashboard';
import DriverSettings from './components/DriverSettings';



function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState({
    isDrowsy: false,
    earValue: 0.35,
    fatigueLevel: "Not Drowsy",
    blinkCount: 0,
    headPose: { yaw: 0, pitch: 0, roll: 0 },
    alertHistory: [],
    counter: 0
  });
  const [alertData, setAlertData] = useState([]);
  const [earHistory, setEarHistory] = useState([]);
  const [error, setError] = useState(null);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [activeTab, setActiveTab] = useState('monitoring');
  const [currentDriverName, setCurrentDriverName] = useState('');

  const API_BASE_URL = 'http://localhost:5000';
  
  useEffect(() => {
    let statusInterval;
    
    if (isRunning) {
      // Poll for status updates every 500ms when system is running
      statusInterval = setInterval(fetchStatus, 500);
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [isRunning]);
  
  useEffect(() => {
    // Check session status when component mounts
    checkSessionStatus();
  }, []);

  useEffect(() => {
    // Update EAR history when new values come in
    if (isRunning && status.earValue) {
      const timestamp = new Date().toLocaleTimeString();
      setEarHistory(prev => {
        const newHistory = [...prev, { time: timestamp, ear: status.earValue }];
        // Keep only the last 20 data points for the chart
        return newHistory.slice(-20);
      });
    }
    
    // Update alert history
    if (status.isDrowsy && !alertData.some(alert => alert.time === new Date().toLocaleTimeString())) {
      setAlertData(prev => [...prev, { 
        time: new Date().toLocaleTimeString(), 
        level: status.fatigueLevel, 
        ear: status.earValue,
        headPose: status.headPose
      }]);
    }
  }, [status, isRunning]);

  const checkSessionStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/session/status`);
      if (response.data.active) {
        setCurrentDriverId(response.data.driver_id);
      }
    } catch (err) {
      console.error('Error checking session status:', err);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      setStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching status:', err);
      setError('Failed to connect to the server. Please ensure the backend is running.');
    }
  };

  const startDetection = async () => {
    try {
      if (!currentDriverId) {
        setError('Please select a driver profile before starting detection.');
        return;
      }
      
      await axios.get(`${API_BASE_URL}/start`);
      setIsRunning(true);
      setError(null);
    } catch (err) {
      console.error('Error starting detection:', err);
      setError('Failed to start detection. Please check if the camera is accessible and the backend is running.');
    }
  };

  const stopDetection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/stop`);
      setIsRunning(false);
    } catch (err) {
      console.error('Error stopping detection:', err);
      setError('Failed to stop detection. The application might need to be restarted.');
    }
  };

  const handleDriverSelect = (driverId, driverName) => {
    setCurrentDriverId(driverId);
    setCurrentDriverName(driverName);
    // Other driver selection logic...
  };
  

  const getFatigueLevelColor = (level) => {
    switch (level) {
      case 'Severe Fatigue': return 'danger';
      case 'Moderate Fatigue': return 'warning';
      case 'Mild Fatigue': return 'info';
      default: return 'success';
    }
  };

  return (
    <Container fluid className="app-container p-4">
      <h1 className="text-center mb-4">Drowsiness Detection System</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="monitoring" title="Monitoring">
          <Row className="mb-4">
            <Col xs={12} className="text-center">
              <Button 
                variant={isRunning ? "danger" : "primary"} 
                size="lg" 
                onClick={isRunning ? stopDetection : startDetection}
                className="control-button"
                disabled={!currentDriverId}
              >
                <FontAwesomeIcon icon={isRunning ? faStop : faPlay} /> 
                {isRunning ? " Stop Detection" : " Start Detection"}
              </Button>
              
              {!currentDriverId && (
                <div className="mt-2 text-danger">
                  <small>Please select a driver profile from the Driver Profiles tab before starting</small>
                </div>
              )}
              
              {currentDriverId && (
                <div className="mt-2">
                  <Badge bg="info">
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                    {`Active Driver: ${currentDriverName || `ID: ${currentDriverId}`}`}
                  </Badge>
                </div>
              )}
            </Col>
          </Row>
          
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header as="h5">Video Feed</Card.Header>
                <Card.Body className="video-container">
                  {isRunning ? (
                    <img 
                      src={`${API_BASE_URL}/video_feed`} 
                      alt="Drowsiness detection video feed" 
                      className="video-feed"
                    />
                  ) : (
                    <div className="camera-placeholder">
                      <p>Camera feed will appear here when detection starts</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header as="h5">Detection Status</Card.Header>
                <Card.Body>
                  <div className="status-indicator">
                    <DrowsinessGauge 
                      isAwake={!status.isDrowsy} 
                      earValue={status.earValue} 
                      fatigueLevel={status.fatigueLevel}
                    />
                  </div>
                  
                  <Alert variant={status.isDrowsy ? "danger" : "success"} className="text-center">
                    <FontAwesomeIcon icon={status.isDrowsy ? faExclamationTriangle : faEye} className="me-2" />
                    {status.isDrowsy ? "DROWSINESS DETECTED!" : "Driver Alert"}
                  </Alert>
                  
                  <div className="mt-3">
                    <h6>Eye Openness (EAR): {status.earValue.toFixed(3)}</h6>
                    <ProgressBar 
                      now={Math.min(status.earValue * 100, 100)} 
                      variant={status.earValue < 0.25 ? "danger" : "success"} 
                    />
                  </div>
                  
                  <div className="mt-3">
                    <h6>Fatigue Level</h6>
                    <Alert variant={getFatigueLevelColor(status.fatigueLevel)} className="mb-0">
                      <FontAwesomeIcon icon={faBed} className="me-2" />
                      {status.fatigueLevel}
                    </Alert>
                  </div>
                  
                  <div className="mt-3">
                    <h6>Blink Count: {status.blinkCount}</h6>
                  </div>
                </Card.Body>
              </Card>
              
              <Card className="mb-4">
                <Card.Header as="h5">Head Position</Card.Header>
                <Card.Body>
                  <HeadPoseVisualizer headPose={status.headPose} />
                  <div className="head-pose-values mt-2">
                    <div><strong>Yaw:</strong> {status.headPose.yaw.toFixed(2)}°</div>
                    <div><strong>Pitch:</strong> {status.headPose.pitch.toFixed(2)}°</div>
                    <div><strong>Roll:</strong> {status.headPose.roll.toFixed(2)}°</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header as="h5">EAR Monitoring</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={earHistory}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 0.5]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ear" 
                        name="Eye Aspect Ratio" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      {/* Draw threshold line */}
                      <Line 
                        type="monotone" 
                        dataKey={() => 0.25} 
                        name="Drowsiness Threshold" 
                        stroke="red" 
                        strokeDasharray="5 5" 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card>
                <Card.Header as="h5">Alert History</Card.Header>
                <Card.Body>
                  <AlertHistoryTable alerts={alertData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="drivers" title="Driver Profiles">
          <Row>
            <Col md={4}>
              <DriverProfileManager 
                onDriverSelect={handleDriverSelect} 
                currentDriverId={currentDriverId} 
              />
            </Col>
            <Col md={8}>
              <DriverDashboard driverId={currentDriverId} />
            </Col>
          </Row>
        </Tab>
        
        <Tab eventKey="settings" title="Settings">
          <Row>
            <Col md={12}>
              <DriverSettings driverId={currentDriverId} />
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default App;