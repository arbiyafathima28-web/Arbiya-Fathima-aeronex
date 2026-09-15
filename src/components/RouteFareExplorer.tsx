import React, { useState } from "react";
import {
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  Compass,
  ArrowRight,
  ShieldAlert,
  Info,
  Map as MapIcon,
  LayoutGrid,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { RouteData } from "../types";
import { IndiaRouteMap } from "./IndiaRouteMap";

interface RouteFareExplorerProps {
  routes: RouteData[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export const RouteFareExplorer: React.FC<RouteFareExplorerProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [activeViewMode, setActiveViewMode] = useState<"map" | "grid">("map");

  const filteredRoutes = routes.filter((r) => {
    if (activeCategoryFilter === "all") return true;
    return r.category === activeCategoryFilter;
  });

  // Prepare advance curve chart data
  const advanceCurveData = [
    { label: "T-60 (60 Days)", days: 60, price: currentRoute.advanceCurve.t60 },
    { label: "T-30 (30 Days)", days: 30, price: currentRoute.advanceCurve.t30 },
    { label: "T-14 (14 Days)", days: 14, price: currentRoute.advanceCurve.t14 },
    { label: "T-7 (7 Days)", days: 7, price: currentRoute.advanceCurve.t7 },
    { label: "T-3 (72 Hours)", days: 3, price: currentRoute.advanceCurve.t3 },
    { label: "T-0 (Same Day)", days: 0, price: currentRoute.advanceCurve.t0 },
  ];

  // Price component breakdown estimation for Indian domestic sectors
  const baseFare = Math.round(currentRoute.currentMedianPrice * 0.46);
  const fuelSurcharge = Math.round(currentRoute.currentMedianPrice * 0.36);
  const airportFees = Math.round(currentRoute.currentMedianPrice * 0.12);
  const gstTax = Math.round(currentRoute.currentMedianPrice * 0.06);

  return (
    <div className="space-y-6">
      {/* Interactive India Route Map Component */}
      <IndiaRouteMap
        routes={routes}
        selectedRouteId={selectedRouteId}
        onSelectRoute={onSelectRoute}
      />

      {/* Sector Category Filter & View Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-bold text-white">Representative Sector Basket & DGCA Weights</h2>
            <p className="text-xs text-slate-400">
              Examining price escalation dynamics from 60 days out to day-of-departure (T-0) across Indian city-pairs
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveViewMode("map")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition cursor-pointer ${
                activeViewMode === "map"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map Focus</span>
            </button>
            <button
              onClick={() => setActiveViewMode("grid")}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition cursor-pointer ${
                activeViewMode === "grid"
                  ? "bg-cyan-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Corridors ({routes.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "all", label: "All Sectors" },
              { id: "Metro-Metro", label: "Metro-Metro Trunk" },
              { id: "Metro-NonMetro", label: "Metro-NonMetro" },
              { id: "Tourist & Leisure", label: "Tourist & Leisure" },
              { id: "Regional UDAN", label: "Regional UDAN" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? "bg-cyan-600 text-white font-bold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Corridor Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {filteredRoutes.map((r) => {
          const isSelected = r.id === currentRoute.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                isSelected
                  ? "bg-cyan-950/80 border-cyan-500 shadow-md shadow-cyan-950/50"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
                <span className="text-white">{r.origin} ➔ {r.destination}</span>
                <span
                  className={`text-[10px] ${
                    r.momChange >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {r.momChange >= 0 ? "+" : ""}{r.momChange}%
                </span>
              </div>
              <div className="text-sm font-extrabold text-cyan-300 font-mono">
                ₹{r.currentMedianPrice.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {r.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Corridor Deep Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Advance Booking Decay Curve Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/40">
                  {currentRoute.origin} ➔ {currentRoute.destination}
                </span>
                <span className="text-xs text-slate-400">{currentRoute.category}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Advance Booking Surge Curve (T-60 to T-0)
              </h3>
              <p className="text-xs text-slate-400">
                Shows steep price escalation within 7 days of flight departure (carrier yield management algorithms)
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] uppercase text-slate-500">DGCA Weight</div>
              <div className="text-sm font-bold text-white">{(currentRoute.dgcaWeight * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Bar Chart for T-60 to T-0 */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advanceCurveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Fare Quote"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                  {advanceCurveData.map((entry, index) => {
                    // Gradual color change from emerald (cheap advance) to amber to red (T-0 surge)
                    const colors = ["#10b981", "#10b981", "#06b6d4", "#6366f1", "#f59e0b", "#ef4444"];
                    return <Cell key={`cell-${index}`} fill={colors[index] || "#06b6d4"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Observations */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">T-30 Advance Fare</div>
              <div className="text-sm font-bold text-emerald-400">
                ₹{currentRoute.advanceCurve.t30.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">T-3 (72h) Fare</div>
              <div className="text-sm font-bold text-amber-400">
                ₹{currentRoute.advanceCurve.t3.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">T-0 Walk-up Surge</div>
              <div className="text-sm font-bold text-rose-400">
                ₹{currentRoute.advanceCurve.t0.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* Carrier Market Share & Fare Decomposition (1 Col) */}
        <div className="space-y-4">
          {/* Airline Carrier Share in Sector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <span>Carrier Distribution on Sector</span>
            </h4>

            <div className="space-y-3">
              {currentRoute.carrierShare.map((c) => (
                <div key={c.airline} className="text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      {c.airline} ({c.code})
                    </span>
                    <span className="text-slate-400">
                      {c.sharePercent}% · <strong className="text-cyan-300">₹{c.avgPrice.toLocaleString("en-IN")}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full"
                      style={{ width: `${c.sharePercent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rupee Price Component Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Estimated Fare Cost Architecture</span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Base Airfare:</span>
                <span className="text-white font-bold">₹{baseFare.toLocaleString("en-IN")} (46%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Aviation Fuel Surcharge (YQ):</span>
                <span className="text-amber-400 font-bold">₹{fuelSurcharge.toLocaleString("en-IN")} (36%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Airport User Fees (UDF/ASF):</span>
                <span className="text-slate-300">₹{airportFees.toLocaleString("en-IN")} (12%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">GST (5% Economy):</span>
                <span className="text-slate-300">₹{gstTax.toLocaleString("en-IN")} (6%)</span>
              </div>
              <div className="flex justify-between py-1 pt-2 text-cyan-300 font-bold text-sm">
                <span className="font-sans">Total Scraped Fare:</span>
                <span>₹{currentRoute.currentMedianPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
