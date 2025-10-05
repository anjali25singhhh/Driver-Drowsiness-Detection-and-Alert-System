// src/components/SessionHistory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Table, Alert, Form, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'http://localhost:5000';

function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    driverId: '',
    startDate: '',
    endDate: '',
    minAlerts: ''
  });
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchSessions();
    fetchDrivers();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/sessions`);
      setSessions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to fetch session history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/drivers`);
      setDrivers(response.data);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    // This would typically call the backend with filters
    // For now, we'll just filter the client-side data
    fetchSessions();
  };

  const resetFilters = () => {
    setFilters({
      driverId: '',
      startDate: '',
      endDate: '',
      minAlerts: ''
    });
    fetchSessions();
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Session History</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header as="h5">
          <FontAwesomeIcon icon={faSearch} className="me-2" />
          Filter Sessions
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Driver</Form.Label>
                  <Form.Select 
                    name="driverId" 
                    value={filters.driverId}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Drivers</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Min. Alerts</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="minAlerts"
                    value={filters.minAlerts}
                    onChange={handleFilterChange}
                    placeholder="Minimum alerts"
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={resetFilters}>
                Reset
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header as="h5">Session List</Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading sessions...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Driver</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Alert Count</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map(session => (
                    <tr key={session.id}>
                      <td>{session.id}</td>
                      <td>{session.driver_name}</td>
                      <td>{new Date(session.start_time).toLocaleString()}</td>
                      <td>{session.end_time ? new Date(session.end_time).toLocaleString() : '-'}</td>
                      <td>
                        {session.duration 
                          ? `${Math.floor(session.duration / 60)} min ${session.duration % 60} sec` 
                          : '-'}
                      </td>
                      <td>
                        {session.alert_count > 0 ? (
                          <span className="text-danger">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                            {session.alert_count}
                          </span>
                        ) : (
                          session.alert_count
                        )}
                      </td>
                      <td>
                        {session.end_time 
                          ? <span className="badge bg-success">Completed</span>
                          : <span className="badge bg-warning text-dark">In Progress</span>
                        }
                      </td>
                      <td>
                        <Link to={`/sessions/${session.id}`} className="btn btn-sm btn-info">
                          <FontAwesomeIcon icon={faEye} className="me-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No sessions found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SessionHistory;