import React, { useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Database,
  AlertTriangle,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  PlaneTakeoff,
  Layers,
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
  AreaChart,
  Area,
} from "recharts";
import { RouteData, IndexTimeSeriesPoint, AnomalyAlert } from "../types";
import { AnomalyAlert as AnomalyAlertWidget } from "./AnomalyAlert";

interface OverviewDashboardProps {
  routes: RouteData[];
  timeSeries: IndexTimeSeriesPoint[];
  anomalies: AnomalyAlert[];
  onSelectRoute: (routeId: string) => void;
  onNavigateToTab: (tabId: string) => void;
  onTriggerAiAnalysis?: (prompt: string, analysisType: string, contextData: any) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  routes,
  timeSeries,
  anomalies,
  onSelectRoute,
  onNavigateToTab,
  onTriggerAiAnalysis,
}) => {
  const [indexFormula, setIndexFormula] = useState<"laspeyres" | "fisher">("laspeyres");
  const [chartMetric, setChartMetric] = useState<"index_vs_cpi" | "atf_correlation">("index_vs_cpi");

  const latestPoint = timeSeries[timeSeries.length - 1];
  const previousPoint = timeSeries[timeSeries.length - 2];
  const momGrowth = (
    ((latestPoint.laspeyres - previousPoint.laspeyres) / previousPoint.laspeyres) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* MoSPI NSO Mandate Overview */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-cyan-800/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                MoSPI NSO AUGMENTATION PROTOCOL
              </span>
              <span className="text-xs text-slate-400">High-Frequency Airfare Nowcast Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Real-Time Airfare Price Index for CPI Augmentation
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Replacing lagged manual sample quotes with automated web scraping of 8 major airline and OTA portals.
              Captures dynamic pricing shifts, booking window compression, and festival demand shocks across key Indian corridors.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              id="overview-policy-sim-cta"
              onClick={() => onNavigateToTab("simulator")}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            >
              <span>Run Policy Simulator</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="overview-ai-brief-cta"
              onClick={() => onNavigateToTab("analyst")}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-950/50 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate MoSPI Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AeroNex National Index */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">AeroNex AFPI (Base 2024=100)</span>
            <div className="flex items-center gap-1 bg-slate-800 rounded p-0.5 border border-slate-700 text-[10px]">
              <button
                onClick={() => setIndexFormula("laspeyres")}
                className={`px-1.5 py-0.5 rounded ${indexFormula === "laspeyres" ? "bg-cyan-600 text-white font-bold" : "text-slate-400"}`}
              >
                Laspeyres
              </button>
              <button
                onClick={() => setIndexFormula("fisher")}
                className={`px-1.5 py-0.5 rounded ${indexFormula === "fisher" ? "bg-cyan-600 text-white font-bold" : "text-slate-400"}`}
              >
                Fisher
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-3xl font-extrabold text-white">
              {indexFormula === "laspeyres" ? latestPoint.laspeyres.toFixed(1) : latestPoint.fisher.toFixed(1)}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/40">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +{momGrowth}% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            YoY increase: <strong className="text-slate-200">+12.4%</strong> vs Sep 2025. DGCA seat-weighted across 10 trunk sectors.
          </p>
        </div>

        {/* Card 2: CPI Nowcasting Advantage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Augmented CPI Nowcast</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 font-mono text-[10px] border border-blue-800/40">
              12-Day Lead
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-3xl font-extrabold text-cyan-400">
              {latestPoint.nowcastAugmentedCpi.toFixed(2)}%
            </span>
            <span className="text-xs text-slate-400 font-normal">
              vs <span className="text-slate-300 font-semibold">{latestPoint.cpiTransportOfficial.toFixed(2)}%</span> Official
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Airfare surge introduces <strong className="text-cyan-300">+22 bps</strong> upward bias on headline Transport & Communication basket.
          </p>
        </div>

        {/* Card 3: Scraping Harvest Telemetry */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Daily Scraping Ingestion</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              99.1% Uptime
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-3xl font-extrabold text-white">89,420</span>
            <span className="text-xs text-slate-400">quotes / 24h</span>
          </div>
          <p className="text-[11px] text-slate-400">
            8 concurrent engines (IndiGo, AI, Akasa, SG, MMT, EMT, Cleartrip, Yatra) with dynamic proxy rotation.
          </p>
        </div>

        {/* Card 4: Advance Booking Dynamic Surge */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">T-0 Walk-up Multiplier</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 font-mono text-[10px] border border-amber-800/40">
              Hockey Stick
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2 font-mono">
            <span className="text-3xl font-extrabold text-amber-400">2.35x</span>
            <span className="text-xs text-slate-400">vs T-30 Advance</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Carrier revenue management yields max volatility within 72 hours of departure; avg ₹11,200 walk-up.
          </p>
        </div>
      </div>

      {/* Main Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-Series Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Airfare Price Index (AFPI) vs Official MoSPI CPI Trend</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tracking 12-month historical indices with festive demand surge overlays
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setChartMetric("index_vs_cpi")}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                  chartMetric === "index_vs_cpi" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                AFPI vs Official CPI
              </button>
              <button
                onClick={() => setChartMetric("atf_correlation")}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition ${
                  chartMetric === "atf_correlation" ? "bg-cyan-600 text-white font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                ATF Fuel Correlation
              </button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === "index_vs_cpi" ? (
                <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis domain={["dataMin - 5", "dataMax + 5"]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    name="AeroNex Laspeyres (Real-time)"
                    dataKey="laspeyres"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#06b6d4" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    name="AeroNex Fisher Ideal (Substitution-adjusted)"
                    dataKey="fisher"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "#6366f1" }}
                  />
                  <Line
                    type="monotone"
                    name="Official MoSPI CPI Transport"
                    dataKey="cpiTransportOfficial"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f59e0b" }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
                  <Area
                    type="monotone"
                    name="Aviation Turbine Fuel (₹/kL)"
                    dataKey="atfPricePerKl"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    name="AeroNex AFPI"
                    dataKey="laspeyres"
                    stroke="#06b6d4"
                    strokeWidth={3}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>
                <strong>Key Insight:</strong> AeroNex detected the Nov 2025 Festive Spike 18 days before the MoSPI CPI bulletin.
              </span>
            </div>
            <button
              onClick={() => onNavigateToTab("methodology")}
              className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2"
            >
              Explore Index Formulae ➔
            </button>
          </div>
        </div>

        {/* Regional Basket Decomposition & Anomalies (1 Col) */}
        <div className="space-y-4">
          {/* Regional Weights Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Sector Weighting Breakdown</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400">DGCA Basket</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Metro-Metro Trunk (48% wt)</span>
                  <span className="font-mono text-white font-bold">131.2 (+5.4%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: "48%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Metro-NonMetro (32% wt)</span>
                  <span className="font-mono text-white font-bold">126.8 (+3.1%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "32%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Tourist & Leisure (12% wt)</span>
                  <span className="font-mono text-white font-bold">134.5 (+8.9%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "12%" }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Regional UDAN (8% wt)</span>
                  <span className="font-mono text-white font-bold">114.2 (+0.8%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "8%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Anomalies & Price Gouging Alerts with Drill-Down Detail View */}
          <AnomalyAlertWidget
            anomalies={anomalies}
            onSelectRoute={onSelectRoute}
            onNavigateToTab={onNavigateToTab}
            onTriggerAiAnalysis={onTriggerAiAnalysis}
          />
        </div>
      </div>

      {/* Top Tracked Sector Matrix Quick Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4 text-cyan-400" />
              <span>High-Density Corridors Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live quotes aggregated from airline direct engines and major OTAs
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab("routes")}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Sectors & Decay Curves</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-2.5">Corridor / Sector</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">DGCA Wt</th>
                <th className="pb-2.5">Base (2024)</th>
                <th className="pb-2.5">Current Median</th>
                <th className="pb-2.5">MoM Change</th>
                <th className="pb-2.5">T-3 Dynamic Fare</th>
                <th className="pb-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {routes.slice(0, 6).map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition group">
                  <td className="py-3 font-semibold text-white font-sans flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                      {r.origin}
                    </span>
                    <span>➔</span>
                    <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-indigo-400">
                      {r.destination}
                    </span>
                    <span className="text-slate-300 hidden md:inline font-normal text-xs ml-1">
                      {r.originName.split(" ")[0]} to {r.destinationName.split(" ")[0]}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 font-sans">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{(r.dgcaWeight * 100).toFixed(1)}%</td>
                  <td className="py-3 text-slate-400">₹{r.basePrice2024.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-white font-bold">₹{r.currentMedianPrice.toLocaleString("en-IN")}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        r.momChange >= 0
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                          : "bg-rose-950/80 text-rose-400 border border-rose-800/40"
                      }`}
                    >
                      {r.momChange >= 0 ? "+" : ""}
                      {r.momChange}%
                    </span>
                  </td>
                  <td className="py-3 text-amber-400 font-semibold">
                    ₹{r.advanceCurve.t3.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        onSelectRoute(r.id);
                        onNavigateToTab("routes");
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-700 transition cursor-pointer text-[11px]"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
