import React, { useState } from 'react';
import { formatCurrency } from '../../../shared/lib/formatters.ts';

interface BarDataPoint {
  label: string;
  value: number; // in cents
  dateStr?: string;
}

interface BarChartProps {
  data: Record<string, number>; // date -> cents
  title?: string;
  subtitle?: string;
}

export const ModernBarChart: React.FC<BarChartProps> = ({
  data,
  title = 'Ventas por periodo',
  subtitle = 'Ingresos diarios confirmados (USD)',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  
  // Format items for display
  const points: BarDataPoint[] = entries.map(([day, value]) => {
    const parts = day.split('-');
    const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : day;
    return {
      label: formatted,
      value,
      dateStr: day,
    };
  });

  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const height = 180;
  const barWidth = 28;
  const gap = 16;
  const chartWidth = Math.max(380, points.length * (barWidth + gap) + 40);

  return (
    <div className="bg-white rounded-[24px] border border-[#E9DFE4] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-[#241B24] font-heading">{title}</h3>
          <p className="text-xs text-[#665D65] mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF7F9] border border-[#EE839F]/30 text-xs font-semibold text-[#A91E50]">
          <span className="w-2 h-2 rounded-full bg-[#D52C69] animate-pulse" />
          <span>Confirmados</span>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-[#665D65] bg-[#FFF7F9]/50 rounded-2xl border border-dashed border-[#E9DFE4]">
          No hay ventas registradas en este periodo
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar pb-2 pt-4">
          <div className="relative" style={{ minWidth: `${chartWidth}px` }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${height + 40}`}
              className="w-full h-44 overflow-visible"
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D52C69" />
                  <stop offset="100%" stopColor="#EE839F" />
                </linearGradient>
                <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A91E50" />
                  <stop offset="100%" stopColor="#D52C69" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line
                x1="20"
                y1={height * 0.25}
                x2={chartWidth - 20}
                y2={height * 0.25}
                stroke="#F4F0F2"
                strokeDasharray="4 4"
              />
              <line
                x1="20"
                y1={height * 0.65}
                x2={chartWidth - 20}
                y2={height * 0.65}
                stroke="#F4F0F2"
                strokeDasharray="4 4"
              />
              <line
                x1="20"
                y1={height}
                x2={chartWidth - 20}
                y2={height}
                stroke="#E9DFE4"
              />

              {/* Bars */}
              {points.map((p, i) => {
                const x = 30 + i * (barWidth + gap);
                const barHeight = Math.max(6, (p.value / maxValue) * (height - 24));
                const y = height - barHeight;
                const isHovered = hoveredIndex === i;

                return (
                  <g
                    key={p.dateStr || i}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Background hover highlight pill */}
                    {isHovered && (
                      <rect
                        x={x - 4}
                        y={10}
                        width={barWidth + 8}
                        height={height + 25}
                        fill="#FFF7F9"
                        rx="8"
                      />
                    )}

                    {/* Value bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradient)'}
                      className="transition-all duration-200"
                    />

                    {/* Date label */}
                    <text
                      x={x + barWidth / 2}
                      y={height + 20}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fill={isHovered ? '#A91E50' : '#665D65'}
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <div
                className="absolute -top-3 z-20 pointer-events-none transform -translate-x-1/2 bg-[#241B24] text-white text-xs py-1.5 px-3 rounded-xl shadow-lg border border-white/10 flex flex-col items-center gap-0.5 animate-fadeIn"
                style={{
                  left: `${30 + hoveredIndex * (barWidth + gap) + barWidth / 2}px`,
                }}
              >
                <span className="text-[10px] text-white/70">
                  {points[hoveredIndex].dateStr}
                </span>
                <span className="font-bold font-data text-white">
                  {formatCurrency(points[hoveredIndex].value / 100)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface DonutItem {
  label: string;
  value: number; // in cents or quantity
  color: string;
}

interface DonutChartProps {
  title?: string;
  subtitle?: string;
  data: Record<string, number>; // Category name -> cents
}

const PALETTE_COLORS = [
  '#D52C69', // Frambuesa
  '#EE839F', // Rosa Sumakwarmi
  '#A91E50', // Frambuesa oscuro
  '#267A59', // Verde esmeralda
  '#9A6200', // Ámbar
  '#5B3A5E', // Morado suave
  '#2563A6', // Azul info
];

export const ModernDonutChart: React.FC<DonutChartProps> = ({
  title = 'Ventas por categoría',
  subtitle = 'Distribución de ingresos pagados',
  data,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const rawEntries = Object.entries(data).filter(([, val]) => val > 0);
  const total = rawEntries.reduce((acc, [, val]) => acc + val, 0);

  const items: DonutItem[] = rawEntries.map(([label, value], i) => ({
    label,
    value,
    color: PALETTE_COLORS[i % PALETTE_COLORS.length],
  }));

  // SVG Donut calculation
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-[24px] border border-[#E9DFE4] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[#241B24] font-heading">{title}</h3>
        <p className="text-xs text-[#665D65] mt-0.5">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-[#665D65] bg-[#FFF7F9]/50 rounded-2xl border border-dashed border-[#E9DFE4]">
          Aún no hay compras confirmadas por categoría
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          {/* Donut graphic */}
          <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
            <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F4F0F2"
                strokeWidth={strokeWidth}
              />

              {/* Segmented Arcs */}
              {items.map((item) => {
                const percent = total > 0 ? item.value / total : 0;
                const strokeDasharray = `${percent * circumference} ${circumference}`;
                const strokeDashoffset = -accumulatedPercent * circumference;
                accumulatedPercent += percent;

                const isHovered = hoveredCategory === item.label;

                return (
                  <circle
                    key={item.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(item.label)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[10px] uppercase tracking-wider text-[#665D65] font-semibold">
                {hoveredCategory || 'Total'}
              </span>
              <span className="text-sm font-bold text-[#241B24] font-data">
                {formatCurrency(
                  (hoveredCategory
                    ? items.find((it) => it.label === hoveredCategory)?.value || total
                    : total) / 100,
                )}
              </span>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="flex-1 w-full space-y-2">
            {items.map((item) => {
              const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const isHovered = hoveredCategory === item.label;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => setHoveredCategory(item.label)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between text-xs p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered ? 'bg-[#FFF7F9] shadow-2xs font-semibold' : 'hover:bg-[#F4F0F2]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#241B24] truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[#665D65] font-data">{percent}%</span>
                    <strong className="text-[#241B24] font-data">{formatCurrency(item.value / 100)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
