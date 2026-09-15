import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  Layers,
  Scale,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
  CheckCircle2,
  Zap,
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
  PieChart,
  Pie,
} from "recharts";
import { RouteData, IndexTimeSeriesPoint } from "../../types";
import { CpiAugmentationSubsection } from "../../types/navigation";

interface CpiAugmentationViewProps {
  routes: RouteData[];
  timeSeries: IndexTimeSeriesPoint[];
  currentSubsection: CpiAugmentationSubsection;
  onSelectSubsection: (sub: CpiAugmentationSubsection) => void;
}

export const CpiAugmentationView: React.FC<CpiAugmentationViewProps> = ({
  routes,
  timeSeries,
  currentSubsection,
  onSelectSubsection,
}) => {
  const [interactiveAfpiShift, setInteractiveAfpiShift] = useState<number>(4.2);

  // MoSPI NSO parameters
  const transportWeightInCpi = 2.42; // 2.42% weight of air transport in Transport & Communication sub-group
  const computedBpsImpulse = Math.round((interactiveAfpiShift * (transportWeightInCpi / 100)) * 100);

  // Inflation decomposition breakdown
  const decompositionData = [
    { name: "ATF Jet Fuel Pass-Through", value: 52, color: "#f59e0b", description: "Crude oil & refinery crack spreads pass-through to fuel surcharges" },
    { name: "Festive & Holiday Demand Surge", value: 28, color: "#06b6d4", description: "Algorithmic revenue surge pricing on high-load festive travel dates" },
    { name: "Capacity Grounding & Engine Supply", value: 14, color: "#ef4444", description: "Pratt & Whitney GTF engine groundings constraining seat supply" },
    { name: "Underlying Base Tariff Inflation", value: 6, color: "#10b981", description: "Secular wage, maintenance, and airport lease cost inflation" },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            CPI Augmentation & Macro Transmission
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {[
            { id: "cpi-impact" as const, label: "CPI Impact (+22 bps)" },
            { id: "nowcast" as const, label: "High-Frequency Nowcast" },
            { id: "inflation-decomposition" as const, label: "Inflation Decomposition" },
            { id: "official-vs-aeronex" as const, label: "Official vs AeroNex" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectSubsection(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentSubsection === tab.id
                  ? "bg-amber-600 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: CPI Impact */}
      {currentSubsection === "cpi-impact" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                  MACRO TRANSMISSION · RESERVE BANK OF INDIA (RBI) MPC METRICS
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  [DERIVED AERONEX ESTIMATE · NSO WEIGHTS]
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Airfare Volatility Transmission to Headline CPI
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Measuring the direct impulse that high-frequency airfare surge shocks transmit into the Transport & Communication sub-index of the All-India Consumer Price Index (CPI-Combined).
              </p>
            </div>

            <div className="px-5 py-3 rounded-xl bg-slate-950 border border-amber-800/60 text-center font-mono shrink-0">
              <div className="text-[10px] uppercase text-slate-400 font-sans">Current Inflation Impulse</div>
              <div className="text-3xl font-black text-amber-300">+{computedBpsImpulse} bps</div>
              <div className="text-[11px] text-emerald-400 font-bold">+0.22% on Core Transport CPI</div>
            </div>
          </div>

          {/* Elasticity Interactive Simulator */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Interactive AFPI Sensitivity Slider (Test Macro Impact)</span>
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Hypothetical AFPI Monthly Growth (%):</span>
                <span className="text-amber-300 font-bold text-sm">{interactiveAfpiShift > 0 ? `+${interactiveAfpiShift}%` : `${interactiveAfpiShift}%`}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="25"
                step="0.5"
                value={interactiveAfpiShift}
                onChange={(e) => setInteractiveAfpiShift(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-10% (Severe slump)</span>
                <span>0% (Neutral)</span>
                <span>+4.2% (Current)</span>
                <span>+15% (Festive Shock)</span>
                <span>+25% (Crisis)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Air Transport Weight (NSO CPI)</span>
                <strong className="text-white text-sm">{transportWeightInCpi}% of Transport Subgroup</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Direct CPI Impulse</span>
                <strong className="text-amber-300 text-sm">+{computedBpsImpulse} basis points</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Policy Recommendation</span>
                <strong className={computedBpsImpulse > 30 ? "text-rose-400" : "text-emerald-400"}>
                  {computedBpsImpulse > 30 ? "Trigger Rule 135 Regulatory Audit" : "Within Monitored Reserve Band"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: High-Frequency Nowcast */}
      {currentSubsection === "nowcast" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Continuous Real-Time CPI Nowcast Engine</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Official MoSPI CPI figures are published on the 12th of every month with a 30 to 45 day latency. AeroNex ingests 142,000+ daily airfares to provide a continuous real-time nowcast, identifying turning points well ahead of official releases.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white font-mono uppercase">Official Release vs AeroNex Nowcast Trajectory</h4>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
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
                  <Legend />
                  <Line
                    type="monotone"
                    name="AeroNex Continuous Nowcast"
                    dataKey="nowcastAugmentedCpi"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    name="Official MoSPI Published CPI"
                    dataKey="cpiTransportOfficial"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Inflation Decomposition */}
      {currentSubsection === "inflation-decomposition" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Airfare Inflation Component Decomposition</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Decomposing current domestic airfare growth into 4 primary drivers: Jet Fuel (ATF) pass-through, Seasonal & Festive demand surges, Grounded aircraft capacity constraints, and Core tariff inflation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Visualization */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white font-mono uppercase">Driver Share of Total Price Surge</h4>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={decompositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {decompositionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: string) => [`${val}% of Total Inflation`, name]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#f8fafc",
                        fontSize: "12px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List breakdown */}
            <div className="space-y-3">
              {decompositionData.map((d) => (
                <div key={d.name} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="text-sm font-extrabold font-mono" style={{ color: d.color }}>
                      {d.value}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-4">{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Official vs AeroNex */}
      {currentSubsection === "official-vs-aeronex" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Official MoSPI Survey vs AeroNex Continuous Index</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Why the traditional manual survey methodology falls short in digital aviation markets, and how continuous automated collection corrects for sampling bias.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Traditional MoSPI */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-300">Official MoSPI CPI Methodology</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  OFFICIAL / REFERENCE
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed list-disc pl-4">
                <li>Single quote collected manually on a fixed day (e.g. 10th of every month).</li>
                <li>Typically records only T-30 advance purchase price for non-holiday flights.</li>
                <li>Completely misses walk-up surge pricing, festival rationing, and dynamic bands.</li>
                <li>30-45 day publication latency inhibits timely monetary policy intervention.</li>
              </ul>
            </div>

            {/* AeroNex Solution */}
            <div className="bg-slate-900/90 border border-cyan-800/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-cyan-300">AeroNex Continuous Architecture</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  DERIVED AERONEX ESTIMATE
                </span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc pl-4">
                <li>Continuous 24/7 scraping across 8 primary airline and OTA portals.</li>
                <li>Collects the full advance booking spectrum from T-60 to T-0 walk-up.</li>
                <li>Corrects for substitution bias via Fisher Ideal geometric index.</li>
                <li>Real-time zero-lag data delivery empowers high-frequency MPC nowcasting.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
