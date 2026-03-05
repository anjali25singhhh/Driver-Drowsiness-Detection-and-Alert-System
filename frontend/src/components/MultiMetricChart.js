import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const MultiMetricChart = ({ earHistory, headPoseHistory, blinkHistory }) => {
  // Combine all metrics into single dataset
  const combinedData = earHistory.map((item, index) => ({
    time: item.time,
    ear: item.ear,
    headYaw: headPoseHistory[index]?.yaw || 0,
    headPitch: headPoseHistory[index]?.pitch || 0,
    blinkRate: blinkHistory[index]?.rate || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '12px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '4px 0' }}>
              <strong>{entry.name}:</strong> {typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={combinedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="earGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#888"
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#888"
            tick={{ fontSize: 11 }}
            domain={[0, 0.5]}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="#888"
            tick={{ fontSize: 11 }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          
          {/* EAR with area fill */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="ear"
            name="Eye Aspect Ratio"
            fill="url(#earGradient)"
            stroke="#8884d8"
            strokeWidth={2}
          />
          
          {/* Head Yaw */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="headYaw"
            name="Head Yaw"
            stroke="#82ca9d"
            strokeWidth={2}
            dot={false}
          />
          
          {/* Head Pitch */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="headPitch"
            name="Head Pitch"
            stroke="#ffc658"
            strokeWidth={2}
            dot={false}
          />
          
          {/* Blink Rate */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="blinkRate"
            name="Blink Rate"
            stroke="#ff7c7c"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
          
          {/* Drowsiness Threshold Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey={() => 0.25}
            name="Drowsiness Threshold"
            stroke="#dc3545"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default MultiMetricChart;
