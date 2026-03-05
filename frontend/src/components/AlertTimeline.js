import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const AlertTimeline = ({ alerts }) => {
  const getSeverityColor = (level) => {
    switch (level) {
      case 'Severe Fatigue': return '#dc3545';
      case 'Moderate Fatigue': return '#fd7e14';
      case 'Mild Fatigue': return '#ffc107';
      default: return '#17a2b8';
    }
  };

  const getSeverityBadge = (level) => {
    switch (level) {
      case 'Severe Fatigue': return 'danger';
      case 'Moderate Fatigue': return 'warning';
      case 'Mild Fatigue': return 'info';
      default: return 'secondary';
    }
  };

  const [expandedIndex, setExpandedIndex] = useState(null);

  const getAlertIcon = (level) => {
    switch (level) {
      case 'Severe Fatigue': return faExclamationTriangle;
      case 'Moderate Fatigue': return faExclamationCircle;
      default: return faInfoCircle;
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      padding: '24px',
      background: '#0f172a',
      borderRadius: '16px',
      minHeight: '400px'
    }}>
      {/* Timeline vertical line - BEHIND dots */}
      <div
        style={{
          position: 'absolute',
          left: '20px',
          top: '24px',
          bottom: '24px',
          width: '2px',
          background: 'rgba(99, 102, 241, 0.3)',
          borderRadius: '2px',
          zIndex: 0,
        }}
      />

      {/* Timeline items */}
      <div style={{ marginLeft: '40px' }}>
        {alerts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 30px',
              color: '#64748b',
              fontSize: '0.95rem',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>✅</div>
            <div>No alerts recorded yet</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.7 }}>Keep driving safely!</div>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              style={{
                position: 'relative',
                marginBottom: '16px',
              }}
            >
              {/* Timeline dot - ABOVE line with z-index */}
              <div
                style={{
                  position: 'absolute',
                  left: '-31px',
                  top: '16px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: getSeverityColor(alert.level),
                  border: '3px solid #0f172a',
                  boxShadow: `0 0 0 2px ${getSeverityColor(alert.level)}, 0 0 16px ${getSeverityColor(alert.level)}80`,
                  zIndex: 10,
                }}
              />

              {/* Alert content card */}
              <motion.div 
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  background: 'rgba(30, 27, 75, 0.6)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '12px',
                  border: `1px solid ${getSeverityColor(alert.level)}40`,
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2), 0 0 20px ${getSeverityColor(alert.level)}15`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <FontAwesomeIcon 
                      icon={getAlertIcon(alert.level)} 
                      style={{ color: getSeverityColor(alert.level), fontSize: '14px' }}
                    />
                    <Badge 
                      bg={getSeverityBadge(alert.level)}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        padding: '4px 10px',
                      }}
                    >
                      {alert.level.toUpperCase()}
                    </Badge>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#64748b',
                      fontWeight: 500,
                    }}>
                      {alert.time}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                    <div style={{ display: 'inline-block', marginRight: '16px' }}>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>EAR:</span>{' '}
                      <strong style={{ color: '#e0e7ff', fontSize: '14px' }}>{alert.ear.toFixed(3)}</strong>
                      {alert.ear < 0.2 && (
                        <span style={{ 
                          color: '#ef4444', 
                          marginLeft: '6px',
                          fontSize: '10px',
                          padding: '2px 6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}>
                          CRITICAL
                        </span>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {expandedIndex === index && alert.headPose && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ 
                            fontSize: '11px', 
                            color: '#64748b',
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid rgba(100, 116, 139, 0.2)',
                          }}
                        >
                          <strong style={{ color: '#94a3b8' }}>Head Position:</strong>{' '}
                          Yaw {alert.headPose.yaw.toFixed(1)}° | 
                          Pitch {alert.headPose.pitch.toFixed(1)}° | 
                          Roll {alert.headPose.roll.toFixed(1)}°
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Status indicator pulse */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: getSeverityColor(alert.level),
                    marginTop: '14px',
                    marginLeft: '12px',
                    boxShadow: `0 0 12px ${getSeverityColor(alert.level)}`,
                    flexShrink: 0,
                  }}
                />
              </motion.div>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary stats */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: '24px',
            padding: '20px',
            background: 'rgba(30, 27, 75, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          {[
            { label: 'Severe', color: '#ef4444', count: alerts.filter(a => a.level === 'Severe Fatigue').length },
            { label: 'Moderate', color: '#f59e0b', count: alerts.filter(a => a.level === 'Moderate Fatigue').length },
            { label: 'Mild', color: '#fbbf24', count: alerts.filter(a => a.level === 'Mild Fatigue').length },
            { label: 'Total', color: '#6366f1', count: alerts.length },
          ].map((stat, i) => (
            <div 
              key={i}
              style={{ 
                textAlign: 'center',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '8px',
                border: `1px solid ${stat.color}30`,
              }}
            >
              <div style={{ 
                fontWeight: 700, 
                fontSize: '28px', 
                color: stat.color,
                marginBottom: '4px',
              }}>
                {stat.count}
              </div>
              <div style={{ 
                color: '#94a3b8', 
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default AlertTimeline;
