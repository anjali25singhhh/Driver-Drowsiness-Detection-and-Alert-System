import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCamera, faCog, faRecordVinyl, faCircle } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const VideoControlsBar = ({ onFullScreen, onSnapshot, isRecording }) => {
  const controls = [
    { icon: faExpand, label: 'Fullscreen', onClick: onFullScreen, variant: 'outline-light' },
    { icon: faCamera, label: 'Snapshot', onClick: onSnapshot, variant: 'outline-light' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        display: 'flex',
        gap: '8px',
        zIndex: 10,
      }}
    >
      {/* Live Indicator */}
      {isRecording && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.3)',
          }}
        >
          <FontAwesomeIcon 
            icon={faCircle} 
            style={{ color: '#ef4444', fontSize: '8px' }}
          />
          <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
            LIVE
          </span>
        </motion.div>
      )}

      {/* Control Buttons */}
      {controls.map((control, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant={control.variant}
            size="sm"
            onClick={control.onClick}
            title={control.label}
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '10px',
              color: '#6366f1',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.8)';
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
              e.currentTarget.style.background = 'rgba(15, 23, 42, 0.9)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
            }}
          >
            <FontAwesomeIcon icon={control.icon} />
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default VideoControlsBar;
