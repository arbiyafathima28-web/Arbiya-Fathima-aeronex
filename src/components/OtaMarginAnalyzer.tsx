import React from "react";
import {
  SplitSquareVertical,
  DollarSign,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Info,
} from "lucide-react";
import { RouteData } from "../types";

interface OtaMarginAnalyzerProps {
  routes: RouteData[];
}

export const OtaMarginAnalyzer: React.FC<OtaMarginAnalyzerProps> = ({ routes }) => {
  // Compute average convenience fee & markup across all routes
  let totalDirect = 0;
  let totalMmt = 0;
  let totalEmt = 0;
  let totalClear = 0;
  let totalYatra = 0;

  routes.forEach((r) => {
    totalDirect += r.otaComparison.directAirline;
    totalMmt += r.otaComparison.makeMyTrip;
    totalEmt += r.otaComparison.easeMyTrip;
    totalClear += r.otaComparison.cleartrip;
    totalYatra += r.otaComparison.yatra;
  });

  const count = routes.length;
  const avgDirect = Math.round(totalDirect / count);
  const avgMmt = Math.round(totalMmt / count);
  const avgEmt = Math.round(totalEmt / count);
  const avgClear = Math.round(totalClear / count);
  const avgYatra = Math.round(totalYatra / count);

  const avgMmtPremium = avgMmt - avgDirect;
  const annualPaxInCrores = 15.5; // DGCA domestic passengers ~155 million
  const estimatedAnnualOtaMarkupCrores = Math.round((annualPaxInCrores * 10000000 * 280) / 10000000);

  return (
    <div className="space-y-6">
      {/* Header & Macro Impact Callout */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                CONSUMER PROTECTION & FEE AUDIT
              </span>
              <span className="text-xs text-slate-400">Price Transparency & Market Surveillance</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Direct Airline vs Online Travel Aggregator (OTA) Fee Decomposer
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Automated scraping captures the hidden spread between direct carrier booking portals and online travel aggregators.
              Monitors convenience charges, unbundled add-ons, and dynamic algorithmic markups.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-right shrink-0">
            <div className="text-[10px] uppercase text-slate-500">Macro Consumer Burden</div>
            <div className="text-xl font-extrabold text-amber-400">
              ₹{estimatedAnnualOtaMarkupCrores.toLocaleString("en-IN")} Cr / yr
            </div>
            <div className="text-[10px] text-slate-400">in OTA convenience fees across 15.5 Cr flyers</div>
          </div>
        </div>
      </div>

      {/* OTA Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Direct Airline */}
        <div className="bg-slate-900/90 border border-cyan-800/50 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-[10px] uppercase font-mono text-cyan-400 font-bold mb-1">
            Direct Carrier Portals
          </div>
          <div className="text-sm font-bold text-white">IndiGo / AI / Akasa / SG</div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono my-2">
            ₹{avgDirect.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            Zero Convenience Fee
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Official benchmark reference for MoSPI airfare basket pricing.
          </div>
        </div>

        {/* MakeMyTrip */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">
            MakeMyTrip (MMT)
          </div>
          <div className="text-sm font-bold text-white">Aggregator Benchmark</div>
          <div className="text-2xl font-extrabold text-white font-mono my-2">
            ₹{avgMmt.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-semibold text-amber-400 font-mono">
            +₹{avgMmt - avgDirect} avg markup (+{(((avgMmt - avgDirect) / avgDirect) * 100).toFixed(1)}%)
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Convenience fee: ₹349-₹399 per PNR charged at checkout.
          </div>
        </div>

        {/* EaseMyTrip */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">
            EaseMyTrip (EMT)
          </div>
          <div className="text-sm font-bold text-white">Discount Aggregator</div>
          <div className="text-2xl font-extrabold text-white font-mono my-2">
            ₹{avgEmt.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-semibold text-emerald-400 font-mono">
            +₹{avgEmt - avgDirect} avg markup (+{(((avgEmt - avgDirect) / avgDirect) * 100).toFixed(1)}%)
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Marketed as &apos;Zero Convenience Fee&apos; with small base fare delta.
          </div>
        </div>

        {/* Cleartrip */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">
            Cleartrip (Flipkart)
          </div>
          <div className="text-sm font-bold text-white">E-Commerce Aggregator</div>
          <div className="text-2xl font-extrabold text-white font-mono my-2">
            ₹{avgClear.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-semibold text-amber-400 font-mono">
            +₹{avgClear - avgDirect} avg markup (+{(((avgClear - avgDirect) / avgDirect) * 100).toFixed(1)}%)
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Dynamic checkout fees bundled with cancellation insurance.
          </div>
        </div>

        {/* Yatra */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold mb-1">
            Yatra OTA
          </div>
          <div className="text-sm font-bold text-white">Corporate Aggregator</div>
          <div className="text-2xl font-extrabold text-white font-mono my-2">
            ₹{avgYatra.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-semibold text-amber-400 font-mono">
            +₹{avgYatra - avgDirect} avg markup (+{(((avgYatra - avgDirect) / avgDirect) * 100).toFixed(1)}%)
          </div>
          <div className="text-[10px] text-slate-400 mt-2">
            Standard corporate convenience surcharge ₹299 per sector.
          </div>
        </div>
      </div>

      {/* Sector-by-Sector Spread Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SplitSquareVertical className="w-4 h-4 text-cyan-400" />
              <span>Cross-Portal Sector Price Matrix (Real-Time Scrape Comparison)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Auditing whether consumers pay higher effective inflation depending on booking channel
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 font-sans">Corridor Sector</th>
                <th className="pb-3 text-cyan-400 font-bold">Direct Carrier</th>
                <th className="pb-3">MakeMyTrip</th>
                <th className="pb-3">EaseMyTrip</th>
                <th className="pb-3">Cleartrip</th>
                <th className="pb-3">Yatra</th>
                <th className="pb-3 text-amber-400">Max Spread</th>
                <th className="pb-3 text-right font-sans">CPI Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {routes.map((r) => {
                const spread = Math.max(
                  r.otaComparison.makeMyTrip,
                  r.otaComparison.yatra,
                  r.otaComparison.cleartrip
                ) - r.otaComparison.directAirline;

                return (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 font-sans font-semibold text-white">
                      <span className="text-cyan-400">{r.origin}</span> ➔ <span className="text-indigo-400">{r.destination}</span>
                      <span className="text-slate-400 text-[11px] block font-mono font-normal">
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3 text-cyan-300 font-bold text-sm">
                      ₹{r.otaComparison.directAirline.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-slate-300">
                      ₹{r.otaComparison.makeMyTrip.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-slate-300">
                      ₹{r.otaComparison.easeMyTrip.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-slate-300">
                      ₹{r.otaComparison.cleartrip.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-slate-300">
                      ₹{r.otaComparison.yatra.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-amber-400 font-bold">
                      +₹{spread.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-right font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        +{(spread * 0.0012).toFixed(2)} bps
                      </span>
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
