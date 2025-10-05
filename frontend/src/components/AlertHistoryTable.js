import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const earValue = payload[0].value;
    let alertLevel = 'Alert';
    let color = '#4caf50';
    
    if (earValue < 0.15) {
      alertLevel = 'Severe Fatigue';
      color = '#f44336';
    } else if (earValue < 0.2) {
      alertLevel = 'Moderate Fatigue';
      color = '#ff9800';
    } else if (earValue < 0.25) {
      alertLevel = 'Mild Fatigue';
      color = '#2196f3';
    }
    
    return (
      <div style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
        border: `1px solid ${color}`,
        padding: '10px',
        borderRadius: '5px'
      }}>
        <p style={{ color: 'white', margin: 0 }}>
          <span style={{ fontWeight: 'bold' }}>Time:</span> {label}
        </p>
        <p style={{ color: 'white', margin: 0 }}>
          <span style={{ fontWeight: 'bold' }}>EAR:</span> {earValue.toFixed(3)}
        </p>
        <p style={{ 
          color, 
          margin: '5px 0 0 0',
          fontWeight: 'bold' 
        }}>
          {alertLevel}
        </p>
      </div>
    );
  }
  
  return null;
};

const EARChart = ({ data }) => {
  // Add gradient defs for the chart
  const renderGradient = () => (
    <defs>
      <linearGradient id="earGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
      </linearGradient>
      <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#f44336" stopOpacity={0.1}/>
      </linearGradient>
    </defs>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          {renderGradient()}
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
            tickFormatter={(value) => value.split(':')[0] + ':' + value.split(':')[1]}
            stroke="rgba(255, 255, 255, 0.2)" 
          />
          <YAxis 
            domain={[0, 0.4]} 
            tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
            stroke="rgba(255, 255, 255, 0.2)" 
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Danger zone area */}
          <Area 
            type="monotone" 
            dataKey="value" 
            fill="url(#alertGradient)"
            fillOpacity={1}
            stroke="none"
            activeDot={{ r: 6, fill: "#f44336", stroke: "#fff" }}
            isAnimationActive={true}
            animationDuration={500}
            baseValue={0.15}
          />
          
          {/* Safe zone area */}
          <Area 
            type="monotone" 
            dataKey="value" 
            fill="url(#earGradient)"
            stroke="#4caf50"
            strokeWidth={2}
            activeDot={{ r: 6, fill: "#4caf50", stroke: "#fff" }}
            isAnimationActive={true}
            animationDuration={500}
            connectNulls={true}
          />
          
          {/* Reference lines for fatigue levels */}
          <ReferenceLine 
            y={0.15} 
            stroke="#f44336" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            label={{ 
              value: "Severe", 
              position: "insideTopRight",
              fill: "#f44336",
              fontSize: 10
            }} 
          />
          <ReferenceLine 
            y={0.2} 
            stroke="#ff9800" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            label={{ 
              value: "Moderate", 
              position: "insideTopRight",
              fill: "#ff9800",
              fontSize: 10
            }} 
          />
          <ReferenceLine 
            y={0.25} 
            stroke="#2196f3" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
            label={{ 
              value: "Mild", 
              position: "insideTopRight",
              fill: "#2196f3",
              fontSize: 10
            }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default EARChart;