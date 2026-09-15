import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Scale,
  Percent,
  Layers,
  Calendar,
  Building2,
  Compass,
  ArrowRight,
  Info,
  CheckCircle2,
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
import { RouteData, IndexTimeSeriesPoint } from "../../types";
import { AirfareIndexSubsection } from "../../types/navigation";

interface AirfareIndexViewProps {
  routes: RouteData[];
  timeSeries: IndexTimeSeriesPoint[];
  currentSubsection: AirfareIndexSubsection;
  onSelectSubsection: (sub: AirfareIndexSubsection) => void;
  onSelectRouteForExplorer: (routeId: string) => void;
}

export const AirfareIndexView: React.FC<AirfareIndexViewProps> = ({
  routes,
  timeSeries,
  currentSubsection,
  onSelectSubsection,
  onSelectRouteForExplorer,
}) => {
  // National AFPI metrics
  const latestPoint = timeSeries[timeSeries.length - 1] || {
    laspeyres: 128.4,
    fisher: 127.2,
    paasche: 126.0,
    jevons: 125.8,
  };

  // Carrier indices
  const carrierIndices = [
    { carrier: "IndiGo (6E)", code: "6E", index: 129.1, mom: +4.4, share: 58.2, avgFare: 5740, color: "#06b6d4" },
    { carrier: "Air India (AI)", code: "AI", index: 131.4, mom: +5.1, share: 26.8, avgFare: 6380, color: "#ef4444" },
    { carrier: "Akasa Air (QP)", code: "QP", index: 122.8, mom: +2.8, share: 9.6, avgFare: 4980, color: "#f97316" },
    { carrier: "SpiceJet (SG)", code: "SG", index: 126.5, mom: +3.6, share: 5.4, avgFare: 5410, color: "#eab308" },
  ];

  // Route contribution to +4.2% MoM
  const routeContributions = routes.map((r) => {
    // Contribution = dgcaWeight * momChange
    const rawContrib = r.dgcaWeight * r.momChange;
    return {
      id: r.id,
      name: `${r.origin} ➔ ${r.destination}`,
      category: r.category,
      weight: (r.dgcaWeight * 100).toFixed(1),
      mom: r.momChange,
      contributionPp: Number(rawContrib.toFixed(2)),
    };
  }).sort((a, b) => b.contributionPp - a.contributionPp);

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Airfare Price Index (AFPI) Sub-System
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {[
            { id: "national-afpi" as const, label: "National AFPI (128.4)" },
            { id: "route-index" as const, label: "Route Sub-Indices" },
            { id: "airline-index" as const, label: "Airline Yield Indices" },
            { id: "contributions" as const, label: "Contribution Decomposition" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectSubsection(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentSubsection === tab.id
                  ? "bg-cyan-600 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: National AFPI */}
      {currentSubsection === "national-afpi" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  NATIONAL HEADLINE BENCHMARK · BASE 2024 = 100
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  [DERIVED AERONEX ESTIMATE · MoSPI COMPLIANT]
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                All-India National Airfare Price Index (AFPI)
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Aggregating 142,000+ daily scraped airfares across all 15 top DGCA domestic trunk & regional routes using Laspeyres and Fisher-Ideal index methodologies.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono shrink-0">
              <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-cyan-800/60 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-sans">Current AFPI</div>
                <div className="text-2xl font-black text-cyan-300">128.4</div>
                <div className="text-[10px] text-emerald-400 font-bold">+4.2% MoM</div>
              </div>
            </div>
          </div>

          {/* 4 Formula Headline Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-cyan-800/60 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-400 font-mono">Laspeyres (I_L)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300">MoSPI Standard</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{latestPoint.laspeyres}</div>
              <div className="text-[11px] text-slate-400">Fixed base weights (DGCA 2024 PAX)</div>
            </div>

            <div className="bg-slate-900/90 border border-purple-800/60 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-400 font-mono">Fisher Ideal (I_F)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300">Superlative</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{latestPoint.fisher}</div>
              <div className="text-[11px] text-slate-400">Geometric mean √(I_L × I_P)</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 font-mono">Paasche (I_P)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Current Q</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{latestPoint.paasche}</div>
              <div className="text-[11px] text-slate-400">Current-period seat capacity weights</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 font-mono">Jevons (I_J)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">Unweighted</span>
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">{latestPoint.jevons}</div>
              <div className="text-[11px] text-slate-400">Elementary geometric mean ratio</div>
            </div>
          </div>

          {/* Historical Timeseries Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>National AFPI Evolution (Oct 2025 – Sep 2026)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Tracking seasonality: Diwali peak (Nov), Summer holiday surge (May), and Monsoon dip (Jul)
                </p>
              </div>
              <div className="text-xs font-mono text-slate-400">
                12-Month Base Period
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis domain={[100, 135]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Laspeyres (MoSPI)"
                    dataKey="laspeyres"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    name="Fisher Ideal"
                    dataKey="fisher"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    name="Official Transport CPI"
                    dataKey="cpiTransportOfficial"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Route Sub-Indices */}
      {currentSubsection === "route-index" && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Route-Level Price Indices</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every domestic sector carries a distinct price index relative to its 2024 baseline. Metro-Metro trunk routes exhibit stable inflation, while festive and tourist corridors experience extreme localized volatility.
            </p>
          </div>

          <div className="overflow-x-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Corridor</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Route AFPI</th>
                  <th className="py-2.5 px-3 text-right">Current Fare</th>
                  <th className="py-2.5 px-3 text-right">Base (2024)</th>
                  <th className="py-2.5 px-3 text-right">MoM %</th>
                  <th className="py-2.5 px-3 text-right">YoY %</th>
                  <th className="py-2.5 px-3 text-right">Volatility</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {routes.map((r) => {
                  const afpi = ((r.currentMedianPrice / r.basePrice2024) * 100).toFixed(1);
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-bold text-white">
                        {r.origin} ➔ {r.destination}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">{r.category}</td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-cyan-300">
                        {afpi}
                      </td>
                      <td className="py-2.5 px-3 text-right text-white">
                        ₹{r.currentMedianPrice.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        ₹{r.basePrice2024.toLocaleString("en-IN")}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          r.momChange >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {r.momChange >= 0 ? "+" : ""}
                        {r.momChange}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">
                        +{r.yoyChange}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-400">
                        {r.volatilityScore}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onSelectRouteForExplorer(r.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 text-[10px] font-sans transition cursor-pointer"
                        >
                          Deep Dive
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Airline Index */}
      {currentSubsection === "airline-index" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Carrier-Specific Price & Yield Indices</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Tracking airline pricing strategies independently. Air India and IndiGo lead domestic price setting power with a combined 85% domestic market share.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {carrierIndices.map((c) => (
              <div key={c.carrier} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{c.carrier}</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {c.share}% PAX
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-white font-mono">{c.index}</div>
                  <div className="text-xs text-emerald-400 font-mono font-semibold">+{c.mom}% MoM Growth</div>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs font-mono text-slate-400 flex justify-between">
                  <span>Network Avg Fare:</span>
                  <strong className="text-slate-200">₹{c.avgFare.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Contributions */}
      {currentSubsection === "contributions" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Weighted Contribution to National AFPI (+4.2% MoM)</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Econometric decomposition of the +4.2 percentage point month-on-month rise in the National AFPI. Trunk sectors contribute high weight, while festive anomalies contribute high volatility impulses.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase">Top Route Contributors (pp Contribution)</h4>

            <div className="space-y-3">
              {routeContributions.slice(0, 6).map((c) => (
                <div key={c.id} className="text-xs space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-white font-bold">{c.name} ({c.category})</span>
                    <span className="text-cyan-300 font-bold">
                      +{c.contributionPp} pp <span className="text-slate-500 font-normal">({c.weight}% weight × {c.mom}% MoM)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, c.contributionPp * 50))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
