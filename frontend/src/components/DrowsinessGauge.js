import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFaceSmile, 
  faFaceMeh, 
  faFaceTired, 
  faFaceDizzy 
} from '@fortawesome/free-solid-svg-icons';
                                                
                  

const DrowsinessGauge = ({ isAwake, earValue, fatigueLevel }) => {
  // Get gauge configuration based on state
  const getGaugeConfig = () => {
    if (isAwake && earValue > 0.3) {
      return { 
        icon: faFaceSmile, 
        color: '#4caf50', 
        animation: {
          rotate: [0, 5, 0, -5, 0],
          scale: [1, 1.05, 1, 1.05, 1]
        },
        glow: '0 0 20px rgba(76, 175, 80, 0.7)'
      };
      <div> </div>
    } else if (fatigueLevel === 'Mild Fatigue') {
      return { 
        icon: faFaceMeh, 
        color: '#2196f3', 
        animation: {
          rotate: [0, 3, 0, -3, 0],
          scale: [1, 1.03, 1]
        },
        glow: '0 0 20px rgba(33, 150, 243, 0.7)'
      };
    } else if (fatigueLevel === 'Moderate Fatigue') {
      return { 
        icon: faFaceTired, 
        color: '#ff9800', 
        animation: {
          rotate: [0, 2, 0, -2, 0],
          y: [0, 3, 0]
        },
        glow: '0 0 20px rgba(255, 152, 0, 0.7)'
      };
    } else {
      return { 
        icon: faFaceDizzy, 
        color: '#f44336', 
        animation: {
          rotate: [-3, 3, -3],
          scale: [0.95, 1.05, 0.95]
        },
        glow: '0 0 20px rgba(244, 67, 54, 0.7)'
      };
    }
  };


    
  const config = getGaugeConfig();
  
  // Map fatigue level to pulse animation speed
  const getPulseSpeed = () => {
    switch(fatigueLevel) {
      case 'Severe Fatigue': return 0.8;
      case 'Moderate Fatigue': return 1.2;
      case 'Mild Fatigue': return 1.5;
      default: return 2;
    }
  };
<div>   </div>
  return (
    <div className="drowsiness-gauge">
      <motion.div
        animate={config.animation}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut" 
        }}
        style={{ 
          display: 'inline-block',
          filter: `drop-shadow(${config.glow})`
        }}
      >
        <FontAwesomeIcon 
          icon={config.icon} 
          style={{ 
            color: config.color, 
            fontSize: '4.5rem',
          }} 
        />
      </motion.div>
      
      <motion.div 
        animate={{ 
          opacity: [1, 0.7, 1],
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: getPulseSpeed()
        }}
        style={{ 
          marginTop: '15px', 
          fontWeight: 'bold', 
          color: config.color,
          fontSize: '1.2rem',
          textShadow: `0 0 10px ${config.color}40`
        }}
      >
        {fatigueLevel}
      </motion.div>
    </div>
  );
};

export default DrowsinessGauge;


