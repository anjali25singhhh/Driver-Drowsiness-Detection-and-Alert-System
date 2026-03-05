import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';

const DrowsinessHeatmap = ({ data }) => {
  // Transform data to include intensity (0-100 based on EAR)
  const heatmapData = data.map((item, index) => ({
    time: index,
    intensity: (1 - Math.max(0, Math.min(item.ear, 0.5)) / 0.5) * 100,
    ear: item.ear,
    timeLabel: item.time
  }));

  // Color interpolation based on intensity
  const getColor = (intensity) => {
    if (intensity > 80) return '#dc3545'; // Severe - Red
    if (intensity > 60) return '#fd7e14'; // High - Orange
    if (intensity > 40) return '#ffc107'; // Medium - Yellow
    if (intensity > 20) return '#28a745'; // Low - Green
    return '#17a2b8'; // Very Low - Blue
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '12px'
        }}>
          <p><strong>Time:</strong> {data.timeLabel}</p>
          <p><strong>EAR:</strong> {data.ear.toFixed(3)}</p>
          <p><strong>Intensity:</strong> {data.intensity.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
          <XAxis 
            type="number" 
            dataKey="time" 
            name="Time" 
            stroke="#888"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="intensity" 
            name="Intensity" 
            stroke="#888"
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <ZAxis range={[100, 400]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={heatmapData}>
            {heatmapData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.intensity)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: '10px',
        gap: '15px',
        fontSize: '11px'
      }}>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#17a2b8', borderRadius: '2px', marginRight: '5px' }}></span>Alert</span>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#28a745', borderRadius: '2px', marginRight: '5px' }}></span>Low</span>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ffc107', borderRadius: '2px', marginRight: '5px' }}></span>Medium</span>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fd7e14', borderRadius: '2px', marginRight: '5px' }}></span>High</span>
        <span><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dc3545', borderRadius: '2px', marginRight: '5px' }}></span>Severe</span>
      </div>
    </motion.div>
  );
};

export default DrowsinessHeatmap;
