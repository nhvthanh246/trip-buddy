import React, { useState, useEffect } from 'react';
import { TripPlan } from '../types';
import { Navigation, CloudRain, AlertTriangle, Zap, CheckCircle2, X, MapPin, Utensils, Bed, Camera, Flag } from 'lucide-react';

interface TripMapProps {
  plan: TripPlan;
}

type HazardType = 'traffic' | 'rain' | null;

const getActivityIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('hotel') || t.includes('check-in') || t.includes('stay')) return <Bed className="w-full h-full text-white p-0.5" />;
  if (t.includes('lunch') || t.includes('dinner') || t.includes('breakfast') || t.includes('restaurant') || t.includes('cafe') || t.includes('food')) return <Utensils className="w-full h-full text-white p-0.5" />;
  if (t.includes('museum') || t.includes('park') || t.includes('tour') || t.includes('sight') || t.includes('visit')) return <Camera className="w-full h-full text-white p-0.5" />;
  return <MapPin className="w-full h-full text-white p-0.5" />;
};

export const TripMap: React.FC<TripMapProps> = ({ plan }) => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hazard, setHazard] = useState<{ type: HazardType; segmentIndex: number } | null>(null);
  const [showRerouteAlert, setShowRerouteAlert] = useState(false);
  const [isRerouted, setIsRerouted] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Flatten all activities to get points
  const allPoints = plan.itinerary.flatMap(day => 
    day.activities.map(act => ({ ...act, day: day.day }))
  );

  // Simulate an incoming hazard after component mount
  useEffect(() => {
    if (allPoints.length > 2) {
      const timer = setTimeout(() => {
        // Randomly pick a middle segment to have a hazard
        const randomSegment = Math.floor(Math.random() * (allPoints.length - 2)) + 1;
        const types: HazardType[] = ['traffic', 'rain'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        setHazard({ type: randomType, segmentIndex: randomSegment });
        setShowRerouteAlert(true);
      }, 4000); // Trigger after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [plan]);

  const handleReroute = () => {
    setIsOptimizing(true);
    // Simulate API delay for rerouting
    setTimeout(() => {
      setIsOptimizing(false);
      setIsRerouted(true);
      setShowRerouteAlert(false);
      setHazard(null); // Clear hazard visually as we moved route
    }, 1500);
  };

  if (allPoints.length < 1) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
        Not enough location data to map route.
      </div>
    );
  }

  // Normalization logic
  const lats = allPoints.map(p => p.coordinates.lat);
  const lngs = allPoints.map(p => p.coordinates.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Padding percentage
  const padding = 20; 
  
  const normalizeX = (lng: number) => {
    if (maxLng === minLng) return 50;
    return ((lng - minLng) / (maxLng - minLng)) * (100 - 2 * padding) + padding;
  };

  const normalizeY = (lat: number) => {
    if (maxLat === minLat) return 50;
    return 100 - (((lat - minLat) / (maxLat - minLat)) * (100 - 2 * padding) + padding);
  };

  return (
    <div className="bg-slate-50 rounded-2xl h-full w-full relative overflow-hidden border border-gray-200 shadow-inner flex flex-col group/map select-none">
      
      {/* Top Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className={`backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-[10px] font-bold border flex items-center gap-1.5 transition-colors pointer-events-auto ${
          isRerouted 
            ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200' 
            : 'bg-white/90 text-red-600 border-red-100'
        }`}>
          <Navigation className="w-3 h-3" />
          {isRerouted ? 'OPTIMIZED ROUTE ACTIVE' : 'LIVE GRAPH NAVIGATION'}
        </div>
      </div>

      {/* Reroute Notification / Alert Box */}
      {showRerouteAlert && hazard && (
        <div className="absolute top-16 left-4 right-4 z-20 animate-in slide-in-from-top-2 fade-in duration-300 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-red-100 shadow-xl rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full shrink-0 ${hazard.type === 'traffic' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                {hazard.type === 'traffic' ? <AlertTriangle className="w-4 h-4" /> : <CloudRain className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  {hazard.type === 'traffic' ? 'Congestion Detected' : 'Weather Alert'}
                </h4>
                <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                   Graph re-calculation suggested.
                </p>
              </div>
              <button onClick={() => setShowRerouteAlert(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <button 
              onClick={handleReroute}
              disabled={isOptimizing}
              className="w-full bg-gray-900 hover:bg-black text-white text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isOptimizing ? (
                <>Optimizing Graph...</>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-yellow-400" />
                  Update Route (Save 15m)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {isRerouted && (
         <div className="absolute top-16 left-4 z-20 animate-in fade-in zoom-in duration-300 pointer-events-auto">
            <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-[10px] font-bold">
               <CheckCircle2 className="w-3 h-3" />
               Graph Optimized
            </div>
         </div>
      )}
      
      {/* Background Map Layer - Conceptual Graph Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50" 
           style={{ 
             backgroundColor: '#f8fafc',
             backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
             backgroundSize: '24px 24px',
           }}>
      </div>
      
      {/* Map Interactive Layer */}
      <div className="flex-grow relative z-0 w-full h-full">
        <svg className="w-full h-full filter drop-shadow-sm" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Lines */}
          {allPoints.map((point, i) => {
            if (i === allPoints.length - 1) return null;
            const nextPoint = allPoints[i + 1];
            
            const x1 = normalizeX(point.coordinates.lng);
            const y1 = normalizeY(point.coordinates.lat);
            const x2 = normalizeX(nextPoint.coordinates.lng);
            const y2 = normalizeY(nextPoint.coordinates.lat);

            const isHovered = hoveredSegment === i;
            const isHazardSegment = hazard && hazard.segmentIndex === i;

            // Colors
            let strokeColor = isRerouted ? "#10B981" : "#F43F5E"; // Emerald or Rose
            if (isHazardSegment) strokeColor = "#F59E0B"; // Amber

            // Path Calculation - Add slight curve for organic feel
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            // Add randomness to curve direction based on index to make it look "organic" but deterministic
            const curveFactor = (i % 2 === 0 ? 1 : -1) * (isRerouted ? 5 : 2); 
            
            const pathD = `M ${x1} ${y1} Q ${mx + curveFactor} ${my + curveFactor} ${x2} ${y2}`;

            return (
              <g 
                key={`segment-${i}`} 
                onMouseEnter={() => setHoveredSegment(i)}
                onMouseLeave={() => setHoveredSegment(null)}
                className="cursor-pointer"
              >
                {/* Hit Area (Invisible thick line) */}
                <path d={pathD} stroke="transparent" strokeWidth="15" fill="none" />
                
                {/* Background Border Line (Road effect) */}
                <path
                  d={pathD}
                  stroke="white"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Main Route Line */}
                <path
                  d={pathD}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? "1.2" : "0.8"}
                  strokeDasharray={isHazardSegment ? "1 1" : "0"}
                  fill="none"
                  strokeLinecap="round"
                  className={`transition-all duration-500 ease-in-out ${isRerouted ? 'opacity-80' : 'opacity-100'}`}
                />
                
                {/* Animated Dot on Hover */}
                {isHovered && !isHazardSegment && (
                   <circle r="0.8" fill={strokeColor}>
                      <animateMotion dur="1s" repeatCount="indefinite" path={pathD} />
                   </circle>
                )}

                {/* Tooltip for Segment */}
                {isHovered && (
                  <foreignObject x={mx-10} y={my-5} width="20" height="10" className="pointer-events-none z-50 overflow-visible">
                     <div className="flex justify-center">
                        <span className="bg-black/80 text-white text-[2.5px] px-1.5 py-0.5 rounded-full font-medium shadow-md whitespace-nowrap backdrop-blur-md">
                           {isRerouted ? 'Smart Path' : 'Trip Route'}
                        </span>
                     </div>
                  </foreignObject>
                )}
              </g>
            );
          })}

          {/* Nodes (Activities) */}
          {allPoints.map((point, idx) => {
            const x = normalizeX(point.coordinates.lng);
            const y = normalizeY(point.coordinates.lat);
            const isHovered = hoveredNode === idx;
            const isStart = idx === 0;
            const isEnd = idx === allPoints.length - 1;
            
            return (
              <g 
                key={`node-${idx}`} 
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredNode(idx)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Ripple Effect for Start/End */}
                {(isStart || isEnd) && (
                    <circle cx={x} cy={y} r="8" className="animate-ping opacity-20" fill={isRerouted ? "#10B981" : "#F43F5E"} />
                )}

                {/* Node Background */}
                <circle 
                  cx={x} cy={y} r={isHovered ? "4" : "3"} 
                  fill={isRerouted ? "#10B981" : "#F43F5E"} 
                  className="transition-all duration-300 shadow-sm"
                />
                
                {/* Icon Container */}
                <foreignObject x={x - (isHovered ? 4 : 3)} y={y - (isHovered ? 4 : 3)} width={isHovered ? 8 : 6} height={isHovered ? 8 : 6} className="pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center">
                        {isStart ? <Flag className="w-full h-full text-white p-0.5" /> :
                         isEnd ? <Flag className="w-full h-full text-white p-0.5 fill-current" /> :
                         getActivityIcon(point.activity)}
                    </div>
                </foreignObject>
                
                {/* Node Tooltip */}
                {isHovered && (
                  <foreignObject x={x - 25} y={y - 18} width="50" height="30" className="overflow-visible pointer-events-none z-50">
                    <div className="flex flex-col items-center">
                        <div className="bg-gray-900/95 backdrop-blur text-white text-[3.5px] p-2 rounded-lg shadow-xl border border-gray-700/50 min-w-[60px] text-center transform transition-all">
                            <div className="font-bold uppercase tracking-wider mb-0.5 text-red-400">Day {point.day} • {point.time}</div>
                            <div className="font-bold text-[4px] leading-tight mb-0.5">{point.activity}</div>
                            <div className="text-gray-400 text-[3px] truncate max-w-[80px] mx-auto">{point.location}</div>
                        </div>
                        <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[3px] border-t-gray-900/95"></div>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div className="bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-2 flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 rounded-full ${isRerouted ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
               <span className="text-gray-600 font-medium">Activity</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className={`w-6 h-0.5 rounded-full ${isRerouted ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
               <span className="text-gray-600 font-medium">{isRerouted ? 'Optimized' : 'Planned Route'}</span>
             </div>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin className="w-3 h-3" />
            Graph View
          </div>
      </div>
    </div>
  );
};
