import React, { useState, useMemo } from "react";
import {
  Plane,
  Navigation,
  TrendingUp,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Globe,
} from "lucide-react";
import { RouteData } from "../types";
import { GoogleAirportsMap, isValidGoogleMapsApiKey } from "./GoogleAirportsMap";

interface IndiaRouteMapProps {
  routes: RouteData[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

// Major Indian Airport Hubs with Geographic SVG coordinates (viewBox 0 0 760 860)
interface AirportHub {
  code: string;
  name: string;
  city: string;
  state: string;
  x: number;
  y: number;
  type: "major" | "secondary" | "regional";
  dailyFlights: number;
  paxMillions: number;
}

const AIRPORTS: Record<string, AirportHub> = {
  DEL: { code: "DEL", name: "Indira Gandhi International", city: "New Delhi", state: "Delhi NCR", x: 250, y: 276, type: "major", dailyFlights: 1450, paxMillions: 73.6 },
  BOM: { code: "BOM", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai", state: "Maharashtra", x: 152, y: 527, type: "major", dailyFlights: 1020, paxMillions: 51.5 },
  BLR: { code: "BLR", name: "Kempegowda International", city: "Bengaluru", state: "Karnataka", x: 264, y: 683, type: "major", dailyFlights: 810, paxMillions: 37.5 },
  CCU: { code: "CCU", name: "Netaji Subhash Chandra Bose", city: "Kolkata", state: "West Bengal", x: 511, y: 433, type: "major", dailyFlights: 540, paxMillions: 19.8 },
  HYD: { code: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", state: "Telangana", x: 280, y: 576, type: "major", dailyFlights: 580, paxMillions: 25.0 },
  MAA: { code: "MAA", name: "Chennai International", city: "Chennai", state: "Tamil Nadu", x: 321, y: 688, type: "major", dailyFlights: 520, paxMillions: 21.2 },
  GOI: { code: "GOI", name: "Dabolim / Manohar Mopa", city: "Goa", state: "Goa", x: 174, y: 625, type: "secondary", dailyFlights: 220, paxMillions: 9.4 },
  PAT: { code: "PAT", name: "Jay Prakash Narayan", city: "Patna", state: "Bihar", x: 434, y: 355, type: "secondary", dailyFlights: 110, paxMillions: 4.8 },
  GAU: { code: "GAU", name: "Lokpriya Gopinath Bordoloi", city: "Guwahati", state: "Assam", x: 584, y: 341, type: "secondary", dailyFlights: 160, paxMillions: 6.2 },
  AMD: { code: "AMD", name: "Sardar Vallabhbhai Patel", city: "Ahmedabad", state: "Gujarat", x: 147, y: 421, type: "secondary", dailyFlights: 310, paxMillions: 11.5 },
  COK: { code: "COK", name: "Cochin International", city: "Kochi", state: "Kerala", x: 234, y: 763, type: "secondary", dailyFlights: 240, paxMillions: 10.3 },
  JAI: { code: "JAI", name: "Jaipur International", city: "Jaipur", state: "Rajasthan", x: 220, y: 322, type: "regional", dailyFlights: 140, paxMillions: 5.4 },
  IXL: { code: "IXL", name: "Kushok Bakula Rimpochee", city: "Leh", state: "Ladakh", x: 260, y: 129, type: "regional", dailyFlights: 45, paxMillions: 1.2 },
};

// Advance booking windows as requested in problem statement
type AdvanceWindow = "t1" | "t7" | "t15" | "t30" | "t45";

export const IndiaRouteMap: React.FC<IndiaRouteMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const [selectedWindow, setSelectedWindow] = useState<AdvanceWindow>("t7");
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [hoveredAirport, setHoveredAirport] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const rawMapsKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "").trim();
  const hasValidMapsKey = isValidGoogleMapsApiKey(rawMapsKey);
  const [mapEngine, setMapEngine] = useState<"google" | "schematic">(
    hasValidMapsKey ? "google" : "schematic"
  );

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Filter routes according to sector category
  const visibleRoutes = useMemo(() => {
    if (filterCategory === "all") return routes;
    return routes.filter((r) => r.category === filterCategory);
  }, [routes, filterCategory]);

  // Helper to get price according to chosen advance window
  const getWindowPrice = (route: RouteData, window: AdvanceWindow) => {
    switch (window) {
      case "t1":
        return Math.round(route.advanceCurve.t0 * 0.92);
      case "t7":
        return route.advanceCurve.t7;
      case "t15":
        return route.advanceCurve.t14;
      case "t30":
        return route.advanceCurve.t30;
      case "t45":
        return Math.round((route.advanceCurve.t30 + route.advanceCurve.t60) / 2);
      default:
        return route.currentMedianPrice;
    }
  };

  // Helper to compute great-circle arc control point
  const getArcPath = (originCode: string, destCode: string, index: number) => {
    const orig = AIRPORTS[originCode];
    const dest = AIRPORTS[destCode];
    if (!orig || !dest) return "";

    const mx = (orig.x + dest.x) / 2;
    const my = (orig.y + dest.y) / 2;
    const dx = dest.x - orig.x;
    const dy = dest.y - orig.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    // Dynamic curve offset to make corridors look like high-altitude flight trajectories
    const curvature = 35 + (index % 3) * 10;
    const nx = -dy / (len || 1);
    const ny = dx / (len || 1);

    const cx = mx + nx * curvature;
    const cy = my + ny * curvature;

    return `M ${orig.x} ${orig.y} Q ${cx} ${cy} ${dest.x} ${dest.y}`;
  };

  // Determine corridor surge color
  const getCorridorColor = (route: RouteData) => {
    if (route.momChange >= 10) return "#f43f5e"; // Severe surge (Crimson)
    if (route.momChange >= 5) return "#f59e0b"; // High surge (Amber)
    if (route.momChange >= 2) return "#06b6d4"; // Moderate growth (Cyan)
    return "#10b981"; // Stable / Discount (Emerald)
  };

  const activeHoveredOrSelectedRoute = hoveredRouteId
    ? routes.find((r) => r.id === hoveredRouteId) || currentRoute
    : currentRoute;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Controls Header */}
      <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 font-mono text-xs font-bold border border-cyan-800/60">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              GEOSPATIAL AVIATION TELEMETRY
            </span>
            <span className="text-xs text-slate-400">DGCA Representative Trunk Corridors</span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Interactive India Airfare Price Matrix & Route Telemetry Map
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Live airfare quotes mapped across India's busiest civil aviation corridors. Click on any route or hub to inspect yield surge curves and carrier market shares.
          </p>
        </div>

        {/* Map Engine & Advance Window Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Engine Selector: Google Maps vs Radar */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setMapEngine("google")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                mapEngine === "google"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-300" />
              <span>Google Maps 3D</span>
            </button>
            <button
              onClick={() => setMapEngine("schematic")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
                mapEngine === "schematic"
                  ? "bg-slate-800 text-cyan-300 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Radar Vector</span>
            </button>
          </div>

          {/* Advance Purchase Window Selector (T+1, T+7, T+15, T+30, T+45) */}
          <div className="bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 flex flex-wrap items-center gap-1">
            <div className="px-2 text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Window:</span>
            </div>
            {(
              [
                { key: "t1", label: "T+1", desc: "Same/Next Day" },
                { key: "t7", label: "T+7", desc: "1 Week Out" },
                { key: "t15", label: "T+15", desc: "2 Weeks" },
                { key: "t30", label: "T+30", desc: "1 Month" },
                { key: "t45", label: "T+45", desc: "Advance Base" },
              ] as const
            ).map((win) => (
              <button
                key={win.key}
                onClick={() => setSelectedWindow(win.key)}
                title={win.desc}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  selectedWindow === win.key
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {win.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-mono mr-1">Filter Network:</span>
          {[
            { id: "all", label: "All Network Corridors" },
            { id: "Metro-Metro", label: "Metro-Metro Trunk" },
            { id: "Metro-NonMetro", label: "Metro-NonMetro (Festive Surges)" },
            { id: "Tourist & Leisure", label: "Tourist / Leisure" },
            { id: "Regional UDAN", label: "Regional Connectivity" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                filterCategory === cat.id
                  ? "bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 font-bold"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-emerald-400"></span>
            <span>Stable (&lt;+2%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-cyan-400"></span>
            <span>Moderate (+2-5%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-amber-400"></span>
            <span>High Surge (+5-10%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-rose-500"></span>
            <span>Festive Shock (&gt;+10%)</span>
          </span>
        </div>
      </div>

      {/* Main Map Stage and HUD Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* Left / Center: Interactive Map Area (8 cols) */}
        <div className="lg:col-span-8 p-3 sm:p-4 bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden min-h-[580px]">
          {mapEngine === "google" ? (
            <GoogleAirportsMap
              routes={visibleRoutes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={onSelectRoute}
              onFallbackToSchematic={() => setMapEngine("schematic")}
            />
          ) : (
            <>
              {/* Subtle Radar Background Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

              {/* Compass Rose Accent */}
              <div className="absolute top-6 right-6 pointer-events-none opacity-30 text-slate-400 flex flex-col items-center font-mono text-[10px]">
                <span className="font-bold text-cyan-400">N</span>
                <div className="w-0.5 h-8 bg-cyan-500/40"></div>
                <span>S</span>
              </div>

              <svg
                viewBox="0 0 760 860"
                className="w-full max-w-[660px] h-auto select-none"
                style={{ filter: "drop-shadow(0 15px 35px rgba(0, 0, 0, 0.6))" }}
              >
                <defs>
                  {/* Radial glow for airport hubs */}
                  <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </radialGradient>

                  {/* Linear gradients for corridors */}
                  <linearGradient id="corridorGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>

                  <linearGradient id="surgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>

                  <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* India Mainland Boundary Outline Path */}
                <path
                  d="
                    M 230 70 
                    Q 260 45, 275 52 
                    Q 310 75, 305 145 
                    Q 330 190, 360 215 
                    Q 420 225, 475 238 
                    L 490 225 
                    L 508 245 
                    L 535 240 
                    Q 580 220, 655 220 
                    Q 665 250, 645 285 
                    Q 630 330, 615 335 
                    Q 590 310, 565 295 
                    Q 535 305, 520 365 
                    Q 505 425, 490 450 
                    Q 445 520, 375 615 
                    Q 340 660, 320 685 
                    Q 295 735, 275 775 
                    Q 260 778, 250 770 
                    Q 235 735, 215 670 
                    Q 190 625, 170 595 
                    Q 150 535, 145 465 
                    Q 135 440, 115 435 
                    Q 85 435, 80 415 
                    Q 105 385, 115 375 
                    Q 95 345, 125 315 
                    Q 155 265, 175 215 
                    Q 195 160, 220 100 
                    Z
                  "
                  fill="#090d16"
                  stroke="#1e293b"
                  strokeWidth="2"
                  className="transition-colors duration-500"
                />

                {/* Subtle internal territorial & state latitude arcs */}
                <path
                  d="M 125 315 Q 240 320, 360 215"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <path
                  d="M 145 465 Q 260 480, 490 450"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />
                <path
                  d="M 170 595 Q 270 590, 375 615"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.4"
                />

                {/* Lakshadweep & Andaman & Nicobar Inset Indicator Boxes */}
                <g opacity="0.5" className="text-[9px] font-mono fill-slate-500">
                  {/* Lakshadweep */}
                  <circle cx="150" cy="740" r="3" fill="#334155" />
                  <circle cx="145" cy="760" r="2.5" fill="#334155" />
                  <text x="110" y="780">Lakshadweep</text>

                  {/* Andaman & Nicobar */}
                  <circle cx="670" cy="650" r="3" fill="#334155" />
                  <circle cx="675" cy="680" r="3.5" fill="#334155" />
                  <circle cx="680" cy="710" r="3" fill="#334155" />
                  <text x="640" y="735">Andaman & Nicobar</text>
                </g>

                {/* Flight Corridors (Curves) */}
                <g className="corridors-group">
                  {visibleRoutes.map((route, idx) => {
                    const isSelected = route.id === activeHoveredOrSelectedRoute.id;
                    const strokeColor = isSelected ? "#38bdf8" : getCorridorColor(route);
                    const pathD = getArcPath(route.origin, route.destination, idx);
                    if (!pathD) return null;

                    // Stroke width proportional to DGCA weight
                    const strokeWidth = isSelected ? 3.5 : Math.max(1.8, route.dgcaWeight * 24);

                    return (
                      <g
                        key={route.id}
                        className="cursor-pointer transition-all duration-300 group"
                        onClick={() => onSelectRoute(route.id)}
                        onMouseEnter={() => setHoveredRouteId(route.id)}
                        onMouseLeave={() => setHoveredRouteId(null)}
                      >
                        {/* Transparent wide stroke for easy clicking/hovering */}
                        <path d={pathD} fill="none" stroke="transparent" strokeWidth="20" />

                        {/* Outer Glow for selected or surging corridors */}
                        {isSelected && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth="7"
                            opacity="0.4"
                            filter="url(#glowEffect)"
                          />
                        )}

                        {/* Main Flight Path Arc */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={isSelected ? "none" : route.momChange > 10 ? "6 3" : "none"}
                          opacity={isSelected ? 1 : 0.75}
                          className="transition-all duration-300"
                        />

                        {/* Midpoint Price Tag / Marker on selected route */}
                        {isSelected && (
                          <circle
                            cx={((AIRPORTS[route.origin]?.x || 0) + (AIRPORTS[route.destination]?.x || 0)) / 2}
                            cy={((AIRPORTS[route.origin]?.y || 0) + (AIRPORTS[route.destination]?.y || 0)) / 2}
                            r="4"
                            fill="#ffffff"
                            stroke="#06b6d4"
                            strokeWidth="2"
                            className="animate-ping"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Airport Hub Pins */}
                <g className="airports-group">
                  {Object.values(AIRPORTS).map((airport) => {
                    const isMajor = airport.type === "major";
                    const isOriginSelected = activeHoveredOrSelectedRoute.origin === airport.code;
                    const isDestSelected = activeHoveredOrSelectedRoute.destination === airport.code;
                    const isRouteTerminal = isOriginSelected || isDestSelected;

                    return (
                      <g
                        key={airport.code}
                        className="cursor-pointer transition-all duration-300 group"
                        onMouseEnter={() => setHoveredAirport(airport.code)}
                        onMouseLeave={() => setHoveredAirport(null)}
                      >
                        {/* Pulsing ring for selected origin / destination */}
                        {isRouteTerminal && (
                          <circle
                            cx={airport.x}
                            cy={airport.y}
                            r={isMajor ? 16 : 12}
                            fill="none"
                            stroke={isOriginSelected ? "#06b6d4" : "#f59e0b"}
                            strokeWidth="2"
                            opacity="0.6"
                            className="animate-pulse"
                          />
                        )}

                        {/* Airport Outer Ring */}
                        <circle
                          cx={airport.x}
                          cy={airport.y}
                          r={isMajor ? 8 : 5}
                          fill={isRouteTerminal ? "#06b6d4" : "#0f172a"}
                          stroke={isMajor ? "#38bdf8" : "#64748b"}
                          strokeWidth={isMajor ? 2.5 : 1.5}
                          className="transition-transform group-hover:scale-125 duration-200"
                        />

                        {/* Airport Center Dot */}
                        <circle
                          cx={airport.x}
                          cy={airport.y}
                          r={isMajor ? 3 : 2}
                          fill={isRouteTerminal ? "#ffffff" : "#38bdf8"}
                        />

                        {/* Airport IATA Code Label */}
                        <text
                          x={airport.x}
                          y={airport.y + (isMajor ? 18 : 14)}
                          textAnchor="middle"
                          className={`font-mono text-[10px] font-bold select-none transition-colors ${
                            isRouteTerminal
                              ? "fill-white font-extrabold text-[11px]"
                              : isMajor
                              ? "fill-cyan-300/90"
                              : "fill-slate-400"
                          }`}
                          style={{
                            paintOrder: "stroke fill",
                            stroke: "#020617",
                            strokeWidth: "3px",
                            strokeLinejoin: "round",
                          }}
                        >
                          {airport.code}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Bottom Telemetry Ticker Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>
                    Active Corridors Monitored: <strong className="text-white">{visibleRoutes.length} City-Pairs</strong>
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                  <span>
                    Selected Window: <strong className="text-cyan-400 uppercase">{selectedWindow.toUpperCase()}</strong>
                  </span>
                  <span>
                    Lead-Time Elasticity: <strong className="text-amber-400">2.35x Surge at T-0</strong>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Selected Corridor Live Deep-Dive HUD (4 cols) */}
        <div className="lg:col-span-4 p-5 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-5">
          {/* Corridor Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/50 uppercase">
                {activeHoveredOrSelectedRoute.category}
              </span>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 uppercase">DGCA Volume Share</span>
                <div className="text-xs font-bold text-white">
                  {(activeHoveredOrSelectedRoute.dgcaWeight * 100).toFixed(1)}% of India
                </div>
              </div>
            </div>

            {/* Origin -> Destination Route Badge */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">{activeHoveredOrSelectedRoute.origin}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[100px]">
                    {AIRPORTS[activeHoveredOrSelectedRoute.origin]?.city || activeHoveredOrSelectedRoute.originName}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white">{activeHoveredOrSelectedRoute.destination}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[100px]">
                    {AIRPORTS[activeHoveredOrSelectedRoute.destination]?.city || activeHoveredOrSelectedRoute.destinationName}
                  </span>
                </div>
              </div>

              {/* Price for Selected Advance Window */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Median Fare ({selectedWindow.toUpperCase()} Advance):
                  </span>
                  <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
                    ₹{getWindowPrice(activeHoveredOrSelectedRoute, selectedWindow).toLocaleString("en-IN")}
                  </div>
                </div>
                <div
                  className={`text-right font-mono text-xs font-bold px-2 py-1 rounded ${
                    activeHoveredOrSelectedRoute.momChange >= 0
                      ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                      : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                  }`}
                >
                  <div>MoM: {activeHoveredOrSelectedRoute.momChange >= 0 ? "+" : ""}{activeHoveredOrSelectedRoute.momChange}%</div>
                  <div className="text-[10px] text-slate-400">YoY: +{activeHoveredOrSelectedRoute.yoyChange}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Advance Window Comparison Matrix */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Advance Window Price Escalation</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div
                onClick={() => setSelectedWindow("t1")}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  selectedWindow === "t1"
                    ? "bg-rose-950/70 border-rose-500"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="text-[10px] text-slate-500 uppercase">T+1 (24h Walk-up)</div>
                <div className="font-bold text-rose-400">
                  ₹{getWindowPrice(activeHoveredOrSelectedRoute, "t1").toLocaleString("en-IN")}
                </div>
              </div>

              <div
                onClick={() => setSelectedWindow("t7")}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  selectedWindow === "t7"
                    ? "bg-cyan-950/70 border-cyan-500"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="text-[10px] text-slate-500 uppercase">T+7 (1 Week Out)</div>
                <div className="font-bold text-cyan-300">
                  ₹{activeHoveredOrSelectedRoute.advanceCurve.t7.toLocaleString("en-IN")}
                </div>
              </div>

              <div
                onClick={() => setSelectedWindow("t15")}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  selectedWindow === "t15"
                    ? "bg-cyan-950/70 border-cyan-500"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="text-[10px] text-slate-500 uppercase">T+15 (2 Weeks)</div>
                <div className="font-bold text-slate-200">
                  ₹{activeHoveredOrSelectedRoute.advanceCurve.t14.toLocaleString("en-IN")}
                </div>
              </div>

              <div
                onClick={() => setSelectedWindow("t30")}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  selectedWindow === "t30"
                    ? "bg-emerald-950/70 border-emerald-500"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="text-[10px] text-slate-500 uppercase">T+30 (Lead Baseline)</div>
                <div className="font-bold text-emerald-400">
                  ₹{activeHoveredOrSelectedRoute.advanceCurve.t30.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          {/* Carrier Yields & Market Distribution */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Airlines Operating on Corridor</span>
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              {activeHoveredOrSelectedRoute.carrierShare.map((carrier) => (
                <div key={carrier.airline} className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span className="text-slate-200 font-semibold">{carrier.airline}</span>
                    <span className="text-[10px] text-slate-500 font-sans">({carrier.sharePercent}%)</span>
                  </div>
                  <span className="font-bold text-cyan-300">
                    ₹{carrier.avgPrice.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={() => onSelectRoute(activeHoveredOrSelectedRoute.id)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plane className="w-4 h-4 transform -rotate-45" />
            <span>Open Comprehensive Advance Decay Curve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
