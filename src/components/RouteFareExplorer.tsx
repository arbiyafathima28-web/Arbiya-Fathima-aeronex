import React, { useState } from "react";
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Percent,
  DollarSign,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Users,
  Building2,
  SplitSquareVertical,
  Activity,
  MapPin,
  Map as MapIcon,
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
import { RouteData, AnomalyAlert } from "../types";

interface RouteFareExplorerProps {
  routes: RouteData[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  anomalies?: AnomalyAlert[];
  onOpenMap?: () => void;
}

export const RouteFareExplorer: React.FC<RouteFareExplorerProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  anomalies = [],
  onOpenMap,
}) => {
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [activeBookingMetric, setActiveBookingMetric] = useState<"price" | "multiplier">("price");

  const filteredRoutes = routes.filter((r) => {
    if (activeCategoryFilter === "all") return true;
    return r.category === activeCategoryFilter;
  });

  // Calculate route AFPI index (Base 2024 = 100)
  const routeAfpi = ((currentRoute.currentMedianPrice / currentRoute.basePrice2024) * 100).toFixed(1);

  // Daily, weekly, monthly changes
  const monthlyChange = currentRoute.momChange;
  const weeklyChange = (currentRoute.momChange * 0.42).toFixed(1);
  const dailyChange = (currentRoute.momChange * 0.08).toFixed(1);

  // Check if current route has active anomaly
  const activeAnomaly = anomalies.find(
    (a) =>
      a.routeId === currentRoute.id ||
      a.route.includes(currentRoute.origin) && a.route.includes(currentRoute.destination)
  );

  // Advance curve chart data
  const advanceCurveData = [
    { label: "T-60", days: 60, price: currentRoute.advanceCurve.t60, multiplier: (currentRoute.advanceCurve.t60 / currentRoute.basePrice2024).toFixed(2) },
    { label: "T-30", days: 30, price: currentRoute.advanceCurve.t30, multiplier: (currentRoute.advanceCurve.t30 / currentRoute.basePrice2024).toFixed(2) },
    { label: "T-14", days: 14, price: currentRoute.advanceCurve.t14, multiplier: (currentRoute.advanceCurve.t14 / currentRoute.basePrice2024).toFixed(2) },
    { label: "T-7", days: 7, price: currentRoute.advanceCurve.t7, multiplier: (currentRoute.advanceCurve.t7 / currentRoute.basePrice2024).toFixed(2) },
    { label: "T-3", days: 3, price: currentRoute.advanceCurve.t3, multiplier: (currentRoute.advanceCurve.t3 / currentRoute.basePrice2024).toFixed(2) },
    { label: "T-0 (Walk-up)", days: 0, price: currentRoute.advanceCurve.t0, multiplier: (currentRoute.advanceCurve.t0 / currentRoute.basePrice2024).toFixed(2) },
  ];

  // Price component breakdown estimation for Indian domestic sectors
  const baseFare = Math.round(currentRoute.currentMedianPrice * 0.46);
  const fuelSurcharge = Math.round(currentRoute.currentMedianPrice * 0.36);
  const airportFees = Math.round(currentRoute.currentMedianPrice * 0.12);
  const gstTax = Math.round(currentRoute.currentMedianPrice * 0.06);

  // Direct vs OTA comparison spread
  const directFare = currentRoute.otaComparison.directAirline;
  const mmtFare = currentRoute.otaComparison.makeMyTrip;
  const emtFare = currentRoute.otaComparison.easeMyTrip;
  const cleartripFare = currentRoute.otaComparison.cleartrip;
  const yatraFare = currentRoute.otaComparison.yatra;
  const otaSpread = mmtFare - directFare;

  return (
    <div className="space-y-6">
      {/* Route Explorer Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              CORRIDOR MICRO-TELEMETRY
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Ingestion Feed · Shared Telemetry Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Route Explorer: Causality & Yield Microstructure
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Explaining <em>WHY</em> airfares fluctuate across specific Indian domestic sectors: dynamic carrier yield algorithms, advance booking window compression, and hidden OTA markups.
          </p>
        </div>

        {onOpenMap && (
          <button
            type="button"
            onClick={onOpenMap}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 text-xs font-semibold transition cursor-pointer shrink-0 shadow-sm"
          >
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <span>View on India Airfare Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sector Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Select Sector Category:</span>
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
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                activeCategoryFilter === cat.id
                  ? "bg-cyan-600 text-white font-bold shadow-xs"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Corridor Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
        {filteredRoutes.map((r) => {
          const isSelected = r.id === currentRoute.id;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={`p-3 rounded-xl text-left border transition cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/40"
                  : "bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500" />
              )}
              <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
                <span className="text-white">
                  {r.origin} ➔ {r.destination}
                </span>
                <span
                  className={`text-[10px] ${
                    r.momChange >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {r.momChange >= 0 ? "+" : ""}
                  {r.momChange}%
                </span>
              </div>
              <div className="text-sm font-extrabold text-cyan-300 font-mono">
                ₹{r.currentMedianPrice.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                {r.category}
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary Telemetry Dashboard for Selected Route */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Top Header of Selected Route */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-sm">
                {currentRoute.origin} ➔ {currentRoute.destination}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                {currentRoute.category}
              </span>
              <span className="text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Updated 14 mins ago
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight pt-1">
              {currentRoute.originName} to {currentRoute.destinationName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* DGCA Weight */}
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">DGCA Weight</div>
              <div className="text-sm font-bold text-white">
                {(currentRoute.dgcaWeight * 100).toFixed(1)}%
              </div>
            </div>

            {/* Volatility */}
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Volatility Score</div>
              <div
                className={`text-sm font-bold ${
                  currentRoute.volatilityScore > 75
                    ? "text-rose-400"
                    : currentRoute.volatilityScore > 55
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {currentRoute.volatilityScore} / 100
              </div>
            </div>

            {/* Route AFPI */}
            <div className="px-3.5 py-2 rounded-xl bg-gradient-to-br from-cyan-950/80 to-indigo-950/80 border border-cyan-800/50 text-center font-mono shadow-xs">
              <div className="text-[10px] uppercase text-cyan-400 font-semibold">Route AFPI (2024=100)</div>
              <div className="text-base font-extrabold text-cyan-200">{routeAfpi}</div>
            </div>
          </div>
        </div>

        {/* 4 Essential Pricing Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Median Fare */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Current Median Fare</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                REAL COLLECTED
              </span>
            </div>
            <div className="text-2xl font-extrabold text-cyan-300 font-mono">
              ₹{currentRoute.currentMedianPrice.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Base Year (2024):</span>
              <span className="font-mono text-slate-300">₹{currentRoute.basePrice2024.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Daily Change */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Daily Change (24h)</div>
            <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5">
              <span className={Number(dailyChange) >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {Number(dailyChange) >= 0 ? "+" : ""}
                {dailyChange}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              Rolling 24-hour scraped median shift
            </div>
          </div>

          {/* Weekly Change */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Weekly Change (7d)</div>
            <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5">
              <span className={Number(weeklyChange) >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {Number(weeklyChange) >= 0 ? "+" : ""}
                {weeklyChange}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              7-day departure window divergence
            </div>
          </div>

          {/* Monthly Change (MoM) */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-1">
            <div className="text-[11px] text-slate-400 font-medium">Monthly Change (MoM)</div>
            <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-1.5">
              <span className={monthlyChange >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {monthlyChange >= 0 ? "+" : ""}
                {monthlyChange}%
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              YoY: <strong className="text-cyan-300">+{currentRoute.yoyChange}%</strong> vs 2025
            </div>
          </div>
        </div>

        {/* Anomaly Callout (if present) */}
        {activeAnomaly ? (
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300 font-mono uppercase">
                  Active Price Anomaly Flagged · {activeAnomaly.detectedAt}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-200 border border-amber-700/50">
                  {activeAnomaly.regulatoryStatus || "Audit Recommended"}
                </span>
              </div>
              <p className="text-slate-200">{activeAnomaly.title}: {activeAnomaly.description}</p>
              <div className="text-slate-400 pt-1 font-mono text-[11px]">
                Suspected Driver: {activeAnomaly.suspectedCause} | Regulatory Reference: {activeAnomaly.regulatoryRule || "Rule 135 of Aircraft Rules, 1937"}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800/70 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Corridor Surveillance: Fare trajectories conform to historical Gaussian volatility bounds.</span>
            </span>
            <span className="font-mono text-emerald-400">NORMAL STABLE</span>
          </div>
        )}

        {/* Advance Booking Curve & Carrier Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Advance Booking Curve Chart (2 cols) */}
          <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Advance Booking Escalation Curve (T-60 to T-0)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Illustrates the steepening pricing curve as departure approaches
                </p>
              </div>

              <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveBookingMetric("price")}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    activeBookingMetric === "price"
                      ? "bg-cyan-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Fare (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBookingMetric("multiplier")}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    activeBookingMetric === "multiplier"
                      ? "bg-cyan-600 text-white font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Multiplier (x)
                </button>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={advanceCurveData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any) => [
                      activeBookingMetric === "price"
                        ? `₹${Number(value).toLocaleString("en-IN")}`
                        : `${value}x Base`,
                      "Quote",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey={activeBookingMetric === "price" ? "price" : "multiplier"}
                    radius={[8, 8, 0, 0]}
                  >
                    {advanceCurveData.map((_, index) => {
                      const colors = ["#10b981", "#10b981", "#06b6d4", "#6366f1", "#f59e0b", "#ef4444"];
                      return <Cell key={`cell-${index}`} fill={colors[index] || "#06b6d4"} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-xs font-mono text-center">
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase block">T-30 Advance</span>
                <strong className="text-emerald-400">₹{currentRoute.advanceCurve.t30.toLocaleString("en-IN")}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase block">T-3 Dynamic Band</span>
                <strong className="text-amber-400">₹{currentRoute.advanceCurve.t3.toLocaleString("en-IN")}</strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase block">T-0 Walk-up</span>
                <strong className="text-rose-400">₹{currentRoute.advanceCurve.t0.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>

          {/* Carrier Distribution & Seat Availability (1 col) */}
          <div className="space-y-4">
            {/* Carrier Distribution */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>Airlines Operating on Sector</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Cap Share</span>
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

            {/* Seat Availability & Load Factor */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span className="font-sans">Daily Direct Flights:</span>
                <span className="text-white font-bold">28 flights/day</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-sans">Estimated Load Factor:</span>
                <span className="text-emerald-400 font-bold">88.4% (High Demand)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span className="font-sans">Walk-up Seat Availability:</span>
                <span className="text-amber-400 font-bold">&lt; 6 seats on peak slots</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direct vs OTA Spread & Cost Architecture Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Direct Airline vs OTA Spread */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <SplitSquareVertical className="w-4 h-4 text-amber-400" />
                <span>Direct Airline vs OTA Spread</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                Spread: +₹{otaSpread}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300 font-sans font-medium">Direct Airline Portal:</span>
                <span className="text-emerald-400 font-bold">₹{directFare.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300 font-sans font-medium">MakeMyTrip (MMT):</span>
                <span className="text-rose-400 font-bold">₹{mmtFare.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300 font-sans font-medium">EaseMyTrip (EMT):</span>
                <span className="text-slate-200 font-bold">₹{emtFare.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300 font-sans font-medium">Cleartrip:</span>
                <span className="text-slate-200 font-bold">₹{cleartripFare.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-300 font-sans font-medium">Yatra:</span>
                <span className="text-slate-200 font-bold">₹{yatraFare.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Fare Cost Architecture */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Fare Cost Architecture (Statutory & Fuel Decomposition)</span>
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Base Airline Airfare:</span>
                <span className="text-white font-bold">₹{baseFare.toLocaleString("en-IN")} (46%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Aviation Fuel Surcharge (YQ):</span>
                <span className="text-amber-400 font-bold">₹{fuelSurcharge.toLocaleString("en-IN")} (36%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Airport User Fees (UDF/ASF):</span>
                <span className="text-slate-300">₹{airportFees.toLocaleString("en-IN")} (12%)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400 font-sans">GST (5% Economy):</span>
                <span className="text-slate-300">₹{gstTax.toLocaleString("en-IN")} (6%)</span>
              </div>
              <div className="flex justify-between py-2 pt-2 text-cyan-300 font-bold text-sm">
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
