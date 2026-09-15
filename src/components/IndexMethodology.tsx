import React, { useState } from "react";
import { Scale, BookOpen, CheckCircle, ArrowRight, Layers, FileText, BarChart3 } from "lucide-react";
import { RouteData } from "../types";
import {
  calculateLaspeyres,
  calculatePaasche,
  calculateFisher,
  calculateJevons,
  calculateAugmentedCpiImpact,
} from "../utils/indexEngine";

interface IndexMethodologyProps {
  routes: RouteData[];
}

export const IndexMethodology: React.FC<IndexMethodologyProps> = ({ routes }) => {
  const laspeyresVal = calculateLaspeyres(routes);
  const paascheVal = calculatePaasche(routes);
  const fisherVal = calculateFisher(routes);
  const jevonsVal = calculateJevons(routes);

  const cpiImpact = calculateAugmentedCpiImpact(laspeyresVal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              ECONOMETRIC SPECIFICATION · STATISTICAL FRAMEWORK
            </span>
            <span className="text-xs text-slate-400">NSO / MoSPI CPI Integration Standards</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Index Formulation & CPI Augmentation Methodology
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            AeroNex employs internationally recognized price index formulas (endorsed by the ILO, IMF, and MoSPI) to transform high-frequency scraped airfare records into a robust, substitution-adjusted macro index.
          </p>
        </div>
      </div>

      {/* 4 Index Formulas Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Laspeyres */}
        <div className="bg-slate-900/90 border border-cyan-800/60 rounded-2xl p-5 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase font-mono">
              Laspeyres Index (I_L)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              MoSPI Primary
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-center text-sm text-slate-200">
            I_L = [ ∑(p_t · q_0) / ∑(p_0 · q_0) ] × 100
          </div>

          <div className="text-center font-mono">
            <div className="text-2xl font-extrabold text-white">{laspeyresVal.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-400 font-bold">
              +{(((laspeyresVal - 100) / 100) * 100).toFixed(1)}% vs Base Year (2024)
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-snug">
            Weights routes by base-period DGCA domestic passenger traffic. Standard benchmark used across Indian retail price indices.
          </p>
        </div>

        {/* Fisher Ideal */}
        <div className="bg-slate-900/90 border border-indigo-800/60 rounded-2xl p-5 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase font-mono">
              Fisher Ideal Index (I_F)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
              Superlative
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-center text-sm text-slate-200">
            I_F = √( I_L · I_P )
          </div>

          <div className="text-center font-mono">
            <div className="text-2xl font-extrabold text-white">{fisherVal.toFixed(2)}</div>
            <div className="text-[11px] text-indigo-400 font-bold">
              Substitution-Adjusted
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-snug">
            Geometric mean of Laspeyres and Paasche. Mitigates the upward substitution bias when consumers switch carriers due to surges.
          </p>
        </div>

        {/* Paasche */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase font-mono">
              Paasche Index (I_P)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Current Weight
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-center text-sm text-slate-200">
            I_P = [ ∑(p_t · q_t) / ∑(p_0 · q_t) ] × 100
          </div>

          <div className="text-center font-mono">
            <div className="text-2xl font-extrabold text-white">{paascheVal.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 font-bold">
              Reflects Current Volume
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-snug">
            Current-period weighted index. Accounts for dynamic capacity reallocations across sectors during high-demand festival windows.
          </p>
        </div>

        {/* Jevons */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase font-mono">
              Jevons Geometric (I_J)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Micro Average
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-center text-sm text-slate-200">
            I_J = ∏ (p_it / p_i0)^(1/n) × 100
          </div>

          <div className="text-center font-mono">
            <div className="text-2xl font-extrabold text-white">{jevonsVal.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 font-bold">
              Unweighted Geometric
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-snug">
            Geometric mean of price relatives. Highly resistant to extreme outlier quotes or dynamic price gouging spikes.
          </p>
        </div>
      </div>

      {/* MoSPI CPI Augmentation Transmission Mechanism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              CPI Transport & Communication Augmentation
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              In India&apos;s All-India Consumer Price Index (Base 2012=100 / New Series 2024=100), the <strong className="text-white">Transport and Communication</strong> sub-group commands an 8.59% weighting in the national consumption basket.
            </p>
            <p>
              Passenger Air Travel carries an estimated weight of <strong className="text-cyan-300">0.84% (84 basis points)</strong>. Due to rapid middle-class aviation expansion (over 155 million domestic flyers per year), airfare surges have an outsized impact on urban middle-class perceived inflation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Headline CPI Impulse</div>
              <div className="text-lg font-bold text-cyan-400">+{cpiImpact.headlineImpactBps} bps</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Real-time impulse</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Information Lead</div>
              <div className="text-lg font-bold text-emerald-400">{cpiImpact.officialLagDays} Days</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Ahead of official bulletin</div>
            </div>
          </div>
        </div>

        {/* DGCA Route Traffic Weighting Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                DGCA Passenger Weight Distribution (q_0)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Official Civil Aviation Shares</span>
          </div>

          <div className="overflow-y-auto max-h-60">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-2 font-sans">Corridor</th>
                  <th className="pb-2">Base Fare (p_0)</th>
                  <th className="pb-2">Current (p_t)</th>
                  <th className="pb-2 text-right">DGCA Wt (q_0)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/30">
                    <td className="py-2 text-white font-sans font-medium">
                      {r.origin} ➔ {r.destination}
                    </td>
                    <td className="py-2 text-slate-400">₹{r.basePrice2024.toLocaleString("en-IN")}</td>
                    <td className="py-2 text-cyan-300 font-bold">
                      ₹{r.currentMedianPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2 text-right text-slate-300">
                      {(r.dgcaWeight * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
