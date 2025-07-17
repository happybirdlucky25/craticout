import { useState } from "react";
import { useAppStore } from "../store";

// State data with legislator counts
const stateData = {
  AL: { name: "Alabama", senators: 2, house: 7 },
  AK: { name: "Alaska", senators: 2, house: 1 },
  AZ: { name: "Arizona", senators: 2, house: 9 },
  AR: { name: "Arkansas", senators: 2, house: 4 },
  CA: { name: "California", senators: 2, house: 52 },
  CO: { name: "Colorado", senators: 2, house: 8 },
  CT: { name: "Connecticut", senators: 2, house: 5 },
  DE: { name: "Delaware", senators: 2, house: 1 },
  FL: { name: "Florida", senators: 2, house: 28 },
  GA: { name: "Georgia", senators: 2, house: 14 },
  HI: { name: "Hawaii", senators: 2, house: 2 },
  ID: { name: "Idaho", senators: 2, house: 2 },
  IL: { name: "Illinois", senators: 2, house: 17 },
  IN: { name: "Indiana", senators: 2, house: 9 },
  IA: { name: "Iowa", senators: 2, house: 4 },
  KS: { name: "Kansas", senators: 2, house: 4 },
  KY: { name: "Kentucky", senators: 2, house: 6 },
  LA: { name: "Louisiana", senators: 2, house: 6 },
  ME: { name: "Maine", senators: 2, house: 2 },
  MD: { name: "Maryland", senators: 2, house: 8 },
  MA: { name: "Massachusetts", senators: 2, house: 9 },
  MI: { name: "Michigan", senators: 2, house: 13 },
  MN: { name: "Minnesota", senators: 2, house: 8 },
  MS: { name: "Mississippi", senators: 2, house: 4 },
  MO: { name: "Missouri", senators: 2, house: 8 },
  MT: { name: "Montana", senators: 2, house: 2 },
  NE: { name: "Nebraska", senators: 2, house: 3 },
  NV: { name: "Nevada", senators: 2, house: 4 },
  NH: { name: "New Hampshire", senators: 2, house: 2 },
  NJ: { name: "New Jersey", senators: 2, house: 12 },
  NM: { name: "New Mexico", senators: 2, house: 3 },
  NY: { name: "New York", senators: 2, house: 26 },
  NC: { name: "North Carolina", senators: 2, house: 14 },
  ND: { name: "North Dakota", senators: 2, house: 1 },
  OH: { name: "Ohio", senators: 2, house: 15 },
  OK: { name: "Oklahoma", senators: 2, house: 5 },
  OR: { name: "Oregon", senators: 2, house: 6 },
  PA: { name: "Pennsylvania", senators: 2, house: 17 },
  RI: { name: "Rhode Island", senators: 2, house: 2 },
  SC: { name: "South Carolina", senators: 2, house: 7 },
  SD: { name: "South Dakota", senators: 2, house: 1 },
  TN: { name: "Tennessee", senators: 2, house: 9 },
  TX: { name: "Texas", senators: 2, house: 38 },
  UT: { name: "Utah", senators: 2, house: 4 },
  VT: { name: "Vermont", senators: 2, house: 1 },
  VA: { name: "Virginia", senators: 2, house: 11 },
  WA: { name: "Washington", senators: 2, house: 10 },
  WV: { name: "West Virginia", senators: 2, house: 2 },
  WI: { name: "Wisconsin", senators: 2, house: 8 },
  WY: { name: "Wyoming", senators: 2, house: 1 }
};

