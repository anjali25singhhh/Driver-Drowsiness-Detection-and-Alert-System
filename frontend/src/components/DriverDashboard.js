// DriverDashboard.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const DriverDashboard = ({ driverId }) => {
  const [statistics, setStatistics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [driver, setDriver] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    if (driverId) {
      loadDriverData();
    } else {
      setLoading(false);
    }
  }, [driverId]);

  const loadDriverData = async () => {
    try {
      setLoading(true);
      
      // Get driver info
      const driverResponse = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}`);
      setDriver(driverResponse.data);
      
      // Get statistics for last 7 days
      const statsResponse = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}/statistics?days=7`);
      setStatistics(statsResponse.data);
      
      // Get recent alerts
      const alertsResponse = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}/alerts?limit=10`);
      setAlerts(alertsResponse.data);
      
      // Get threshold recommendations
      try {
        const recResponse = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}/recommendations`);
        setRecommendations(recResponse.data);
      } catch (recErr) {
        console.log('No recommendations available yet');
        setRecommendations(null);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading driver data:', err);
      setError('Failed to load driver statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!driverId) {
    return (
      <Card className="mb-4">
        <Card.Header as="h5">Driver Dashboard</Card.Header>
        <Card.Body className="text-center py-5">
          <p>Please select a driver to view their statistics and performance.</p>
        </Card.Body>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Header as="h5">Driver Dashboard</Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading driver statistics...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header as="h5">
        Driver Dashboard
        {driver && <span className="ms-2">- {driver.name}</span>}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header as="h6">Drowsiness Metrics (Last 7 Days)</Card.Header>
              <Card.Body>
                {statistics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={statistics}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="avg_ear" 
                        name="Average EAR" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="drowsiness_incidents" 
                        name="Drowsiness Incidents" 
                        stroke="#FF5733" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center">No statistics available yet. Start a driving session to collect data.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card className="mb-4">
              <Card.Header as="h6">Driver Profile</Card.Header>
              <Card.Body>
                {driver ? (
                  <div>
                    <p><strong>Name:</strong> {driver.name}</p>
                    {driver.age && <p><strong>Age:</strong> {driver.age}</p>}
                    {driver.driving_experience_years && (
                      <p><strong>Experience:</strong> {driver.driving_experience_years} years</p>
                    )}
                    <p><strong>Profile Created:</strong> {new Date(driver.created_at).toLocaleDateString()}</p>
                    
                    {driver.settings && (
                      <div className="mt-3">
                        <h6>Current Settings</h6>
                        <p><strong>EAR Threshold:</strong> {driver.settings.ear_threshold}</p>
                        <p><strong>Consecutive Frames:</strong> {driver.settings.consecutive_frames}</p>
                        <p><strong>Blink Threshold:</strong> {driver.settings.blink_threshold}</p>
                      </div>
                    )}
                    
                    {recommendations && (
                      <Alert variant="info" className="mt-3">
                        <h6>Personalized Recommendations</h6>
                        <p>Based on your driving data, we recommend adjusting your EAR threshold to {recommendations.recommended_ear_threshold} (currently {recommendations.current_ear_threshold}).</p>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <p>Driver information not available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Card className="mb-4">
          <Card.Header as="h6">Recent Drowsiness Alerts</Card.Header>
          <Card.Body>
            {alerts.length > 0 ? (
              <Table responsive>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Fatigue Level</th>
                    <th>EAR Value</th>
                    <th>Head Position (Yaw/Pitch/Roll)</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map(alert => (
                    <tr key={alert.id}>
                      <td>{new Date(alert.alert_time).toLocaleString()}</td>
                      <td>
                        <Badge bg={
                          alert.fatigue_level === 'Severe Fatigue' ? 'danger' :
                          alert.fatigue_level === 'Moderate Fatigue' ? 'warning' :
                          'info'
                        }>
                          {alert.fatigue_level}
                        </Badge>
                      </td>
                      <td>{alert.ear_value.toFixed(3)}</td>
                      <td>{alert.head_yaw.toFixed(1)}° / {alert.head_pitch.toFixed(1)}° / {alert.head_roll.toFixed(1)}°</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="text-center">No alerts recorded yet.</p>
            )}
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};

export default DriverDashboard;
// DriverDashboard.js
// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Card, Button, Table, Tabs, Tab, Form, Alert, Badge } from 'react-bootstrap';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUserCheck, faUserSlash, faCog, faChartLine, faBed, faCoffee, faStressLevel } from '@fortawesome/free-solid-svg-icons';
// import axios from 'axios';

// const DriverDashboard = ({ driverId, onClose }) => {
//     const [driver, setDriver] = useState(null);
//     const [performanceData, setPerformanceData] = useState([]);
//     const [alertHistory, setAlertHistory] = useState([]);
//     const [recommendations, setRecommendations] = useState([]);
//     const [calibrationStatus, setCalibrationStatus] = useState({});
//     const [isCalibrating, setIsCalibrating] = useState(false);
//     const [calibrationProgress, setCalibrationProgress] = useState(0);
//     const [calibrationId, setCalibrationId] = useState(null);
//     const [healthData, setHealthData] = useState({
//         sleep_hours: 7,
//         sleep_quality: 'Good',
//         caffeine_mg: 0,
//         stress_level: 3
//     });
//     const [healthInsights, setHealthInsights] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
    
//     const API_BASE_URL = 'http://localhost:5000';
    
//     // Fetch driver data on component mount
//     useEffect(() => {
//         if (driverId) {
//             fetchDriverData();
//             fetchPerformanceData();
//             fetchAlertHistory();
//             checkCalibrationStatus();
//             fetchHealthInsights();
//         }
//     }, [driverId]);
    
//     // Handle calibration progress
//     useEffect(() => {
//         let calibrationTimer;
        
//         if (isCalibrating && calibrationProgress < 100) {
//             calibrationTimer = setInterval(() => {
//                 setCalibrationProgress(prev => {
//                     const newProgress = prev + 1;
//                     if (newProgress >= 100) {
//                         completeCalibration();
//                         clearInterval(calibrationTimer);
//                     }
//                     return newProgress;
//                 });
//             }, 3000); // 5 minute calibration = 300 seconds, so 1% every 3 seconds
//         }
        
//         return () => {
//             if (calibrationTimer) {
//                 clearInterval(calibrationTimer);
//             }
//         };
//     }, [isCalibrating, calibrationProgress]);
    
//     const fetchDriverData = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}`);
//             setDriver(response.data);
//             setError(null);
//         } catch (err) {
//             console.error('Error fetching driver data:', err);
//             setError('Failed to load driver data. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };
    
//     const fetchPerformanceData = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}/performance`);
//             setPerformanceData(response.data);
            
//             // Generate recommendations based on performance
//             generateRecommendations(response.data);
//         } catch (err) {
//             console.error('Error fetching performance data:', err);
//         }
//     };
    
//     const fetchAlertHistory = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}/alerts`);
//             setAlertHistory(response.data);
//         } catch (err) {
//             console.error('Error fetching alert history:', err);
//         }
//     };
    
//     const checkCalibrationStatus = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/api/calibration/status/${driverId}`);
//             setCalibrationStatus(response.data);
//         } catch (err) {
//             console.error('Error checking calibration status:', err);
//         }
//     };
    
//     const fetchHealthInsights = async () => {
//         try {
//             const response = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}/health/insights`);
//             setHealthInsights(response.data);
//         } catch (err) {
//             console.error('Error fetching health insights:', err);
//         }
//     };
    
//     const generateRecommendations = (data) => {
//         const recommendations = [];
        
//         if (data && data.length > 0) {
//             // Sort by date (newest first)
//             const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
//             const latest = sortedData[0];
            
//             // Drowsiness incidents recommendation
//             if (latest.drowsiness_incidents > 5) {
//                 recommendations.push("You've had several drowsiness incidents recently. Consider taking more breaks during your drives.");
//             }
            
//             // Fatigue resistance recommendation
//             if (latest.fatigue_resistance_score < 60) {
//                 recommendations.push("Your fatigue resistance is lower than average. Getting more sleep could help improve this.");
//             }
            
//             // Visual attention recommendation
//             if (latest.visual_attention_score < 70) {
//                 recommendations.push("Your visual attention score could be improved. Try to maintain focus on the road and avoid distractions.");
//             }
            
//             // Trend analysis if we have at least 3 data points
//             if (sortedData.length >= 3) {
//                 const recentScores = sortedData.slice(0, 3).map(d => d.fatigue_resistance_score);
//                 const isDecreasing = recentScores[0] < recentScores[1] && recentScores[1] < recentScores[2];
                
//                 if (isDecreasing) {
//                     recommendations.push("Your alertness metrics are showing a downward trend. Consider your sleep and health habits.");
//                 }
//             }
//         }
        
//         // Add calibration recommendation if needed
//         if (!calibrationStatus || !calibrationStatus.calibration_complete) {
//             recommendations.push("You haven't completed calibration yet. Calibration will help personalize drowsiness detection for you.");
//         }
        
//         setRecommendations(recommendations.length > 0 ? recommendations : ["Your driving patterns look good! Keep up the safe driving."]);
//     };
    
//     const startCalibration = async () => {
//         try {
//             const response = await axios.post(`${API_BASE_URL}/api/calibration/start`, {
//                 driver_id: driverId
//             });
            
//             setCalibrationId(response.data.calibration_id);
//             setIsCalibrating(true);
//             setCalibrationProgress(0);
//         } catch (err) {
//             console.error('Error starting calibration:', err);
//             setError('Failed to start calibration. Please try again.');
//         }
//     };
    
//     const completeCalibration = async () => {
//         if (!calibrationId) return;
        
//         try {
//             await axios.post(`${API_BASE_URL}/api/calibration/${calibrationId}/complete`);
//             setIsCalibrating(false);
//             checkCalibrationStatus();
//             fetchDriverData(); // Refresh driver data to get updated thresholds
//         } catch (err) {
//             console.error('Error completing calibration:', err);
//             setError('Failed to complete calibration. Please try again.');
//         }
//     };
    
//     const submitHealthData = async (e) => {
//         e.preventDefault();
        
//         try {
//             await axios.post(`${API_BASE_URL}/api/drivers/${driverId}/health`, healthData);
//             fetchHealthInsights();
//             alert('Health data saved successfully');
//         } catch (err) {
//             console.error('Error submitting health data:', err);
//             setError('Failed to save health data. Please try again.');
//         }
//     };
    
//     const handleHealthDataChange = (e) => {
//         const { name, value } = e.target;
//         setHealthData(prev => ({
//             ...prev,
//             [name]: name === 'sleep_hours' || name === 'caffeine_mg' || name === 'stress_level' 
//                 ? Number(value) 
//                 : value
//         }));
//     };
    
//     if (loading) {
//         return <div className="text-center p-5">Loading driver data...</div>;
//     }
    
//     if (error) {
//         return <Alert variant="danger">{error}</Alert>;
//     }
    
//     if (!driver) {
//         return <Alert variant="warning">Driver not found</Alert>;
//     }
    
//     return (
//         <Container fluid className="driver-dashboard p-4">
//             <Row className="mb-4">
//                 <Col>
//                     <h2>
//                         Driver Profile: {driver.name}
//                         <Button variant="secondary" className="float-end" onClick={onClose}>
//                             Close Dashboard
//                         </Button>
//                     </h2>
//                     <p>
//                         {driver.age && `Age: ${driver.age} • `}
//                         {driver.driving_experience_years && `Driving Experience: ${driver.driving_experience_years} years • `}
//                         Calibration Status: 
//                         <Badge bg={calibrationStatus.calibration_complete ? "success" : "warning"} className="ms-2">
//                             {calibrationStatus.calibration_complete ? "Calibrated" : "Not Calibrated"}
//                         </Badge>
//                     </p>
//                 </Col>
//             </Row>
            
//             {isCalibrating ? (
//                 <Card className="mb-4">
//                     <Card.Header as="h5">Driver Calibration in Progress</Card.Header>
//                     <Card.Body className="text-center">
//                         <p>Please maintain a normal alert driving position while we calibrate your drowsiness detection thresholds.</p>
//                         <p>Progress: {calibrationProgress}%</p>
//                         <div className="progress mb-3">
//                             <div 
//                                 className="progress-bar progress-bar-striped progress-bar-animated" 
//                                 role="progressbar" 
//                                 style={{width: `${calibrationProgress}%`}}
//                                 aria-valuenow={calibrationProgress} 
//                                 aria-valuemin="0" 
//                                 aria-valuemax="100"
//                             ></div>
//                         </div>
//                         <p>This will take approximately 5 minutes to complete.</p>
//                         <p>Calibration will personalize the drowsiness detection system to your specific facial features and eye patterns.</p>
//                     </Card.Body>
//                 </Card>
//             ) : (
//                 <Tabs defaultActiveKey="dashboard" className="mb-4">
//                     <Tab eventKey="dashboard" title="Dashboard">
//                         <Row>
//                             <Col md={8}>
//                                 <Card className="mb-4">
//                                     <Card.Header as="h5">Drowsiness Risk Assessment</Card.Header>
//                                     <Card.Body>
//                                         <Row>
//                                             <Col md={6}>
//                                                 <div className="metric-card">
//                                                     <h4>Fatigue Resistance</h4>
//                                                     {performanceData.length > 0 ? (
//                                                         <div className="gauge-container">
//                                                             <div className="gauge">
//                                                                 <div 
//                                                                     className="gauge-fill" 
//                                                                     style={{
//                                                                         transform: `rotate(${performanceData[0].fatigue_resistance_score / 200 + 0.5}turn)`,
//                                                                         background: `${
//                                                                             performanceData[0].fatigue_resistance_score > 80 ? 'green' : 
//                                                                             performanceData[0].fatigue_resistance_score > 60 ? 'yellow' : 'red'
//                                                                         }`
//                                                                     }}
//                                                                 ></div>
//                                                                 <div className="gauge-center">
//                                                                     <strong>{performanceData[0].fatigue_resistance_score.toFixed(0)}</strong>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="gauge-label">out of 100</div>
//                                                         </div>
//                                                     ) : (
//                                                         <p>No data available</p>
//                                                     )}
//                                                 </div>
//                                             </Col>
//                                             <Col md={6}>
//                                                 <div className="metric-card">
//                                                     <h4>Visual Attention</h4>
//                                                     {performanceData.length > 0 ? (
//                                                         <div className="gauge-container">
//                                                             <div className="gauge">
//                                                                 <div 
//                                                                     className="gauge-fill" 
//                                                                     style={{
//                                                                         transform: `rotate(${performanceData[0].visual_attention_score / 200 + 0.5}turn)`,
//                                                                         background: `${
//                                                                             performanceData[0].visual_attention_score > 80 ? 'green' : 
//                                                                             performanceData[0].visual_attention_score > 60 ? 'yellow' : 'red'
//                                                                         }`
//                                                                     }}
//                                                                 ></div>
//                                                                 <div className="gauge-center">
//                                                                     <strong>{performanceData[0].visual_attention_score.toFixed(0)}</strong>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="gauge-label">out of 100</div>
//                                                         </div>
//                                                     ) : (
//                                                         <p>No data available</p>
//                                                     )}
//                                                 </div>
//                                             </Col>
//                                         </Row>
                                        
//                                         <h5 className="mt-4">Your Thresholds</h5>
//                                         <Table striped bordered>
//                                             <thead>
//                                                 <tr>
//                                                     <th>Metric</th>
//                                                     <th>Your Value</th>
//                                                     <th>Default</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 <tr>
//                                                     <td>EAR Threshold</td>
//                                                     <td>{driver.settings?.ear_threshold.toFixed(3)}</td>
//                                                     <td>0.250</td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td>Consecutive Frames</td>
//                                                     <td>{driver.settings?.consecutive_frames}</td>
//                                                     <td>30</td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td>Blink Threshold</td>
//                                                     <td>{driver.settings?.blink_threshold.toFixed(3)}</td>
//                                                     <td>0.200</td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td>Night Mode Sensitivity</td>
//                                                     <td>{driver.settings?.night_mode_sensitivity?.toFixed(1) || "1.2"}</td>
//                                                     <td>1.2</td>
//                                                 </tr>
//                                             </tbody>
//                                         </Table>
                                        
//                                         {!calibrationStatus.calibration_complete && (
//                                             <div className="text-center mt-3">
//                                                 <Button 
//                                                     variant="primary" 
//                                                     onClick={startCalibration}
//                                                     disabled={isCalibrating}
//                                                 >
//                                                     Start Calibration
//                                                 </Button>
//                                                 <p className="mt-2">
//                                                     <small>Calibration takes about 5 minutes and personalizes drowsiness detection to your facial features.</small>
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </Card.Body>
//                                 </Card>
                                
//                                 <Card className="mb-4">
//                                     <Card.Header as="h5">Drowsiness Metrics Over Time</Card.Header>
//                                     <Card.Body>
//                                         <ResponsiveContainer width="100%" height={300}>
//                                             <LineChart data={performanceData}>
//                                                 <CartesianGrid strokeDasharray="3 3" />
//                                                 <XAxis dataKey="date" />
//                                                 <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
//                                                 <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
//                                                 <Tooltip />
//                                                 <Legend />
//                                                 <Line 
//                                                     yAxisId="left"
//                                                     type="monotone" 
//                                                     dataKey="fatigue_resistance_score" 
//                                                     name="Fatigue Resistance" 
//                                                     stroke="#8884d8" 
//                                                     activeDot={{ r: 8 }} 
//                                                 />
//                                                 <Line 
//                                                     yAxisId="left"
//                                                     type="monotone" 
//                                                     dataKey="visual_attention_score" 
//                                                     name="Visual Attention" 
//                                                     stroke="#82ca9d" 
//                                                 />
//                                                 <Line 
//                                                     yAxisId="right"
//                                                     type="monotone" 
//                                                     dataKey="drowsiness_incidents" 
//                                                     name="Drowsiness Incidents" 
//                                                     stroke="#ff7300" 
//                                                 />
//                                             </LineChart>
//                                         </ResponsiveContainer>
//                                     </Card.Body>
//                                 </Card>
//                             </Col>
                            
//                             <Col md={4}>
//                                 <Card className="mb-4">
//                                     <Card.Header as="h5">Personal Recommendations</Card.Header>
//                                     <Card.Body>
//                                         <ul className="recommendations-list">
//                                             {recommendations.map((rec, idx) => (
//                                                 <li key={idx} className="recommendation-item">
//                                                     {rec}
//                                                 </li>
//                                             ))}
//                                         </ul>
//                                     </Card.Body>
//                                 </Card>
                                
//                                 <Card className="mb-4">
//                                     <Card.Header as="h5">Recent Alerts</Card.Header>
//                                     <Card.Body className="p-0">
//                                         <div className="alert-list">
//                                             {alertHistory.slice(0, 5).map((alert, idx) => (
//                                                 <div key={idx} className="alert-item">
//                                                     <div className="alert-time">
//                                                         {new Date(alert.alert_time).toLocaleString()}
//                                                     </div>
//                                                     <div className="alert-level">
//                                                         <Badge 
//                                                             bg={
//                                                                 alert.fatigue_level === 'Severe Fatigue' ? 'danger' :
//                                                                 alert.fatigue_level === 'Moderate Fatigue' ? 'warning' : 'info'
//                                                             }
//                                                         >
//                                                             {alert.fatigue_level}
//                                                         </Badge>
//                                                     </div>
//                                                     <div className="alert-details">
//                                                         EAR: {alert.ear_value.toFixed(3)} | 
//                                                         Head: {alert.head_yaw.toFixed(1)}° yaw, {alert.head_pitch.toFixed(1)}° pitch
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                             {alertHistory.length === 0 && (
//                                                 <p className="text-center p-3">No recent alerts</p>
//                                             )}
//                                         </div>
//                                     </Card.Body>
//                                 </Card>
//                             </Col>
//                         </Row>
//                     </Tab>
                    
//                     <Tab eventKey="health" title="Health Tracking">
//                         <Row>
//                             <Col md={6}>
//                                 <Card className="mb-4">
//                                     <Card.Header as="h5">Daily Health Log</Card.Header>
//                                     <Card.Body>
//                                         <Form onSubmit={submitHealthData}>
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Hours of Sleep Last Night</Form.Label>
//                                                 <Form.Control 
//                                                     type="number" 
//                                                     step="0.5"
//                                                     min="0" 
//                                                     max="24"
//                                                     name="sleep_hours" 
//                                                     value={healthData.sleep_hours}
//                                                     onChange={handleHealthDataChange}
//                                                     required
//                                                 />
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Sleep Quality</Form.Label>
//                                                 <Form.Select 
//                                                     name="sleep_quality" 
//                                                     value={healthData.sleep_quality}
//                                                     onChange={handleHealthDataChange}
//                                                     required
//                                                 >
//                                                     <option value="Excellent">Excellent</option>
//                                                     <option value="Good">Good</option>
//                                                     <option value="Fair">Fair</option>
//                                                     <option value="Poor">Poor</option>
//                                                     <option value="Very Poor">Very Poor</option>
//                                                 </Form.Select>
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Caffeine Intake (mg)</Form.Label>
//                                                 <Form.Control 
//                                                     type="number" 
//                                                     min="0" 
//                                                     max="1000"
//                                                     name="caffeine_mg" 
//                                                     value={healthData.caffeine_mg}
//                                                     onChange={handleHealthDataChange}
//                                                 />
//                                                 <Form.Text className="text-muted">
//                                                     Reference: 1 cup of coffee ≈ 95mg, 1 cup of tea ≈ 47mg
//                                                 </Form.Text>
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Stress Level (1-5)</Form.Label>
//                                                 <Form.Range 
//                                                     min="1" 
//                                                     max="5"
//                                                     name="stress_level" 
//                                                     value={healthData.stress_level}
//                                                     onChange={handleHealthDataChange}
//                                                 />
//                                                 <div className="d-flex justify-content-between">
//                                                     <span>Low</span>
//                                                     <span>Medium</span>
//                                                     <span>High</span>
//                                                 </div>
//                                             </Form.Group>
                                            
//                                             <Button variant="primary" type="submit">
//                                                 Save Health Data
//                                             </Button>
//                                         </Form>
//                                     </Card.Body>
//                                 </Card>
//                             </Col>
                            
//                             <Col md={6}>
//                                 <Card className="mb-4">
//                                     <Card.Header as="h5">Health Insights</Card.Header>
//                                     <Card.Body>
//                                         {healthInsights ? (
//                                             <>
//                                                 <h5>Correlations with Drowsiness</h5>
//                                                 {Object.keys(healthInsights.correlations).length > 0 ? (
//                                                     <div className="correlations">
//                                                         {healthInsights.correlations.sleep_hours_to_drowsiness && (
//                                                             <div className="correlation-item">
//                                                                 <div className="correlation-label">Sleep Impact:</div>
//                                                                 <div className="correlation-value">
//                                                                     <div 
//                                                                         className="correlation-bar" 
//                                                                         style={{
//                                                                             width: `${Math.abs(healthInsights.correlations.sleep_hours_to_drowsiness) * 100}%`,
//                                                                             backgroundColor: healthInsights.correlations.sleep_hours_to_drowsiness > 0 ? '#28a745' : '#dc3545'
//                                                                         }}
//                                                                     ></div>
//                                                                     <span>{Math.abs(healthInsights.correlations.sleep_hours_to_drowsiness).toFixed(2)}</span>
//                                                                 </div>
//                                                             </div>
//                                                         )}
                                                        
//                                                         {healthInsights.correlations.caffeine_to_alertness && (
//                                                             <div className="correlation-item">
//                                                                 <div className="correlation-label">Caffeine Impact:</div>
//                                                                 <div className="correlation-value">
//                                                                     <div 
//                                                                         className="correlation-bar" 
//                                                                         style={{
//                                                                             width: `${Math.abs(healthInsights.correlations.caffeine_to_alertness) * 100}%`,
//                                                                             backgroundColor: healthInsights.correlations.caffeine_to_alertness > 0 ? '#28a745' : '#dc3545'
//                                                                         }}
//                                                                     ></div>
//                                                                     <span>{Math.abs(healthInsights.correlations.caffeine_to_alertness).toFixed(2)}</span>
//                                                                 </div>
//                                                             </div>
//                                                         )}
                                                        
//                                                         {healthInsights.correlations.stress_to_drowsiness && (
//                                                             <div className="correlation-item">
//                                                                 <div className="correlation-label">Stress Impact:</div>
//                                                                 <div className="correlation-value">
//                                                                     <div 
//                                                                         className="correlation-bar" 
//                                                                         style={{
//                                                                             width: `${Math.abs(healthInsights.correlations.stress_to_drowsiness) * 100}%`,
//                                                                             backgroundColor: healthInsights.correlations.stress_to_drowsiness < 0 ? '#28a745' : '#dc3545'
//                                                                         }}
//                                                                     ></div>
//                                                                     <span>{Math.abs(healthInsights.correlations.stress_to_drowsiness).toFixed(2)}</span>
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 ) : (
//                                                     <p>Not enough data to calculate correlations yet.</p>
//                                                 )}
                                                
//                                                 <h5 className="mt-4">Personalized Recommendations</h5>
//                                                 <ul>
//                                                     {healthInsights.recommendations.map((rec, idx) => (
//                                                         <li key={idx}>{rec}</li>
//                                                     ))}
//                                                 </ul>
//                                             </>
//                                         ) : (
//                                             <p>
//                                                 Start logging your health data to receive personalized insights about how 
//                                                 your sleep, caffeine intake, and stress levels affect your drowsiness while driving.
//                                             </p>
//                                         )}
//                                     </Card.Body>
//                                 </Card>
                                
//                                 <Card>
//                                     <Card.Header as="h5">Sleep vs. Drowsiness Incidents</Card.Header>
//                                     <Card.Body>
//                                         {healthInsights && healthInsights.data && healthInsights.data.length > 0 ? (
//                                             <ResponsiveContainer width="100%" height={250}>
//                                                 <BarChart data={healthInsights.data}>
//                                                     <CartesianGrid strokeDasharray="3 3" />
//                                                     <XAxis dataKey="date" />
//                                                     <YAxis yAxisId="left" orientation="left" />
//                                                     <YAxis yAxisId="right" orientation="right" />
//                                                     <Tooltip />
//                                                     <Legend />
//                                                     <Bar yAxisId="left" dataKey="sleep_hours" name="Sleep Hours" fill="#8884d8" />
//                                                     <Bar yAxisId="right" dataKey="drowsiness_incidents" name="Drowsiness Events" fill="#ff7300" />
//                                                 </BarChart>
//                                             </ResponsiveContainer>
//                                         ) : (
//                                             <p className="text-center">No data available yet</p>
//                                         )}
//                                     </Card.Body>
//                                 </Card>
//                             </Col>
//                         </Row>
//                     </Tab>
                    
//                     <Tab eventKey="settings" title="Alert Settings">
//                         <Row>
//                             <Col md={6}>
//                                 <Card>
//                                     <Card.Header as="h5">Alert Preferences</Card.Header>
//                                     <Card.Body>
//                                         <Form>
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Alert Sound</Form.Label>
//                                                 <Form.Select 
//                                                     name="alert_sound" 
//                                                     defaultValue={driver.settings?.alert_sound || "default"}
//                                                 >
//                                                     <option value="default">Default Alarm</option>
//                                                     <option value="gentle">Gentle Reminder</option>
//                                                     <option value="urgent">Urgent Alarm</option>
//                                                     <option value="voice">Voice Alert</option>
//                                                 </Form.Select>
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Check 
//                                                     type="switch"
//                                                     id="vibration-switch"
//                                                     label="Enable Vibration Alert"
//                                                     defaultChecked={driver.settings?.alert_vibration !== false}
//                                                 />
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Check 
//                                                     type="switch"
//                                                     id="visual-switch"
//                                                     label="Enable Visual Alert"
//                                                     defaultChecked={driver.settings?.alert_visual !== false}
//                                                 />
//                                             </Form.Group>
                                            
//                                             <h5 className="mt-4">Sensitivity Settings</h5>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Night Mode Sensitivity (x{driver.settings?.night_mode_sensitivity?.toFixed(1) || "1.2"})</Form.Label>
//                                                 <Form.Range 
//                                                     min="1.0" 
//                                                     max="2.0"
//                                                     step="0.1"
//                                                     defaultValue={driver.settings?.night_mode_sensitivity || 1.2}
//                                                 />
//                                                 <Form.Text>
//                                                     Increases drowsiness detection sensitivity during night hours (8 PM - 6 AM)
//                                                 </Form.Text>
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Long Drive Sensitivity (x{driver.settings?.long_drive_sensitivity?.toFixed(1) || "1.2"})</Form.Label>
//                                                 <Form.Range 
//                                                     min="1.0" 
//                                                     max="2.0"
//                                                     step="0.1"
//                                                     defaultValue={driver.settings?.long_drive_sensitivity || 1.2}
//                                                 />
//                                                 <Form.Text>
//                                                     Increases sensitivity for drives longer than 2 hours
//                                                 </Form.Text>
//                                             </Form.Group>
                                            
//                                             <Button variant="primary">
//                                                 Save Settings
//                                             </Button>
//                                         </Form>
//                                     </Card.Body>
//                                 </Card>
//                             </Col>
                            
//                             <Col md={6}>
//                                 <Card>
//                                     <Card.Header as="h5">Advanced Detection Settings</Card.Header>
//                                     <Card.Body>
//                                         <Form>
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>EAR Threshold ({driver.settings?.ear_threshold.toFixed(3)})</Form.Label>
//                                                 <Form.Range 
//                                                     min="0.15" 
//                                                     max="0.35"
//                                                     step="0.01"
//                                                     defaultValue={driver.settings?.ear_threshold || 0.25}
//                                                 />
//                                                 <Form.Text>
//                                                     Lower values make drowsiness detection more sensitive
//                                                 </Form.Text>
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Consecutive Frames ({driver.settings?.consecutive_frames})</Form.Label>
//                                                 <Form.Range 
//                                                     min="10" 
//                                                     max="60"
//                                                     step="5"
//                                                     defaultValue={driver.settings?.consecutive_frames || 30}
//                                                 />
//                                                 <Form.Text>
//                                                     Lower values make drowsiness detection faster but may increase false alarms
//                                                 </Form.Text>
//                                             </Form.Group>
                                            
//                                             <Form.Group className="mb-3">
//                                                 <Form.Label>Blink Threshold ({driver.settings?.blink_threshold.toFixed(3)})</Form.Label>
//                                                 <Form.Range 
//                                                     min="0.15" 
//                                                     max="0.3"
//                                                     step="0.01"
//                                                     defaultValue={driver.settings?.blink_threshold || 0.2}
//                                                 />
//                                                 <Form.Text>
//                                                     Controls sensitivity of blink detection
//                                                 </Form.Text>
//                                             </Form.Group>
                                            
//                                             <Button variant="primary">
//                                                 Save Advanced Settings
//                                             </Button>
                                            
//                                             <div className="mt-3 text-center">
//                                                 <Button 
//                                                     variant="outline-secondary" 
//                                                     size="sm"
//                                                 >
//                                                     Reset to Recommended Values
//                                                 </Button>
//                                                 <p className="mt-2">
//                                                     <small>Calibration provides the most accurate personalized settings</small>
//                                                 </p>
//                                             </div>
//                                         </Form>
//                                     </Card.Body>
//                                 </Card>
//                             </Col>
//                         </Row>
//                     </Tab>
//                 </Tabs>
//             )}
//         </Container>
//     );
// };

// export default DriverDashboard;





// Driver Calibration Mode
// Add a 5-minute calibration session for new drivers
// Record baseline EAR values in normal alert conditions
// Set personalized thresholds based on the driver's physiological baseline
// Time-Based Sensitivity Adjustments
// Adjust thresholds based on time of day (more sensitive at night)
// Track drive duration and increase sensitivity for longer drives
// Driver Performance Metrics
// Fatigue resistance score based on historical data
// Visual attention metrics (eye movement patterns)
// Blink rate trends over time
// Driver Profile Dashboard
// Add drowsiness risk assessment for each driver
// Show improvement or decline in alertness metrics over time
// Provide personalized recommendations for reducing drowsiness
// Driver Comparison
// Compare metrics across different drivers
// Family or fleet management features for multiple drivers
// Alert Customization
// Let drivers customize alert types (sound, vibration, visual)
// Personalized alert messages or sounds
// Health Integration
// Optional sleep quality tracking
// Caffeine intake logging
// Correlate with drowsiness incidents

// integrate this if possible