import React from 'react';
import { motion } from 'framer-motion';

const AlertnessRing = ({ earValue, size = 150, strokeWidth = 12 }) => {
  // Calculate alertness score (0-100) from EAR
  const calculateScore = (ear) => {
    // EAR typically ranges from 0 (closed) to 0.4 (fully open)
    // We'll map 0.25-0.4 to 100%, anything below 0.25 proportionally lower
    if (ear >= 0.3) return 100;
    if (ear <= 0.15) return 0;
    return ((ear - 0.15) / (0.3 - 0.15)) * 100;
  };

  const score = calculateScore(earValue);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getColor = (score) => {
    if (score >= 80) return '#28a745'; // Green - Excellent
    if (score >= 60) return '#17a2b8'; // Blue - Good
    if (score >= 40) return '#ffc107'; // Yellow - Fair
    if (score >= 20) return '#fd7e14'; // Orange - Poor
    return '#dc3545'; // Red - Critical
  };

  const color = getColor(score);

  // Status text
  const getStatus = (score) => {
    if (score >= 80) return 'Fully Alert';
    if (score >= 60) return 'Alert';
    if (score >= 40) return 'Mild Fatigue';
    if (score >= 20) return 'Drowsy';
    return 'Severe Drowsiness';
  };

  const status = getStatus(score);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`
          }}
        />
        
        {/* Center text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          style={{
            fontSize: `${size / 3.5}px`,
            fontWeight: 'bold',
            fill: color,
            transform: 'rotate(90deg)',
            transformOrigin: '50% 50%',
          }}
        >
          {Math.round(score)}%
        </text>
      </svg>
      
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          marginTop: '12px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: color,
            marginBottom: '4px',
          }}
        >
          {status}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#888',
          }}
        >
          EAR: {earValue.toFixed(3)}
        </div>
      </motion.div>
      
      {/* Pulsing animation when drowsy */}
      {score < 40 && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `3px solid ${color}`,
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.div>
  );
};

export default AlertnessRing;
