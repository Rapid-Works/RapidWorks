'use client';

import React from 'react';

const RadarChart = ({ data, size = 400 }) => {
  const center = size / 2;
  const maxRadius = size * 0.35;
  const levels = 3;
  const rotationOffset = Math.PI / 8; // 22.5 degrees rotation
  
  // Calculate angle for each section: 4 on left, 4 on right
  const getAngle = (index) => {
    const totalSections = data.length;
    const sectionsPerSide = totalSections / 2;
    
    if (index < sectionsPerSide) {
      // Left side: distribute across 180 degrees (π/2 to 3π/2)
      const leftAngleStep = Math.PI / sectionsPerSide;
      const leftStartAngle = Math.PI / 2; // Start at top-left
      return leftStartAngle + index * leftAngleStep + rotationOffset;
    } else {
      // Right side: distribute across 180 degrees (-π/2 to π/2)
      const rightAngleStep = Math.PI / sectionsPerSide;
      const rightStartAngle = -Math.PI / 2; // Start at top-right
      const rightIndex = index - sectionsPerSide;
      return rightStartAngle + rightIndex * rightAngleStep + rotationOffset;
    }
  };

  // Generate points for a polygon at a given level (0-1)
  const getPolygonPoints = (levelValue) => {
    return data
      .map((item, i) => {
        const angle = getAngle(i);
        const value = levelValue;
        const x = center + Math.cos(angle) * maxRadius * value;
        const y = center + Math.sin(angle) * maxRadius * value;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Generate points for the data
  const getDataPoints = () => {
    return data
      .map((item, i) => {
        const angle = getAngle(i);
        const value = item.value / item.max;
        const x = center + Math.cos(angle) * maxRadius * value;
        const y = center + Math.sin(angle) * maxRadius * value;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Generate label positions
  const getLabelPosition = (index) => {
    const angle = getAngle(index);
    const labelRadius = maxRadius + 60; // Increased from 40 to 60 for more space
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    return { x, y, angle };
  };

  // Generate value label positions (the numbers on the chart)
  const getValueLabelPosition = (index) => {
    const angle = getAngle(index);
    const item = data[index];
    const value = item.value / item.max;
    const labelRadius = maxRadius * value + 15;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    return { x, y };
  };

  return (
    <svg width={size} height={size} className="radar-chart" viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {/* Background grid circles */}
      {[...Array(levels)].map((_, i) => {
        const level = (i + 1) / levels;
        return (
          <polygon
            key={`grid-${i}`}
            points={getPolygonPoints(level)}
            fill="none"
            stroke="#6b7280"
            strokeWidth="1"
          />
        );
      })}

      {/* Grid lines from center to each axis */}
      {data.map((item, i) => {
        const angle = getAngle(i);
        const x = center + Math.cos(angle) * maxRadius;
        const y = center + Math.sin(angle) * maxRadius;
        return (
          <line
            key={`line-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#6b7280"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={getDataPoints()}
        fill="rgba(59, 130, 246, 0.3)"
        stroke="rgba(59, 130, 246, 1)"
        strokeWidth="2"
      />

      {/* Data points */}
      {data.map((item, i) => {
        const angle = getAngle(i);
        const value = item.value / item.max;
        const x = center + Math.cos(angle) * maxRadius * value;
        const y = center + Math.sin(angle) * maxRadius * value;
        return (
          <circle
            key={`point-${i}`}
            cx={x}
            cy={y}
            r="4"
            fill="rgba(59, 130, 246, 1)"
            stroke="white"
            strokeWidth="2"
          />
        );
      })}

      {/* Labels */}
      {data.map((item, i) => {
        const { x, y, angle } = getLabelPosition(i);
        const rotation = ((angle + Math.PI / 2) * 180) / Math.PI;

        // Adjust text anchor based on position
        let textAnchor = 'middle';
        if (Math.abs(x - center) > 10) {
          textAnchor = x > center ? 'start' : 'end';
        }

        return (
          <text
            key={`label-${i}`}
            x={x}
            y={y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            className={`text-sm font-medium ${item.muted ? 'fill-gray-300' : 'fill-gray-700'}`}
            style={{ textOverflow: 'visible', overflow: 'visible' }}
          >
            {item.label}
          </text>
        );
      })}

      {/* Value labels on the data points */}
      {data.map((item, i) => {
        if (item.value === 0) return null;
        const { x, y } = getValueLabelPosition(i);
        return (
          <text
            key={`value-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-bold fill-blue-600"
          >
            {item.value.toFixed(1)}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;