// Simplified US states arranged in a grid pattern that resembles the US map
const stateLayout = [
  { code: 'WA', x: 100, y: 50, width: 80, height: 40 },
  { code: 'OR', x: 100, y: 90, width: 80, height: 40 },
  { code: 'CA', x: 100, y: 130, width: 80, height: 120 },
  { code: 'NV', x: 180, y: 130, width: 60, height: 80 },
  { code: 'ID', x: 180, y: 50, width: 60, height: 80 },
  { code: 'UT', x: 240, y: 130, width: 60, height: 80 },
  { code: 'AZ', x: 240, y: 210, width: 60, height: 80 },
  { code: 'MT', x: 240, y: 50, width: 100, height: 40 },
  { code: 'WY', x: 240, y: 90, width: 100, height: 40 },
  { code: 'CO', x: 340, y: 130, width: 80, height: 60 },
  { code: 'NM', x: 340, y: 190, width: 80, height: 60 },
  { code: 'ND', x: 340, y: 50, width: 80, height: 40 },
  { code: 'SD', x: 340, y: 90, width: 80, height: 40 },
  { code: 'NE', x: 420, y: 130, width: 80, height: 40 },
  { code: 'KS', x: 420, y: 170, width: 80, height: 40 },
  { code: 'OK', x: 420, y: 210, width: 80, height: 40 },
  { code: 'TX', x: 420, y: 250, width: 120, height: 100 },
  { code: 'MN', x: 500, y: 50, width: 80, height: 80 },
  { code: 'IA', x: 500, y: 130, width: 80, height: 40 },
  { code: 'MO', x: 500, y: 170, width: 80, height: 40 },
  { code: 'AR', x: 500, y: 210, width: 80, height: 40 },
  { code: 'LA', x: 500, y: 250, width: 80, height: 40 },
  { code: 'WI', x: 580, y: 50, width: 60, height: 80 },
  { code: 'IL', x: 580, y: 130, width: 60, height: 80 },
  { code: 'MS', x: 580, y: 210, width: 60, height: 60 },
  { code: 'AL', x: 580, y: 270, width: 60, height: 60 },
  { code: 'TN', x: 640, y: 170, width: 80, height: 40 },
  { code: 'KY', x: 640, y: 130, width: 80, height: 40 },
  { code: 'IN', x: 640, y: 90, width: 60, height: 40 },
  { code: 'MI', x: 640, y: 50, width: 80, height: 40 },
  { code: 'OH', x: 720, y: 90, width: 80, height: 80 },
  { code: 'GA', x: 640, y: 210, width: 80, height: 80 },
  { code: 'FL', x: 720, y: 290, width: 100, height: 40 },
  { code: 'SC', x: 720, y: 210, width: 60, height: 40 },
  { code: 'NC', x: 720, y: 170, width: 80, height: 40 },
  { code: 'VA', x: 780, y: 130, width: 80, height: 40 },
  { code: 'WV', x: 800, y: 90, width: 60, height: 40 },
  { code: 'PA', x: 800, y: 50, width: 80, height: 40 },
  { code: 'NY', x: 880, y: 50, width: 80, height: 80 },
  { code: 'VT', x: 960, y: 50, width: 40, height: 40 },
  { code: 'NH', x: 960, y: 90, width: 40, height: 40 },
  { code: 'ME', x: 1000, y: 50, width: 60, height: 80 },
  { code: 'MA', x: 960, y: 130, width: 60, height: 30 },
  { code: 'RI', x: 1020, y: 130, width: 20, height: 20 },
  { code: 'CT', x: 960, y: 160, width: 40, height: 30 },
  { code: 'NJ', x: 880, y: 130, width: 40, height: 40 },
  { code: 'DE', x: 860, y: 130, width: 20, height: 30 },
  { code: 'MD', x: 860, y: 160, width: 60, height: 30 },
  // Alaska and Hawaii positioned at bottom
  { code: 'AK', x: 100, y: 400, width: 80, height: 60 },
  { code: 'HI', x: 200, y: 400, width: 60, height: 40 }
];

export function USMap() {
  const { legislatureLevel, setSelectedState, selectedState } = useAppStore();
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleStateClick = (stateCode: string) => {
    setSelectedState(stateCode);
  };

  const handleMouseMove = (e: React.MouseEvent, stateCode: string) => {
    const svgRect = (e.currentTarget as SVGElement).closest('svg')?.getBoundingClientRect();
    if (svgRect) {
      setTooltipPosition({
        x: e.clientX - svgRect.left,
        y: e.clientY - svgRect.top
      });
    }
    setHoveredState(stateCode);
  };

  const getStateColor = (stateCode: string) => {
    const baseColors = [
      "#93c5fd", "#bfdbfe", "#dbeafe", "#86efac", "#bbf7d0", 
      "#dcfce7", "#fef3c7", "#fde68a", "#fca5a5", "#fecaca", 
      "#fed7d7", "#f3e8ff", "#e9d5ff", "#c7d2fe", "#e0e7ff",
      "#a5f3fc", "#67e8f9", "#22d3ee", "#06b6d4", "#0891b2"
    ];
    
    const stateIndex = Object.keys(stateData).indexOf(stateCode);
    const colorIndex = stateIndex % baseColors.length;
    
    if (selectedState === stateCode) {
      return "#2563eb"; // Blue-600
    }
    if (hoveredState === stateCode) {
      return "#3b82f6"; // Blue-500
    }
    return baseColors[colorIndex];
  };

  const renderTooltip = () => {
    if (!hoveredState || !stateData[hoveredState as keyof typeof stateData]) return null;
    
    const state = stateData[hoveredState as keyof typeof stateData];

    return (
      <div 
        className="absolute z-10 bg-black text-white px-3 py-2 rounded shadow-lg text-sm pointer-events-none"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y - 70,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="font-semibold">{state.name}</div>
        <div className="text-xs">
          {legislatureLevel === 'federal' ? (
            <>
              <div>Senators: {state.senators}</div>
              <div>House Members: {state.house}</div>
            </>
          ) : (
            <>
              <div>State Senators: {state.senators * 2}</div>
              <div>State Reps: {state.house * 3}</div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">
        {legislatureLevel === 'federal' ? 'Federal' : 'State'} Legislators by State
      </h3>
      
      <div className="relative w-full h-96 overflow-hidden">
        <svg
          viewBox="0 0 1100 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* State rectangles arranged in US map pattern */}
          {stateLayout.map((state) => (
            <g key={state.code}>
              <rect
                x={state.x}
                y={state.y}
                width={state.width}
                height={state.height}
                fill={getStateColor(state.code)}
                stroke="#ffffff"
                strokeWidth="2"
                className="cursor-pointer transition-all hover:brightness-110"
                onMouseMove={(e) => handleMouseMove(e, state.code)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => handleStateClick(state.code)}
              />
              <text
                x={state.x + state.width / 2}
                y={state.y + state.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-bold fill-gray-800 pointer-events-none"
                style={{ fontSize: '11px' }}
              >
                {state.code}
              </text>
            </g>
          ))}
        </svg>

        {renderTooltip()}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Click on a state to filter legislators by that state
      </div>
    </div>
  );
}