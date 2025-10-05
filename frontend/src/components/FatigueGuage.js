import React from 'react';
import { motion } from 'framer-motion';

const FatigueGauge = ({ earValue, fatigueLevel, isDrowsy }) => {
  // Calculate percentage for gauge (EAR normally between 0.2 and 0.4)
  const percentage = Math.min(100, Math.max(0, (earValue - 0.15) * 400));
  
  // Determine styles based on fatigue level
  const getStylesForFatigueLevel = () => {
    switch (fatigueLevel) {
      case "Severe Fatigue":
        return {
          color: "text-red-500",
          bg: "bg-red-500",
          shadow: "shadow-red-500/50",
          pulse: true
        };
      case "Moderate Fatigue":
        return {
          color: "text-yellow-500",
          bg: "bg-yellow-500", 
          shadow: "shadow-yellow-500/30",
          pulse: true
        };
      case "Mild Fatigue":
        return {
          color: "text-blue-400",
          bg: "bg-blue-400",
          shadow: "shadow-blue-400/20",
          pulse: false
        };
      default:
        return {
          color: "text-green-500",
          bg: "bg-green-500",
          shadow: "shadow-green-500/20",
          pulse: false
        };
    }
  };
  
  const styles = getStylesForFatigueLevel();
  
  return (
    <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <motion.span 
          className={`font-bold text-xl ${isDrowsy ? 'text-red-500' : 'text-green-500'}`}
          animate={styles.pulse ? { opacity: [1, 0.6, 1] } : {}}
          transition={{ repeat: Infinity, duration: isDrowsy ? 0.8 : 2 }}
        >
          {isDrowsy ? 'DROWSY ALERT' : 'ALERT STATE'}
        </motion.span>
        <span className={`${styles.color} font-medium`}>{fatigueLevel}</span>
      </div>
      
      <div className="relative w-full h-6 bg-gray-900 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={`h-full ${styles.bg} transition-all`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Threshold markers */}
        <div className="absolute inset-y-0 left-0 w-full flex pointer-events-none">
          <div className="h-full border-r-2 border-red-500 border-dashed opacity-50" style={{ left: '25%' }} />
          <div className="h-full border-r-2 border-yellow-500 border-dashed opacity-50" style={{ left: '40%' }} />
          <div className="h-full border-r-2 border-blue-400 border-dashed opacity-50" style={{ left: '60%' }} />
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Eyes Closed</span>
        <span className={`font-mono ${styles.color} font-bold`}>EAR: {earValue.toFixed(3)}</span>
        <span>Eyes Open</span>
      </div>
    </div>
  );
};

export default FatigueGauge;