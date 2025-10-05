// src/components/SessionDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Badge } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClock, faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://localhost:5000';

function SessionDetails() {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
      setSessionData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching session details:', err);
      setError('Failed to fetch session details.');
    } finally {
      setLoading(false);
    }
  };

  const formatEventsForChart = (events) => {
    return events.map((event, index) => ({
      id: index,
      time: new Date(event.timestamp).toLocaleTimeString(),
      ear: event.ear_value,
      yaw: event.head_yaw,
      pitch: event.head_pitch,
      roll: event.head_roll,
      level: event.fatigue_level
    }));
  };

  const getFatigueLevelColor = (level) => {
    switch (level) {
      case 'Severe Fatigue': return 'danger';
      case 'Moderate Fatigue': return 'warning';
      case 'Mild Fatigue': return 'info';
      default: return 'success';
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <h1 className="mb-4">Session Details</h1>
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading session data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <h1 className="mb-4">Session Details</h1>
        <Alert variant="danger">{error}</Alert>
        <Link to="/sessions" className="btn btn-primary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Sessions
        </Link>
      </Container>
    );
  }

  if (!sessionData) {
    return (
      <Container className="mt-4">
        <h1 className="mb-4">Session Details</h1>
        <Alert variant="warning">Session not found</Alert>
        <Link to="/sessions" className="btn btn-primary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Sessions
        </Link>
      </Container>
    );
  }

  const { session, events } = sessionData;
  const chartData = formatEventsForChart(events);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Session Details</h1>
        <Link to="/sessions" className="btn btn-primary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Sessions
        </Link>
      </div>
      
      <Row className="mb-4">
        <Col lg={6}>
          <Card>
            <Card.Header as="h5">Session Information</Card.Header>
            <Card.Body>
              <Table className="table-borderless">
                <tbody>
                  <tr>
                    <th style={{ width: '150px' }}>Session ID:</th>
                    <td>{session.id}</td>
                  </tr>
                  <tr>
                    <th>Driver:</th>
                    <td>
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      {session.driver_name}
                    </td>
                  </tr>
                  <tr>
                    <th>Start Time:</th>
                    <td>{new Date(session.start_time).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>End Time:</th>
                    <td>{session.end_time ? new Date(session.end_time).toLocaleString() : 'In Progress'}</td>
                  </tr>
                  <tr>
                    <th>Duration:</th>
                    <td>
                      <FontAwesomeIcon icon={faClock} className="me-2" />
                      {session.duration 
                        ? `${Math.floor(session.duration / 60)} min ${session.duration % 60} sec` 
                        : 'In Progress'}
                    </td>
                  </tr>
                  <tr>
                    <th>Alert Count:</th>
                    <td>
                      <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                      {session.alert_count}
                    </td>
                  </tr>
                  <tr>
                    <th>Average EAR:</th>
                    <td>{session.avg_ear?.toFixed(3) || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Status:</th>
                    <td>
                      {session.end_time 
                        ? <Badge bg="success">Completed</Badge>
                        : <Badge bg="warning" text="dark">In Progress</Badge>
                      }
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6}>
          <Card>
            <Card.Header as="h5">Session Summary</Card.Header>
            <Card.Body>
              {events.length > 0 ? (
                <div className="session-summary">
                  <p>
                    <strong>First Alert:</strong> {events.length > 0 ? new Date(events[0].timestamp).toLocaleString() : 'N/A'}
                  </p>
                  <p>
                    <strong>Last Alert:</strong> {events.length > 0 ? new Date(events[events.length - 1].timestamp).toLocaleString() : 'N/A'}
                  </p>
                  <p>
                    <strong>Average EAR During Alerts:</strong> {
                      events.length > 0 
                        ? (events.reduce((sum, event) => sum + event.ear_value, 0) / events.length).toFixed(3)
                        : 'N/A'
                    }
                  </p>
                  <p>
                    <strong>Alert Frequency:</strong> {
                      session.duration && session.alert_count
                        ? `${(session.alert_count / (session.duration / 60)).toFixed(2)} alerts per minute`
                        : 'N/A'
                    }
                  </p>
                  <hr />
                  <div>
                    <h6>Fatigue Level Distribution:</h6>
                    {
                      ['Mild Fatigue', 'Moderate Fatigue', 'Severe Fatigue'].map(level => {
                        const count = events.filter(e => e.fatigue_level === level).length;
                        const percentage = events.length > 0 ? ((count / events.length) * 100).toFixed(1) : 0;
                        
                        return (
                          <div key={level} className="mb-2">
                            <div className="d-flex justify-content-between mb-1">
                              <span>{level}</span>
                              <span>
                                <Badge bg={getFatigueLevelColor(level)}>
                                  {count} ({percentage}%)
                                </Badge>
                              </span>
                            </div>
                            <div className="progress" style={{ height: '10px' }}>
                              <div 
                                className={`progress-bar bg-${getFatigueLevelColor(level)}`} 
                                role="progressbar" 
                                style={{ width: `${percentage}%` }}
                                aria-valuenow={percentage} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p>No drowsiness alerts detected in this session.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {events.length > 0 && (
        <>
          <Row className="mb-4">
            <Col xs={12}>
              <Card>
                <Card.Header as="h5">Alertness Timeline</Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis yAxisId="left" domain={[0, 0.5]} />
                      <YAxis yAxisId="right" orientation="right" domain={[-90, 90]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="ear" 
                        name="Eye Aspect Ratio" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="yaw" 
                        name="Head Yaw" 
                        stroke="#82ca9d" 
                        dot={false} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="pitch" 
                        name="Head Pitch" 
                        stroke="#ffc658" 
                        dot={false} 
                      />
                      {/* Draw threshold line */}
                      <Line 
                        yAxisId="left"
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
          </Row>
          
          <Row>
            <Col xs={12}>
              <Card>
                <Card.Header as="h5">Alert Details</Card.Header>
                <Card.Body>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Timestamp</th>
                        <th>EAR Value</th>
                        <th>Fatigue Level</th>
                        <th>Head Position (Yaw, Pitch, Roll)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event, index) => (
                        <tr key={event.id}>
                          <td>{index + 1}</td>
                          <td>{new Date(event.timestamp).toLocaleString()}</td>
                          <td>{event.ear_value.toFixed(3)}</td>
                          <td>
                            <Badge bg={getFatigueLevelColor(event.fatigue_level)}>
                              {event.fatigue_level}
                            </Badge>
                          </td>
                          <td>
                            {event.head_yaw.toFixed(2)}°, {event.head_pitch.toFixed(2)}°, {event.head_roll.toFixed(2)}°
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default SessionDetails;