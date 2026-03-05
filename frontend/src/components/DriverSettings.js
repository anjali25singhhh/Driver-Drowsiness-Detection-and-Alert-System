// DriverSettings.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const DriverSettings = ({ driverId }) => {
  const [settings, setSettings] = useState({
    ear_threshold: 0.25,
    consecutive_frames: 30,
    blink_threshold: 0.2,
    head_pose_sensitivity: 1.0
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    if (driverId) {
      loadSettings();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Get driver settings
      const response = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}`);
      if (response.data.settings) {
        setSettings(response.data.settings);
      }
      
      // Get recommendations if available
      try {
        const recResponse = await axios.get(`${API_BASE_URL}/api/drivers/${driverId}/recommendations`);
        setRecommendations(recResponse.data);
      } catch (recErr) {
        console.log('No recommendations available');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load driver settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRecommendations = () => {
    if (recommendations) {
      setSettings({
        ...settings,
        ear_threshold: recommendations.recommended_ear_threshold
      });
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Validate settings
      if (settings.ear_threshold < 0.1 || settings.ear_threshold > 0.4) {
        setError('EAR threshold must be between 0.1 and 0.4');
        setSaving(false);
        return;
      }
      
      if (settings.consecutive_frames < 10 || settings.consecutive_frames > 100) {
        setError('Frame threshold must be between 10 and 100');
        setSaving(false);
        return;
      }
      
      // Save settings
      await axios.put(`${API_BASE_URL}/api/drivers/${driverId}/settings`, settings);
      
      setSuccess('Settings saved successfully!');
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!driverId) {
    return (
      <Card className="mb-4">
        <Card.Header as="h5">Driver Settings</Card.Header>
        <Card.Body className="text-center py-5">
          <p>Please select a driver to adjust their settings.</p>
        </Card.Body>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Header as="h5">Driver Settings</Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading settings...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Driver Settings</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Eye Aspect Ratio (EAR) Threshold
                  <span className="ms-2 text-muted">(Lower = more sensitive)</span>
                </Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  min="0.1"
                  max="0.4"
                  value={settings.ear_threshold}
                  onChange={(e) => setSettings({...settings, ear_threshold: parseFloat(e.target.value)})}
                />
                <Form.Text className="text-muted">
                  Recommended range: 0.15 - 0.35. Lower values detect drowsiness more quickly but may cause more false alarms.
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Consecutive Frames Threshold
                  <span className="ms-2 text-muted">(Lower = faster detection)</span>
                </Form.Label>
                <Form.Control 
                  type="number" 
                  step="1"
                  min="10"
                  max="100"
                  value={settings.consecutive_frames}
                  onChange={(e) => setSettings({...settings, consecutive_frames: parseInt(e.target.value)})}
                />
                <Form.Text className="text-muted">
                  Number of consecutive frames with low EAR before alerting. Recommended range: 15-45.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Blink Detection Threshold</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  min="0.1"
                  max="0.3"
                  value={settings.blink_threshold}
                  onChange={(e) => setSettings({...settings, blink_threshold: parseFloat(e.target.value)})}
                />
                <Form.Text className="text-muted">
                  Threshold for detecting eye blinks. Recommended: 0.2
                </Form.Text>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Head Pose Sensitivity</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  value={settings.head_pose_sensitivity}
                  onChange={(e) => setSettings({...settings, head_pose_sensitivity: parseFloat(e.target.value)})}
                />
                <Form.Text className="text-muted">
                  Sensitivity to head position changes. Higher values increase sensitivity.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          {recommendations && (
            <Alert variant="info" className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Personalized Recommendation:</strong> We suggest adjusting your EAR threshold to {recommendations.recommended_ear_threshold} based on your average EAR of {recommendations.avg_ear.toFixed(3)}.
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={handleApplyRecommendations}
                >
                  Apply Recommendation
                </Button>
              </div>
            </Alert>
          )}
          
          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DriverSettings;