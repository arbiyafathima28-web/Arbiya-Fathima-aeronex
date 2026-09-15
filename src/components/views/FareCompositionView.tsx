import React, { useState } from "react";
import {
  DollarSign,
  Fuel,
  Building2,
  Receipt,
  PieChart as PieChartIcon,
  Percent,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { RouteData } from "../../types";

interface FareCompositionViewProps {
  routes: RouteData[];
  onSelectRouteForExplorer: (routeId: string) => void;
  onNavigateToOtaComparison: () => void;
}

export const FareCompositionView: React.FC<FareCompositionViewProps> = ({
  routes,
  onSelectRouteForExplorer,
  onNavigateToOtaComparison,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("del-bom");
  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const baseFare = Math.round(currentRoute.currentMedianPrice * 0.46);
  const fuelSurcharge = Math.round(currentRoute.currentMedianPrice * 0.36);
  const airportFees = Math.round(currentRoute.currentMedianPrice * 0.12);
  const gstTax = Math.round(currentRoute.currentMedianPrice * 0.06);

  const pieData = [
    { name: "Base Airfare", value: baseFare, percent: 46, color: "#06b6d4" },
    { name: "Aviation Fuel Surcharge (YQ)", value: fuelSurcharge, percent: 36, color: "#f59e0b" },
    { name: "Airport Fees (UDF/ASF)", value: airportFees, percent: 12, color: "#6366f1" },
    { name: "GST (5% Economy)", value: gstTax, percent: 6, color: "#10b981" },
  ];

  // Carrier fare comparison on this route
  const carrierData = currentRoute.carrierShare.map((c) => ({
    carrier: `${c.airline} (${c.code})`,
    fare: c.avgPrice,
    share: c.sharePercent,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              FARE ANATOMY · STATUTORY & OPERATING COST ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400 font-mono">DGCA & Ministry of Civil Aviation Framework</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Indian Domestic Airfare Composition & Price Architecture
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Deconstructing passenger ticket bills into base airfare, pass-through fuel surcharges (YQ), airport infrastructure fees (UDF/ASF/PSF), and statutory taxation. Understanding why base fares fluctuate while taxes remain static.
          </p>
        </div>
      </div>

      {/* Sector Selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span>Select Corridor to Analyze:</span>
        </div>
        <select
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-hidden"
        >
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.origin} ➔ {r.destination} ({r.originName} to {r.destinationName}) · ₹{r.currentMedianPrice.toLocaleString("en-IN")}
            </option>
          ))}
        </select>
      </div>

      {/* 4 Cards Decomposing the Fare */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Base Fare */}
        <div className="bg-slate-900/90 border border-cyan-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-cyan-400">Base Airfare</span>
            <span className="font-mono text-cyan-300 font-bold">46.0%</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{baseFare.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Airline revenue portion subject to dynamic algorithm adjustments and seat bucket inventory.
          </p>
        </div>

        {/* Fuel Surcharge (YQ) */}
        <div className="bg-slate-900/90 border border-amber-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-amber-400">Fuel Surcharge (YQ)</span>
            <span className="font-mono text-amber-300 font-bold">36.0%</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            ₹{fuelSurcharge.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Covers Jet Fuel (ATF) crude volatility; historically adjusted when international crude shifts.
          </p>
        </div>

        {/* Airport User Fees */}
        <div className="bg-slate-900/90 border border-indigo-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-indigo-400">Airport Fees (UDF/ASF)</span>
            <span className="font-mono text-indigo-300 font-bold">12.0%</span>
          </div>
          <div className="text-2xl font-extrabold text-indigo-300 font-mono">
            ₹{airportFees.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            User Development Fee (UDF), Aviation Security Fee (ASF), and terminal passenger charges.
          </p>
        </div>

        {/* GST */}
        <div className="bg-slate-900/90 border border-emerald-800/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-emerald-400">GST (Goods & Services Tax)</span>
            <span className="font-mono text-emerald-300 font-bold">6.0%</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">
            ₹{gstTax.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            5% for Economy class tickets, 12% for Business class travel under Indian GST rules.
          </p>
        </div>
      </div>

      {/* Visual Pie & Carrier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-cyan-400" />
            <span>Cost Decomposition ({currentRoute.origin} ➔ {currentRoute.destination})</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `₹${Number(value).toLocaleString("en-IN")} (${pieData.find((p) => p.name === name)?.percent}%)`,
                    name,
                  ]}
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

        {/* Carrier Price Comparison on Corridor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>Carrier Average Fares on Selected Corridor</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: ₹{currentRoute.currentMedianPrice.toLocaleString("en-IN")}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="carrier" stroke="#64748b" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Avg Fare"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="fare" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* OTA Spread Quick Link Callout */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-800/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
              HIDDEN SPREAD AUDIT
            </span>
            <span className="text-xs text-slate-400">Direct Airline vs Online Travel Aggregators (OTAs)</span>
          </div>
          <h4 className="text-base font-bold text-white">
            Looking for convenience fee markups across MakeMyTrip, EaseMyTrip & Cleartrip?
          </h4>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            OTAs add convenience fees ranging from ₹0 (EaseMyTrip) up to ₹399/ticket (MakeMyTrip). AeroNex provides a comprehensive audit of non-refundable booking platform charges.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToOtaComparison}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0 shadow-md"
        >
          <span>Open Airline / OTA Comparison</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
