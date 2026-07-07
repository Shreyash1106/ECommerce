import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { gradientDefs, gridStyle, axisTickStyle, colorPalette } from '../charts/ChartStyles';
import { CustomTooltip } from '../charts/CustomTooltip';

/**
 * ChartWrapper – a reusable wrapper that adds consistent styling, gradients,
 * legends, tooltips and optional click handling for Recharts components.
 *
 * Props:
 *   - data: array of data points
 *   - gradientId: string id for gradient definitions
 *   - title: optional string title displayed above the chart
 *   - type: 'area' | 'bar' | 'line' | 'pie'
 *   - colors: optional array of colors for series (fallback to palette)
 *   - onClick: optional function called with (event, data) when chart area clicked
 *   - showLegend: boolean (default true)
 *   - showLabels: boolean (default false) – shows value labels on bars/pies
 */
export const ChartWrapper = ({
  data,
  gradientId = 'grad',
  title,
  type = 'area',
  colors = [],
  onClick,
  showLegend = true,
  showLabels = false,
  xKey,
  yKey,
}) => {
  // Determine data keys with sensible defaults based on chart type
  const xDataKey = xKey || (type === 'bar' ? 'name' : 'month');
  const yDataKey = yKey || (type === 'area' ? 'revenue' : type === 'bar' ? 'sales' : 'value');
  const primary = colors[0] || (colorPalette && colorPalette.primary) || '#6366f1';
  const secondary = colors[1] || (colorPalette && colorPalette.secondary) || '#14b8a6';

  const handleClick = (e) => {
    if (onClick) onClick(e, data);
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data} onClick={handleClick}>
            {gradientDefs(gradientId, primary, primary)}
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={xDataKey} tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Area
              type="monotone"
              dataKey={yDataKey}
              stroke={primary}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              animationBegin={0}
              animationDuration={800}
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data} onClick={handleClick} layout="vertical">
            {gradientDefs(gradientId, primary, primary)}
            <CartesianGrid {...gridStyle} />
            <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xDataKey} tick={axisTickStyle} axisLine={false} tickLine={false} width={120} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Bar dataKey={yDataKey} fill={primary} radius={[0, 4, 4, 0]}>
              {showLabels &&
                data.map((entry, index) => (
                  <Cell key={`label-${index}`} fill={primary} />
                ))}
            </Bar>
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data} onClick={handleClick}>
            {gradientDefs(gradientId, primary, primary)}
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="month" tick={axisTickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Line type="monotone" dataKey={yDataKey} stroke={primary} strokeWidth={2} dot={{ r: 3 }} animationBegin={0} animationDuration={800} />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend verticalAlign="top" height={36} />}
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              isAnimationActive
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index] || primary} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="chart-wrapper">
      {title && <h3 className="text-sm font-semibold text-gray-200 mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={260}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
