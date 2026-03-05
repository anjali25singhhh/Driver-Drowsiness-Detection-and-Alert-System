import React from 'react';
import { motion } from 'framer-motion';

const RecordingIndicator = ({ isRecording }) => {
  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        padding: '6px 12px',
        borderRadius: '20px',
        border: '1px solid rgba(220, 53, 69, 0.5)',
        color: '#ef4444',
        fontWeight: '600',
        fontSize: '0.85rem',
      }}
    >
      {/* Pulsing dot */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
        }}
      />
      
      <span>REC</span>
    </motion.div>
  );
};

export default RecordingIndicator;
