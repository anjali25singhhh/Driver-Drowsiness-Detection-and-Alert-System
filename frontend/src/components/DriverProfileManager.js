// DriverProfileManager.js (continued)
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Modal, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import axios from 'axios';

const DriverProfileManager = ({ onDriverSelect, currentDriverId }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    age: '',
    driving_experience_years: ''
  });
  const [sessionActive, setSessionActive] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    // Load drivers when component mounts
    fetchDrivers();
    // Check if a session is active
    checkSessionStatus();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/drivers`);
      setDrivers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading drivers:', err);
      setError('Failed to load driver profiles. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const checkSessionStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/session/status`);
      setSessionActive(response.data.active);
    } catch (err) {
      console.error('Error checking session status:', err);
    }
  };

  const handleAddDriver = async () => {
    try {
      if (!newDriver.name.trim()) {
        setError('Driver name is required');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/drivers`, newDriver);
      
      // Add the new driver to the list
      fetchDrivers();
      
      // Reset form and close modal
      setNewDriver({ name: '', age: '', driving_experience_years: '' });
      setShowAddModal(false);
      setError(null);
    } catch (err) {
      console.error('Error adding driver:', err);
      setError('Failed to add driver. Please try again.');
    }
  };

  const startSession = async (driverId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/session/start`, { driver_id: driverId });
      setSessionActive(true);
      onDriverSelect(driverId);
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start driver session. Please try again.');
    }
  };

  const endSession = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/session/end`);
      setSessionActive(false);
      onDriverSelect(null);
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end driver session. Please try again.');
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Driver Profile Management</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="d-flex justify-content-between mb-3">
          <h6>Select a Driver Profile</h6>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            disabled={sessionActive}
          >
            Add New Driver
          </Button>
        </div>
        
        {loading ? (
          <p>Loading driver profiles...</p>
        ) : (
          <ListGroup>
            {drivers.length === 0 ? (
              <ListGroup.Item>No driver profiles found. Add a new driver to begin.</ListGroup.Item>
            ) : (
              drivers.map(driver => (
                <ListGroup.Item 
                  key={driver.id}
                  active={driver.id === parseInt(currentDriverId)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{driver.name}</strong>
                    {driver.age && <span className="ms-2">Age: {driver.age}</span>}
                    {driver.driving_experience_years && 
                      <span className="ms-2">Experience: {driver.driving_experience_years} years</span>
                    }
                  </div>
                  {sessionActive && driver.id === parseInt(currentDriverId) ? (
                    <Badge bg="success">Active</Badge>
                  ) : (
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      disabled={sessionActive}
                      onClick={() => startSession(driver.id)}
                    >
                      Select
                    </Button>
                  )}
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        )}
        
        {sessionActive && (
          <div className="mt-3 text-center">
            <Button variant="danger" onClick={endSession}>
              End Driving Session
            </Button>
          </div>
        )}
      </Card.Body>
      
      {/* Add New Driver Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Driver Name*</Form.Label>
              <Form.Control 
                type="text" 
                value={newDriver.name}
                onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                placeholder="Enter driver's name"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control 
                type="number" 
                value={newDriver.age}
                onChange={(e) => setNewDriver({...newDriver, age: e.target.value})}
                placeholder="Enter driver's age"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Driving Experience (years)</Form.Label>
              <Form.Control 
                type="number" 
                value={newDriver.driving_experience_years}
                onChange={(e) => setNewDriver({...newDriver, driving_experience_years: e.target.value})}
                placeholder="Enter years of driving experience"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddDriver}>
            Add Driver
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default DriverProfileManager;