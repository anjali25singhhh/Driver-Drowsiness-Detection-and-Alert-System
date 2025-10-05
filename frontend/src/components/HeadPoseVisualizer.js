import React from 'react';
import { motion } from 'framer-motion';

const HeadPoseVisualizer = ({ headPose }) => {
  const { yaw, pitch, roll } = headPose;

  // Calculate face position based on head pose angles
  const calculateTransform = () => {
    // Limit the rotation angles for visualization
    const limitedYaw = Math.max(-30, Math.min(30, yaw));
    const limitedPitch = Math.max(-30, Math.min(30, pitch));
    const limitedRoll = Math.max(-30, Math.min(30, roll));

    return `rotateX(${-limitedPitch}deg) rotateY(${limitedYaw}deg) rotateZ(${limitedRoll}deg)`;
  };

  // Determine alert status based on head pose
  const getAlertStatus = () => {
    if (Math.abs(yaw) > 20 || Math.abs(pitch) > 15) {
      return { 
        color: '#f44336', 
        message: 'Poor Head Position',
        shadow: '0 0 20px rgba(244, 67, 54, 0.6)'
      };
    } else if (Math.abs(yaw) > 10 || Math.abs(pitch) > 10) {
      return { 
        color: '#ff9800', 
        message: 'Attention to Head Position',
        shadow: '0 0 15px rgba(255, 152, 0, 0.5)'
      };
    } else {
      return { 
        color: '#4caf50', 
        message: 'Good Head Position',
        shadow: '0 0 15px rgba(76, 175, 80, 0.5)'
      };
    }
  };

  const alertStatus = getAlertStatus();

  return (
    <div className="head-pose-visualizer">
      <div 
        style={{
          perspective: '500px',
          transformStyle: 'preserve-3d',
          width: '120px',
          height: '120px',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        <motion.div 
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            border: `3px solid ${alertStatus.color}`,
            boxShadow: alertStatus.shadow,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            transform: calculateTransform(),
            transformStyle: 'preserve-3d',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {/* Head details */}
          <div style={{ 
            position: 'absolute', 
            top: '20%',
            width: '80%',
            height: '60%',
            borderRadius: '40% 40% 60% 60%',
            background: 'rgba(255, 255, 255, 0.2)',
          }}></div>
          
          {/* Eyes */}
          <div style={{
            display: 'flex',
            width: '60%',
            justifyContent: 'space-between',
            position: 'absolute',
            top: '35%',
            zIndex: 1
          }}>
            <motion.div 
              animate={{ scaleY: [1, 0.2, 1], transition: { repeatDelay: 3 } }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)'
              }}
            ></motion.div>
            <motion.div 
              animate={{ scaleY: [1, 0.2, 1], transition: { repeatDelay: 3 } }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)'
              }}
            ></motion.div>
          </div>

          {/* Eyebrows */}
          <div style={{
            display: 'flex',
            width: '60%',
            justifyContent: 'space-between',
            position: 'absolute',
            top: '28%',
            zIndex: 1
          }}>
            <div style={{
              width: '15px',
              height: '3px',
              borderRadius: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}></div>
            <div style={{
              width: '15px',
              height: '3px',
              borderRadius: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}></div>
          </div>

          {/* Mouth */}
          <motion.div 
            animate={{
              d: Math.abs(yaw) > 15 || Math.abs(pitch) > 15 
                ? [
                    "M 25,70 Q 40,80 55,70", 
                    "M 25,75 Q 40,85 55,75", 
                    "M 25,70 Q 40,80 55,70"
                  ]
                : [
                    "M 25,65 Q 40,55 55,65", 
                    "M 25,60 Q 40,50 55,60",
                    "M 25,65 Q 40,55 55,65"
                  ]
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, 0%)',
              width: '40px',
              height: '20px'
            }}
          >
            <svg width="80" height="40" viewBox="0 0 80 40">
              <path
                d={Math.abs(yaw) > 15 || Math.abs(pitch) > 15 
                  ? "M 25,70 Q 40,80 55,70" 
                  : "M 25,65 Q 40,55 55,65"}
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="3"
                fill="transparent"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ 
          opacity: [0.8, 1, 0.8],
          y: [0, -2, 0]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          textAlign: 'center',
          marginTop: '15px',
          fontWeight: 'bold',
          color: alertStatus.color,
          textShadow: `0 0 5px ${alertStatus.color}80`
        }}
      >
        {alertStatus.message}
      </motion.div>
    </div>
  );
};

export default HeadPoseVisualizer;