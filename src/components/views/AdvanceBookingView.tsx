import React, { useState } from "react";
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Layers,
  BarChart3,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { RouteData } from "../../types";

interface AdvanceBookingViewProps {
  routes: RouteData[];
  onSelectRouteForExplorer: (routeId: string) => void;
}

export const AdvanceBookingView: React.FC<AdvanceBookingViewProps> = ({
  routes,
  onSelectRouteForExplorer,
}) => {
  const [selectedRouteAId, setSelectedRouteAId] = useState<string>("del-bom");
  const [selectedRouteBId, setSelectedRouteBId] = useState<string>("del-pat");

  const routeA = routes.find((r) => r.id === selectedRouteAId) || routes[0];
  const routeB = routes.find((r) => r.id === selectedRouteBId) || routes[1];

  // Comparison curve across standard windows
  const curvePoints = [
    { window: "T-60 (2 Months)", days: 60, routeA: routeA.advanceCurve.t60, routeB: routeB.advanceCurve.t60 },
    { window: "T-30 (1 Month)", days: 30, routeA: routeA.advanceCurve.t30, routeB: routeB.advanceCurve.t30 },
    { window: "T-14 (2 Weeks)", days: 14, routeA: routeA.advanceCurve.t14, routeB: routeB.advanceCurve.t14 },
    { window: "T-7 (1 Week)", days: 7, routeA: routeA.advanceCurve.t7, routeB: routeB.advanceCurve.t7 },
    { window: "T-3 (72 Hours)", days: 3, routeA: routeA.advanceCurve.t3, routeB: routeB.advanceCurve.t3 },
    { window: "T-0 (Walk-up)", days: 0, routeA: routeA.advanceCurve.t0, routeB: routeB.advanceCurve.t0 },
  ];

  // Calculation of steepness / surge multiple
  const routeASurgeRatio = (routeA.advanceCurve.t0 / routeA.advanceCurve.t60).toFixed(2);
  const routeBSurgeRatio = (routeB.advanceCurve.t0 / routeB.advanceCurve.t60).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              YIELD CURVE DYNAMICS · TIME-TO-DEPARTURE
            </span>
            <span className="text-xs text-slate-400 font-mono">Dynamic Revenue Management Surveillance</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Advance Booking Surge Curves (T-60 to T-0)
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Airlines employ algorithmic dynamic yield curve compression as flight departure dates approach. Official MoSPI CPI surveys measure fares at single monthly intervals (typically T-30), which systematically underestimates consumer inflation during emergency and last-minute travel by up to 180%.
          </p>
        </div>
      </div>

      {/* Sector Comparison Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sector A */}
        <div className="bg-slate-900/80 border border-cyan-800/60 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase font-mono">Sector Benchmark A</span>
            <span className="text-[10px] font-mono text-slate-400">{routeA.category}</span>
          </div>
          <select
            value={selectedRouteAId}
            onChange={(e) => setSelectedRouteAId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-hidden focus:border-cyan-500"
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.origin} ➔ {r.destination} ({r.originName} to {r.destinationName})
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-300">
            <span>T-0 / T-60 Escalation:</span>
            <span className="text-cyan-300 font-bold">{routeASurgeRatio}x surge multiple</span>
          </div>
        </div>

        {/* Sector B */}
        <div className="bg-slate-900/80 border border-purple-800/60 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase font-mono">Sector Benchmark B</span>
            <span className="text-[10px] font-mono text-slate-400">{routeB.category}</span>
          </div>
          <select
            value={selectedRouteBId}
            onChange={(e) => setSelectedRouteBId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-hidden focus:border-purple-500"
          >
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.origin} ➔ {r.destination} ({r.originName} to {r.destinationName})
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-300">
            <span>T-0 / T-60 Escalation:</span>
            <span className="text-purple-300 font-bold">{routeBSurgeRatio}x surge multiple</span>
          </div>
        </div>
      </div>

      {/* Comparative Advance Curve Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Comparative Yield Escalation (₹ Price by Days Before Flight)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparing advance purchase trajectory between {routeA.origin}➔{routeA.destination} and {routeB.origin}➔{routeB.destination}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              {routeA.origin}-{routeA.destination}
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-3 h-0.5 bg-purple-400 inline-block" />
              {routeB.origin}-{routeB.destination}
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={curvePoints} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="window" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(val: any, name: string) => [
                  `₹${Number(val).toLocaleString("en-IN")}`,
                  name === "routeA" ? `${routeA.origin}➔${routeA.destination}` : `${routeB.origin}➔${routeB.destination}`,
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "routeA" ? `${routeA.origin} ➔ ${routeA.destination}` : `${routeB.origin} ➔ ${routeB.destination}`
                }
              />
              <Line
                type="monotone"
                dataKey="routeA"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ r: 5, fill: "#06b6d4" }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="routeB"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ r: 5, fill: "#a855f7" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Advance Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>All-Sector Advance Purchase Matrix (Quotes Across Windows)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">DGCA Domestic Representative Sample</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">T-60 (60d)</th>
                <th className="py-2.5 px-3 text-right">T-30 (30d)</th>
                <th className="py-2.5 px-3 text-right">T-14 (14d)</th>
                <th className="py-2.5 px-3 text-right">T-7 (7d)</th>
                <th className="py-2.5 px-3 text-right">T-3 (72h)</th>
                <th className="py-2.5 px-3 text-right text-rose-400">T-0 (Walk-up)</th>
                <th className="py-2.5 px-3 text-right">Surge x</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {routes.map((r) => {
                const ratio = (r.advanceCurve.t0 / r.advanceCurve.t60).toFixed(2);
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {r.origin} ➔ {r.destination}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{r.category}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">
                      ₹{r.advanceCurve.t60.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-300">
                      ₹{r.advanceCurve.t30.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-300">
                      ₹{r.advanceCurve.t14.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-300">
                      ₹{r.advanceCurve.t7.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400">
                      ₹{r.advanceCurve.t3.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                      ₹{r.advanceCurve.t0.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                      {ratio}x
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onSelectRouteForExplorer(r.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 text-[10px] font-sans transition cursor-pointer"
                      >
                        Explore
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
