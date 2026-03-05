import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faBed, faWaveSquare, faHeadSideMask } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const VideoMetricsOverlay = ({ status, isVisible = true }) => {
  const getEARStatus = (ear) => {
    if (ear < 0.2) return { color: '#ef4444', label: 'CRITICAL', glow: 'rgba(239, 68, 68, 0.4)' };
    if (ear < 0.25) return { color: '#f59e0b', label: 'WARNING', glow: 'rgba(245, 158, 11, 0.4)' };
    return { color: '#22c55e', label: 'GOOD', glow: 'rgba(34, 197, 94, 0.4)' };
  };

  const getFatigueColor = (level) => {
    switch (level) {
      case 'Severe Fatigue': return { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' };
      case 'Moderate Fatigue': return { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'Mild Fatigue': return { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' };
      default: return { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' };
    }
  };

  const earStatus = getEARStatus(status.earValue);
  const fatigueStatus = getFatigueColor(status.fatigueLevel);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            zIndex: 10,
          }}
        >
          {/* EAR Metric */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${earStatus.color}40`,
              borderRadius: '12px',
              padding: '12px',
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px ${earStatus.glow}`,
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FontAwesomeIcon icon={faEye} style={{ color: earStatus.color, fontSize: '16px' }} />
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
                EYE ASPECT
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>
                {status.earValue.toFixed(3)}
              </span>
              <span style={{ 
                color: earStatus.color, 
                fontSize: '10px', 
                fontWeight: 700,
                padding: '2px 6px',
                background: `${earStatus.color}20`,
                borderRadius: '4px'
              }}>
                {earStatus.label}
              </span>
            </div>
          </motion.div>

          {/* Fatigue Level Metric */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${fatigueStatus.color}40`,
              borderRadius: '12px',
              padding: '12px',
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px ${fatigueStatus.glow}`,
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FontAwesomeIcon icon={faBed} style={{ color: fatigueStatus.color, fontSize: '16px' }} />
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
                FATIGUE
              </span>
            </div>
            <div>
              <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600 }}>
                {status.fatigueLevel}
              </span>
            </div>
          </motion.div>

          {/* Blink Count Metric */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FontAwesomeIcon icon={faWaveSquare} style={{ color: '#6366f1', fontSize: '16px' }} />
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
                BLINKS
              </span>
            </div>
            <div>
              <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>
                {status.blinkCount}
              </span>
            </div>
          </motion.div>

          {/* Head Pose Metric */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.2)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FontAwesomeIcon icon={faHeadSideMask} style={{ color: '#6366f1', fontSize: '16px' }} />
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
                HEAD POSE
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: '1.3' }}>
              Y:{status.headPose.yaw.toFixed(0)}° P:{status.headPose.pitch.toFixed(0)}° R:{status.headPose.roll.toFixed(0)}°
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoMetricsOverlay;
