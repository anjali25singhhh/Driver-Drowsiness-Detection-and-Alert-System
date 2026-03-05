import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const HeadPoseRadar = ({ headPose }) => {
  // Normalize values to 0-100 scale for visualization
  const normalizeValue = (value, max = 90) => {
    return Math.min(100, (Math.abs(value) / max) * 100);
  };

  const data = [
    {
      axis: 'Yaw (Left/Right)',
      value: normalizeValue(headPose.yaw),
      fullMark: 100,
    },
    {
      axis: 'Pitch (Up/Down)',
      value: normalizeValue(headPose.pitch),
      fullMark: 100,
    },
    {
      axis: 'Roll (Tilt)',
      value: normalizeValue(headPose.roll),
      fullMark: 100,
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '10px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px'
        }}>
          <p><strong>{payload[0].payload.axis}</strong></p>
          <p>Deviation: {payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Determine alert status based on head pose
  const getAlertStatus = () => {
    const maxDeviation = Math.max(
      normalizeValue(headPose.yaw),
      normalizeValue(headPose.pitch),
      normalizeValue(headPose.roll)
    );

    if (maxDeviation > 70) return { status: 'Severe', color: '#dc3545' };
    if (maxDeviation > 50) return { status: 'Warning', color: '#ffc107' };
    return { status: 'Normal', color: '#28a745' };
  };

  const alertStatus = getAlertStatus();

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -10 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center' }}
    >
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
          <PolarAngleAxis 
            dataKey="axis" 
            tick={{ fill: '#888', fontSize: 11 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: '#888', fontSize: 10 }}
          />
          <Radar
            name="Head Position"
            dataKey="value"
            stroke={alertStatus.color}
            fill={alertStatus.color}
            fillOpacity={0.6}
            animationDuration={800}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
      
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: `${alertStatus.color}20`,
          border: `2px solid ${alertStatus.color}`,
          borderRadius: '20px',
          display: 'inline-block',
          fontWeight: 'bold',
          color: alertStatus.color
        }}
      >
        Head Position: {alertStatus.status}
      </motion.div>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-around',
        color: '#666'
      }}>
        <div>
          <strong>Yaw:</strong> {headPose.yaw.toFixed(1)}°
        </div>
        <div>
          <strong>Pitch:</strong> {headPose.pitch.toFixed(1)}°
        </div>
        <div>
          <strong>Roll:</strong> {headPose.roll.toFixed(1)}°
        </div>
      </div>
    </motion.div>
  );
};

export default HeadPoseRadar;
