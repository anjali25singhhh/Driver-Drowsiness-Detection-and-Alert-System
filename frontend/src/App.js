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

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, faStop, faExclamationTriangle, faBed, faEye, faUser, faDownload, faFileExport,
  faTachometerAlt, faIdCard, faCog, faChartLine, faExpand, faCamera
} from '@fortawesome/free-solid-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './PremiumStyles.css';
import DriverProfileManager from './components/DriverProfileManager';
import DriverDashboard from './components/DriverDashboard';
import DriverSettings from './components/DriverSettings';
import DrowsinessHeatmap from './components/DrowsinessHeatmap';
import MultiMetricChart from './components/MultiMetricChart';
import HeadPoseRadar from './components/HeadPoseRadar';
import AlertnessRing from './components/AlertnessRing';
import AlertTimeline from './components/AlertTimeline';
import RecordingIndicator from './components/RecordingIndicator';
import VideoMetricsOverlay from './components/VideoMetricsOverlay';
import VideoControlsBar from './components/VideoControlsBar';
import { exportSessionReport, exportSessionCSV } from './utils/pdfExport';



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
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [headPoseHistory, setHeadPoseHistory] = useState([]);
  const [blinkHistory, setBlinkHistory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState('00:00:00');

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000';
  
  useEffect(() => {
    let statusInterval;
    
    if (isRunning) {
      // Immediate first fetch
      fetchStatus();
      // Poll for status updates every 200ms for faster response
      statusInterval = setInterval(fetchStatus, 200);
    }
    
    return () => {
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [isRunning]);
  
  useEffect(() => {
    // Check session status when component mounts
    checkSessionStatus();
  }, []);

  // Clock and session duration updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isRunning && sessionStartTime) {
        const diff = Date.now() - new Date(sessionStartTime).getTime();
        const hrs = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        setSessionDuration(`${hrs}:${mins}:${secs}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, sessionStartTime]);

  useEffect(() => {
    // Update EAR history when new values come in
    if (isRunning && status.earValue) {
      const timestamp = new Date().toLocaleTimeString();
      setEarHistory(prev => {
        const newHistory = [...prev, { time: timestamp, ear: status.earValue }];
        // Keep only the last 20 data points for the chart
        return newHistory.slice(-20);
      });
      
      // Track head pose history
      setHeadPoseHistory(prev => {
        const newHistory = [...prev, { ...status.headPose }];
        return newHistory.slice(-20);
      });
      
      // Track blink history
      setBlinkHistory(prev => {
        const newHistory = [...prev, { rate: status.blinkCount, time: timestamp }];
        return newHistory.slice(-20);
      });
    }
    
    // Update alert history without toast notification
    if (status.isDrowsy && !alertData.some(alert => alert.time === new Date().toLocaleTimeString())) {
      const newAlert = { 
        time: new Date().toLocaleTimeString(), 
        level: status.fatigueLevel, 
        ear: status.earValue,
        headPose: status.headPose
      };
      
      setAlertData(prev => [...prev, newAlert]);
      // Toast notifications removed - visual alerts on video feed are enough
    }
  }, [status, isRunning, alertData]);

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
      
      // Clear any previous errors
      setError(null);
      
      // Set running state immediately for instant UI feedback
      setIsRunning(true);
      setSessionStartTime(new Date());
      
      // Start detection and fetch status immediately
      const startPromise = axios.get(`${API_BASE_URL}/start`);
      
      // Don't wait for start to complete, fetch status immediately
      setTimeout(() => fetchStatus(), 50);
      setTimeout(() => fetchStatus(), 150);
      setTimeout(() => fetchStatus(), 300);
      
      await startPromise;
    } catch (err) {
      console.error('Error starting detection:', err);
      setIsRunning(false); // Revert on error
      // Don't show error message, just silently fail
    }
  };

  const stopDetection = async () => {
    try {
      await axios.get(`${API_BASE_URL}/stop`);
      setIsRunning(false);
      // No toast notification needed
    } catch (err) {
      console.error('Error stopping detection:', err);
      setIsRunning(false); // Force stop on error
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

  const handleExportPDF = async () => {
    try {
      const sessionData = {
        driverName: currentDriverName,
        startTime: sessionStartTime,
        endTime: new Date(),
        earHistory,
        alertData,
        statistics: true,
      };
      
      await exportSessionReport(sessionData);
      // No toast notification
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleExportCSV = () => {
    try {
      exportSessionCSV(earHistory, alertData);
      // No toast notification
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const getVideoAlertClass = () => {
    switch (status.fatigueLevel) {
      case 'Severe Fatigue': return 'alert-red';
      case 'Moderate Fatigue': return 'alert-orange';
      case 'Mild Fatigue': return 'alert-yellow';
      default: return '';
    }
  };

  const handleFullScreen = () => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const handleSnapshot = () => {
    const img = videoRef.current;
    if (!img) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `snapshot_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      window.open(img.src, '_blank');
    }
  };

  const initials = currentDriverName ? currentDriverName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : 'NA';

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">DDS</div>
        <button className={`sidebar-item ${activeTab === 'monitoring' ? 'active' : ''}`} onClick={() => setActiveTab('monitoring')} title="Monitoring">
          <FontAwesomeIcon icon={faTachometerAlt} />
        </button>
        <button className={`sidebar-item ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => setActiveTab('drivers')} title="Driver Profiles">
          <FontAwesomeIcon icon={faIdCard} />
        </button>
        <button className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title="Settings">
          <FontAwesomeIcon icon={faCog} />
        </button>
        <button className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} title="Analytics">
          <FontAwesomeIcon icon={faChartLine} />
        </button>
      </aside>

      {/* Main area */}
      <div className="main">
        <header className="app-header">
          <div className="header-left">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="logo-text">
              Drowsiness Detection System
            </motion.div>
            <div className="header-clock">
              <span>{currentTime.toLocaleTimeString()}</span>
              <span className={`session ${isRunning ? 'active' : ''}`}>⏱ {sessionDuration}</span>
              <RecordingIndicator isRecording={isRunning} />
            </div>
          </div>
          <div className="header-right">
            {currentDriverId ? (
              <div className="driver-badge">
                <div className="avatar-circle">{initials}</div>
                <div className="driver-name">{currentDriverName || `ID: ${currentDriverId}`}</div>
              </div>
            ) : (
              <Badge bg="warning" text="dark">No Driver Selected</Badge>
            )}
            <div className="header-actions">
              <Button 
                variant={isRunning ? 'danger' : 'primary'} 
                size="sm"
                onClick={isRunning ? stopDetection : startDetection}
                disabled={!currentDriverId}
              >
                <FontAwesomeIcon icon={isRunning ? faStop : faPlay} className="me-1"/>
                {isRunning ? 'Stop' : 'Start'}
              </Button>
            </div>
          </div>
        </header>

        <div className="content">
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          {activeTab === 'monitoring' && (
            <div className="content-grid">
              <div className="content-left">
                <Card className="glass-card">
                  <Card.Header as="h5">Video Feed</Card.Header>
                  <Card.Body ref={videoContainerRef} className={`video-container-modern ${getVideoAlertClass()}`}>
                    {isRunning ? (
                      <>
                        {/* Corner Brackets */}
                        <div className="video-corner top-left"></div>
                        <div className="video-corner top-right"></div>
                        <div className="video-corner bottom-left"></div>
                        <div className="video-corner bottom-right"></div>
                        
                        <img 
                          ref={videoRef}
                          src={`${API_BASE_URL}/video_feed`} 
                          alt="Drowsiness detection video feed" 
                          className="video-feed"
                          loading="eager"
                          decoding="async"
                        />
                        
                        {/* Modern Controls Bar */}
                        <VideoControlsBar 
                          onFullScreen={handleFullScreen}
                          onSnapshot={handleSnapshot}
                          isRecording={isRunning}
                        />
                        
                        {/* Modern Metrics Overlay */}
                        <VideoMetricsOverlay status={status} isVisible={true} />
                      </>
                    ) : (
                      <div className="camera-placeholder-modern">
                        <div className="placeholder-icon">📹</div>
                        <p>{isRunning ? 'Initializing camera...' : 'Ready to monitor'}</p>
                        {!isRunning && <div className="placeholder-hint">Click START to begin</div>}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
              <div className="content-right">
                <Card className="mb-4 glass-card">
                  <Card.Header as="h5">Alertness Score</Card.Header>
                  <Card.Body>
                    <div className="status-indicator">
                      <AlertnessRing earValue={status.earValue} />
                    </div>
                    <Alert variant={status.isDrowsy ? 'danger' : 'success'} className="text-center">
                      <FontAwesomeIcon icon={status.isDrowsy ? faExclamationTriangle : faEye} className="me-2" />
                      {status.isDrowsy ? 'DROWSINESS DETECTED!' : 'Driver Alert'}
                    </Alert>
                    <div className="mt-3">
                      <h6>Eye Openness (EAR): {status.earValue.toFixed(3)}</h6>
                      <ProgressBar 
                        now={Math.min(status.earValue * 100, 100)} 
                        variant={status.earValue < 0.25 ? 'danger' : 'success'} 
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
                <Card className="mb-4 glass-card">
                  <Card.Header as="h5">Head Position Analysis</Card.Header>
                  <Card.Body>
                    <HeadPoseRadar headPose={status.headPose} />
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <Row>
              <Col md={8}>
                <Card className="mb-4 glass-card">
                  <Card.Header as="h5" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Multi-Metric Analysis</span>
                    <div>
                      <Button variant="outline-primary" size="sm" onClick={handleExportPDF} className="me-2" disabled={earHistory.length === 0}>
                        <FontAwesomeIcon icon={faDownload} /> PDF
                      </Button>
                      <Button variant="outline-success" size="sm" onClick={handleExportCSV} disabled={earHistory.length === 0}>
                        <FontAwesomeIcon icon={faFileExport} /> CSV
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {earHistory.length > 0 ? (
                      <MultiMetricChart earHistory={earHistory} headPoseHistory={headPoseHistory} blinkHistory={blinkHistory} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        Start detection to see live metrics
                      </div>
                    )}
                  </Card.Body>
                </Card>
                <Card className="mb-4 glass-card">
                  <Card.Header as="h5">Drowsiness Intensity Heatmap</Card.Header>
                  <Card.Body>
                    {earHistory.length > 0 ? (
                      <DrowsinessHeatmap data={earHistory} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        Heatmap will appear once detection starts
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="glass-card">
                  <Card.Header as="h5">Alert Timeline</Card.Header>
                  <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <AlertTimeline alerts={alertData} />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {activeTab === 'drivers' && (
            <Row>
              <Col md={4}>
                <DriverProfileManager onDriverSelect={handleDriverSelect} currentDriverId={currentDriverId} />
              </Col>
              <Col md={8}>
                <DriverDashboard driverId={currentDriverId} />
              </Col>
            </Row>
          )}

          {activeTab === 'settings' && (
            <Row>
              <Col md={12}>
                <DriverSettings driverId={currentDriverId} />
              </Col>
            </Row>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;