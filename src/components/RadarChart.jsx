'use client';

import React from 'react';

const RadarChart = ({ data, size = 400 }) => {
  const center = size / 2;
  const maxRadius = size * 0.35;
  const levels = 3;
  const angleStep = (2 * Math.PI) / data.length;

  // Generate points for a polygon at a given level (0-1)
  const getPolygonPoints = (levelValue) => {
    return data
      .map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
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
        const angle = i * angleStep - Math.PI / 2;
        const value = item.value / item.max;
        const x = center + Math.cos(angle) * maxRadius * value;
        const y = center + Math.sin(angle) * maxRadius * value;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Generate label positions
  const getLabelPosition = (index) => {
    const angle = index * angleStep - Math.PI / 2;
    const labelRadius = maxRadius + 40;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    return { x, y, angle };
  };

  // Generate value label positions (the numbers on the chart)
  const getValueLabelPosition = (index) => {
    const angle = index * angleStep - Math.PI / 2;
    const item = data[index];
    const value = item.value / item.max;
    const labelRadius = maxRadius * value + 15;
    const x = center + Math.cos(angle) * labelRadius;
    const y = center + Math.sin(angle) * labelRadius;
    return { x, y };
  };

  return (
    <svg width={size} height={size} className="radar-chart">
      {/* Background grid circles */}
      {[...Array(levels)].map((_, i) => {
        const level = (i + 1) / levels;
        return (
          <polygon
            key={`grid-${i}`}
            points={getPolygonPoints(level)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Grid lines from center to each axis */}
      {data.map((item, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + Math.cos(angle) * maxRadius;
        const y = center + Math.sin(angle) * maxRadius;
        return (
          <line
            key={`line-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#e5e7eb"
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
        const angle = i * angleStep - Math.PI / 2;
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
            className="text-sm font-medium fill-gray-700"
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
            {item.value}
          </text>
        );
      })}
    </svg>
  );
};

export default RadarChart;
