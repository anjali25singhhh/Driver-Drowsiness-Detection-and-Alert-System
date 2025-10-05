import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUser } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function ProfilePage({ user, setUser }) {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    licenseNumber: ''
  });
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/profile`, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        const { driver, statistics } = response.data;
        setProfile({
          name: driver.name || '',
          age: driver.age || '',
          gender: driver.gender || '',
          licenseNumber: driver.license_number || ''
        });
        setStats(statistics);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile`, {
        name: profile.name,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender,
        licenseNumber: profile.licenseNumber
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        setSuccess('Profile updated successfully!');
        // Update user state in parent component
        if (setUser) {
          setUser(prev => ({ ...prev, name: profile.name }));
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Driver Profile</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h4><FontAwesomeIcon icon={faUser} className="me-2" />Personal Information</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Age</Form.Label>
                      <Form.Control
                        type="number"
                        name="age"
                        value={profile.age}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>License Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="licenseNumber"
                    value={profile.licenseNumber}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="bg-info text-white">
              <h4>Personalized Detection Settings</h4>
            </Card.Header>
            <Card.Body>
              {stats ? (
                <>
                  <div className="mb-3">
                    <h5>Your Personalized Drowsiness Threshold</h5>
                    <p className="lead text-primary">{stats.personalized_ear_threshold?.toFixed(3) || "0.250"}</p>
                    <small className="text-muted">
                      This threshold is automatically adjusted based on your driving patterns and eye characteristics.
                      The system becomes more accurate with more driving sessions.
                    </small>
                  </div>
                  
                  <hr />
                  
                  <div className="mb-3">
                    <h5>Detection Statistics</h5>
                    <Row>
                      <Col md={6}>
                        <p><strong>Total Sessions:</strong> {stats.total_sessions}</p>
                        <p><strong>Total Driving Time:</strong> {stats.total_driving_time_minutes} minutes</p>
                      </Col>
                      <Col md={6}>
                        <p><strong>Avg. Eye Openness:</strong> {stats.avg_ear_overall?.toFixed(3) || "N/A"}</p>
                        <p><strong>Drowsiness Incidents:</strong> {stats.total_drowsiness_incidents}</p>
                      </Col>
                    </Row>
                  </div>
                </>
              ) : (
                <p>No detection statistics available yet. Start a new detection session to generate personalized settings.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;