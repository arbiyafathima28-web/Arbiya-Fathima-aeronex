import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  X,
  Plane,
  Clock,
  Activity,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCode,
  Info,
  Scale,
} from "lucide-react";
import { AnomalyAlert as AnomalyAlertType } from "../types";

interface AnomalyAlertProps {
  anomalies: AnomalyAlertType[];
  onSelectRoute?: (routeId: string) => void;
  onNavigateToTab?: (tabId: string) => void;
  onTriggerAiAnalysis?: (prompt: string, analysisType: string, contextData: any) => void;
  className?: string;
  maxInitialDisplay?: number;
}

export const AnomalyAlert: React.FC<AnomalyAlertProps> = ({
  anomalies,
  onSelectRoute,
  onNavigateToTab,
  onTriggerAiAnalysis,
  className = "",
  maxInitialDisplay = 4,
}) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyAlertType | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<"all" | "high" | "medium" | "info">("all");
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "carriers" | "diagnostics" | "regulatory">("overview");
  const [copiedTelemetry, setCopiedTelemetry] = useState(false);

  // Close modal on Escape key, allow arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedAnomaly) return;
      if (e.key === "Escape") {
        setSelectedAnomaly(null);
      } else if (e.key === "ArrowLeft") {
        handlePrevAnomaly();
      } else if (e.key === "ArrowRight") {
        handleNextAnomaly();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAnomaly, anomalies]);

  const filteredAnomalies = anomalies.filter((a) => {
    if (filterSeverity === "all") return true;
    return a.severity === filterSeverity;
  });

  const handleOpenDetail = (anomaly: AnomalyAlertType) => {
    setSelectedAnomaly(anomaly);
    setActiveDetailTab("overview");
    setCopiedTelemetry(false);
  };

  const handleNextAnomaly = () => {
    if (!selectedAnomaly) return;
    const currentIndex = anomalies.findIndex((a) => a.id === selectedAnomaly.id);
    const nextIndex = (currentIndex + 1) % anomalies.length;
    setSelectedAnomaly(anomalies[nextIndex]);
  };

  const handlePrevAnomaly = () => {
    if (!selectedAnomaly) return;
    const currentIndex = anomalies.findIndex((a) => a.id === selectedAnomaly.id);
    const prevIndex = (currentIndex - 1 + anomalies.length) % anomalies.length;
    setSelectedAnomaly(anomalies[prevIndex]);
  };

  const handleCopyTelemetry = (anomaly: AnomalyAlertType) => {
    const jsonStr = JSON.stringify(anomaly, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedTelemetry(true);
    setTimeout(() => setCopiedTelemetry(false), 2000);
  };

  const handleInvestigateWithAI = (anomaly: AnomalyAlertType) => {
    if (onTriggerAiAnalysis) {
      const prompt = `Perform forensic root-cause analysis on the detected pricing anomaly on route ${anomaly.route} (${anomaly.title}). The outlier registered an observed fare of ₹${anomaly.observedFare || 6250} against baseline ₹${anomaly.baselineFare || 2550} (${anomaly.surgeMultiplier}x surge, Z-Score: +${anomaly.zScore || 3.8}σ, Outlier Confidence: ${((anomaly.confidenceScore || 0.95) * 100).toFixed(1)}%). Investigate whether algorithmic capacity rationing violates DGCA Tariff Rule 135 and recommend regulatory interventions.`;
      onTriggerAiAnalysis(prompt, "mospi_brief", anomaly);
    } else if (onNavigateToTab) {
      onNavigateToTab("analyst");
    }
    setSelectedAnomaly(null);
  };

  const handleJumpToRoute = (anomaly: AnomalyAlertType) => {
    if (onSelectRoute && anomaly.routeId) {
      onSelectRoute(anomaly.routeId);
    } else if (onNavigateToTab) {
      onNavigateToTab("routes");
    }
    setSelectedAnomaly(null);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return {
          label: "Critical Spike",
          pillClass: "bg-rose-950/80 text-rose-400 border-rose-800/50",
          dotClass: "bg-rose-500 animate-ping",
          borderClass: "border-rose-900/40 hover:border-rose-700/60",
        };
      case "medium":
        return {
          label: "Elevated Volatility",
          pillClass: "bg-amber-950/80 text-amber-400 border-amber-800/50",
          dotClass: "bg-amber-400",
          borderClass: "border-amber-900/40 hover:border-amber-700/60",
        };
      default:
        return {
          label: "Yield Observation",
          pillClass: "bg-cyan-950/80 text-cyan-400 border-cyan-800/50",
          dotClass: "bg-cyan-400",
          borderClass: "border-cyan-900/40 hover:border-cyan-700/60",
        };
    }
  };

  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Active Volatility & Anomaly Alerts</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Machine-learned outlier detection across high-density domestic corridors
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => setFilterSeverity("all")}
            className={`px-2 py-0.5 rounded cursor-pointer transition ${
              filterSeverity === "all" ? "bg-slate-800 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({anomalies.length})
          </button>
          <button
            onClick={() => setFilterSeverity("high")}
            className={`px-2 py-0.5 rounded cursor-pointer transition ${
              filterSeverity === "high" ? "bg-rose-950 text-rose-400 font-semibold" : "text-slate-400 hover:text-rose-300"
            }`}
          >
            High
          </button>
          <button
            onClick={() => setFilterSeverity("medium")}
            className={`px-2 py-0.5 rounded cursor-pointer transition ${
              filterSeverity === "medium" ? "bg-amber-950 text-amber-400 font-semibold" : "text-slate-400 hover:text-amber-300"
            }`}
          >
            Medium
          </button>
        </div>
      </div>

      {/* Anomaly Alerts List Cards */}
      <div className="space-y-2.5 flex-1">
        {filteredAnomalies.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-400 text-xs">
            No anomalies match the selected severity filter.
          </div>
        ) : (
          filteredAnomalies.slice(0, maxInitialDisplay).map((anom) => {
            const badge = getSeverityBadge(anom.severity);
            const confidencePercent = Math.round((anom.confidenceScore || 0.92) * 100);

            return (
              <div
                key={anom.id}
                onClick={() => handleOpenDetail(anom)}
                className={`p-3 rounded-xl bg-slate-950/70 border ${badge.borderClass} transition cursor-pointer group hover:bg-slate-950/90 relative overflow-hidden`}
              >
                {/* Accent glow corner */}
                <div
                  className={`absolute -right-8 -top-8 w-16 h-16 rounded-full blur-xl pointer-events-none opacity-20 ${
                    anom.severity === "high" ? "bg-rose-500" : anom.severity === "medium" ? "bg-amber-500" : "bg-cyan-500"
                  }`}
                />

                {/* Top row: Route, Severity badge, Surge Multiplier */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.dotClass}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.dotClass.replace("animate-ping", "")}`} />
                    </span>
                    <span className="font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition" />
                      <span>{anom.route}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded border font-semibold ${badge.pillClass}`}>
                      {badge.label}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-800/40">
                      {anom.surgeMultiplier}x Surge
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white transition mb-1 line-clamp-1">
                  {anom.title}
                </h5>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mb-2">
                  {anom.description}
                </p>

                {/* Metadata Row: Confidence score, Detected Timestamp, Drill-down action */}
                <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-cyan-400 font-semibold" title="Machine Learning Outlier Probability">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      <span>{confidencePercent}% Conf.</span>
                    </span>

                    <span className="flex items-center gap-1 text-slate-400" title={`Detected at ${anom.timestamp || anom.detectedAt}`}>
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{anom.detectedAt}</span>
                    </span>
                  </div>

                  <div className="text-cyan-400 group-hover:text-cyan-300 font-sans font-semibold flex items-center gap-1">
                    <span>Drill down</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer notice */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Click any anomaly to inspect full forensic telemetry</span>
        </span>
        <span className="font-mono text-slate-500 text-[10px]">
          Rule 135 Algorithmic Engine
        </span>
      </div>

      {/* ========================================================================= */}
      {/* DRILL-DOWN DETAIL VIEW MODAL (IN-DEPTH FORENSIC TELEMETRY)               */}
      {/* ========================================================================= */}
      {selectedAnomaly && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setSelectedAnomaly(null)}
        >
          <div
            className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    selectedAnomaly.severity === "high"
                      ? "bg-rose-950/80 border-rose-800 text-rose-400"
                      : selectedAnomaly.severity === "medium"
                      ? "bg-amber-950/80 border-amber-800 text-amber-400"
                      : "bg-cyan-950/80 border-cyan-800 text-cyan-400"
                  }`}
                >
                  <Plane className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      {selectedAnomaly.route}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        getSeverityBadge(selectedAnomaly.severity).pillClass
                      }`}
                    >
                      {getSeverityBadge(selectedAnomaly.severity).label}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                      ID: {selectedAnomaly.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {selectedAnomaly.title}
                  </p>
                </div>
              </div>

              {/* Navigation and Close Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
                  <button
                    onClick={handlePrevAnomaly}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition cursor-pointer"
                    title="Previous Anomaly (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-[11px] font-mono text-slate-400 border-x border-slate-700">
                    {anomalies.findIndex((a) => a.id === selectedAnomaly.id) + 1} / {anomalies.length}
                  </span>
                  <button
                    onClick={handleNextAnomaly}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition cursor-pointer"
                    title="Next Anomaly (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Core Outlier Metadata Banner: 4 Prominent Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-slate-950/60 border-b border-slate-800/80 text-xs">
              {/* Card 1: Specific Route & Corridor */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Specific Corridor</span>
                  <Plane className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="font-mono text-sm font-extrabold text-white mb-0.5 truncate">
                  {selectedAnomaly.originIata || "DEL"} ➔ {selectedAnomaly.destinationIata || "PAT"}
                </div>
                <div className="text-[11px] text-slate-300 font-medium truncate">
                  {selectedAnomaly.corridorType || "Metro-NonMetro Corridor"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/70">
                  DGCA Weight: {selectedAnomaly.dgcaWeightPercent || 32}% · {selectedAnomaly.flightDistanceKm || 854} km
                </div>
              </div>

              {/* Card 2: Confidence Score & Outlier Diagnostics */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Confidence Score</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-1.5 font-mono mb-0.5">
                  <span className="text-xl font-extrabold text-cyan-400">
                    {((selectedAnomaly.confidenceScore || 0.978) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">Outlier Prob.</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${Math.round((selectedAnomaly.confidenceScore || 0.978) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>Z-Score: +{selectedAnomaly.zScore || 3.84}σ</span>
                  <span className="text-slate-500">p &lt; 0.001</span>
                </div>
              </div>

              {/* Card 3: Exact Timestamp & Ingestion Batch */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Detection Time</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="font-mono text-sm font-bold text-white mb-0.5 truncate">
                  {selectedAnomaly.timestamp || "2026-09-14 18:25:12 IST"}
                </div>
                <div className="text-[11px] text-amber-400 font-medium">
                  {selectedAnomaly.detectedAt} (Live Alert)
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/70 truncate">
                  Batch: {selectedAnomaly.ingestionBatchId || "BATCH-20260914-1820"}
                </div>
              </div>

              {/* Card 4: Price Surge & Spread */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Observed Surge</span>
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="flex items-baseline gap-1.5 font-mono mb-0.5">
                  <span className="text-xl font-extrabold text-rose-400">
                    {selectedAnomaly.surgeMultiplier}x
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ₹{selectedAnomaly.observedFare?.toLocaleString("en-IN") || "6,250"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  vs Baseline ₹{selectedAnomaly.baselineFare?.toLocaleString("en-IN") || "2,550"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/70">
                  Window: T-{selectedAnomaly.bookingWindowDays ?? 3} Days to Departure
                </div>
              </div>
            </div>

            {/* Drill-Down Nav Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-5">
              <button
                onClick={() => setActiveDetailTab("overview")}
                className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "overview"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Forensic Overview</span>
              </button>
              <button
                onClick={() => setActiveDetailTab("carriers")}
                className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "carriers"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Carrier Breakdown ({selectedAnomaly.carrierQuotes?.length || 3})</span>
              </button>
              <button
                onClick={() => setActiveDetailTab("diagnostics")}
                className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "diagnostics"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Algorithmic Pipeline</span>
              </button>
              <button
                onClick={() => setActiveDetailTab("regulatory")}
                className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeDetailTab === "regulatory"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>DGCA Tariff Rule 135</span>
              </button>
            </div>

            {/* Modal Body / Tab Panels */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs space-y-4">
              {/* TAB 1: FORENSIC OVERVIEW */}
              {activeDetailTab === "overview" && (
                <div className="space-y-4">
                  {/* Detailed Route Breakdown Banner */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Plane className="w-4 h-4 text-cyan-400" />
                      <span>Route & Airport Catchment Identification</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Origin Terminal</span>
                        <div className="font-bold text-white text-xs mt-0.5">
                          {selectedAnomaly.originName || "Indira Gandhi International Airport, New Delhi (DEL)"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          IATA: <span className="font-mono text-cyan-400 font-bold">{selectedAnomaly.originIata || "DEL"}</span> · Northern Hub Cluster
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-mono uppercase">Destination Terminal</span>
                        <div className="font-bold text-white text-xs mt-0.5">
                          {selectedAnomaly.destinationName || "Jay Prakash Narayan Airport, Patna (PAT)"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          IATA: <span className="font-mono text-cyan-400 font-bold">{selectedAnomaly.destinationIata || "PAT"}</span> · Eastern High-Density Feeder
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Disparity Visual Meter */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                        <span>Dynamic Fare Escalation vs Historical Norm</span>
                      </h5>
                      <span className="font-mono text-rose-400 font-bold">
                        +₹{((selectedAnomaly.observedFare || 6250) - (selectedAnomaly.baselineFare || 2550)).toLocaleString("en-IN")} Net Surge
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Baseline Seasonal Median: ₹{(selectedAnomaly.baselineFare || 2550).toLocaleString("en-IN")}</span>
                          <span className="text-slate-400">Historical Upper Quartile: ₹{(selectedAnomaly.medianHistoricalFare || 2780).toLocaleString("en-IN")}</span>
                          <span className="font-bold text-rose-400">Observed Peak: ₹{(selectedAnomaly.observedFare || 6250).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: "35%" }} title="Baseline Fare" />
                          <div className="bg-amber-500 h-full" style={{ width: "15%" }} title="Historical Quartile Buffer" />
                          <div className="bg-rose-500 h-full animate-pulse" style={{ width: "50%" }} title="Outlier Surge Zone" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Economic Suspected Cause & Market Dynamics */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Info className="w-4 h-4 text-amber-400" />
                      <span>Suspected Market & Algorithmic Cause</span>
                    </h5>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedAnomaly.suspectedCause}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      Our automated scrapers detected synchronized hockey-stick revenue management curves wherein carrier algorithms clamped lower booking classes simultaneously, resulting in a sudden price step-up with zero low-fare inventory released.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: CARRIER BREAKDOWN */}
              {activeDetailTab === "carriers" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-xs">
                      Live quoted fares scraped across operating scheduled airlines on this corridor:
                    </p>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      T-{selectedAnomaly.bookingWindowDays ?? 3} Departure Window
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Carrier</th>
                          <th className="py-2.5 px-3">Flight No</th>
                          <th className="py-2.5 px-3">Quoted Fare</th>
                          <th className="py-2.5 px-3">Delta vs Baseline</th>
                          <th className="py-2.5 px-3">Est. Load Factor</th>
                          <th className="py-2.5 px-3 text-right">Yield Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                        {(selectedAnomaly.carrierQuotes || [
                          { carrier: "IndiGo", carrierCode: "6E", flightNumber: "6E-2194", fare: 6250, deltaPercent: 145.1, loadFactorEstimatePercent: 96 },
                          { carrier: "Air India", carrierCode: "AI", flightNumber: "AI-407", fare: 5980, deltaPercent: 134.5, loadFactorEstimatePercent: 93 },
                          { carrier: "SpiceJet", carrierCode: "SG", flightNumber: "SG-8169", fare: 5800, deltaPercent: 127.4, loadFactorEstimatePercent: 88 },
                        ]).map((c) => (
                          <tr key={c.flightNumber} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 text-[10px]">
                                {c.carrierCode}
                              </span>
                              <span>{c.carrier}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">{c.flightNumber}</td>
                            <td className="py-2.5 px-3 font-bold text-rose-400">
                              ₹{c.fare.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2.5 px-3 text-amber-400 font-bold">
                              +{c.deltaPercent}%
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-300">{c.loadFactorEstimatePercent}%</span>
                                <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      c.loadFactorEstimatePercent > 90 ? "bg-rose-500" : "bg-cyan-500"
                                    }`}
                                    style={{ width: `${c.loadFactorEstimatePercent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950/80 text-rose-400 border border-rose-800/40 font-sans font-semibold">
                                Clamped
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-1">
                    * Data corroborated across Akamai-bypassed direct airline search APIs and major Online Travel Agency (OTA) aggregators.
                  </p>
                </div>
              )}

              {/* TAB 3: ALGORITHMIC PIPELINE DIAGNOSTICS */}
              {activeDetailTab === "diagnostics" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Statistical Outlier Engine Parameters</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase">Ensemble Model</span>
                        <div className="text-white font-bold text-xs mt-0.5 truncate">
                          {selectedAnomaly.detectionAlgorithm || "Robust Sliding Z-Score (14d) + Isolation Forest"}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase">Confidence Score Metric</span>
                        <div className="text-cyan-400 font-bold text-xs mt-0.5">
                          {((selectedAnomaly.confidenceScore || 0.978) * 100).toFixed(2)}% Posterior Outlier Probability
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase">Z-Score Deviation</span>
                        <div className="text-rose-400 font-bold text-xs mt-0.5">
                          +{selectedAnomaly.zScore || 3.84} σ (Threshold = 2.50 σ)
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase">Isolation Forest Score</span>
                        <div className="text-amber-400 font-bold text-xs mt-0.5">
                          {selectedAnomaly.isolationForestScore || -0.428} (Anomaly threshold &lt; -0.20)
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase">Telemetry Timestamp</span>
                        <div className="text-white font-bold text-xs mt-0.5">
                          {selectedAnomaly.timestamp || "2026-09-14 18:25:12 IST"}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase">Ingestion Pipeline Run</span>
                        <div className="text-cyan-300 font-bold text-xs mt-0.5 truncate">
                          {selectedAnomaly.ingestionBatchId || "BATCH-20260914-1820-T3-6E"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Raw Telemetry JSON toggle */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-slate-500" />
                        <span>Machine-Readable Telemetry Payload</span>
                      </span>
                      <button
                        onClick={() => handleCopyTelemetry(selectedAnomaly)}
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedTelemetry ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-slate-300 bg-slate-900/90 p-2.5 rounded-lg overflow-x-auto max-h-36 border border-slate-800">
                      {JSON.stringify(selectedAnomaly, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 4: DGCA REGULATORY ACTION */}
              {activeDetailTab === "regulatory" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                        <Scale className="w-4 h-4 text-amber-400" />
                        <span>Civil Aviation Regulatory Compliance Check</span>
                      </h5>
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px] border border-rose-800/40 font-bold">
                        {selectedAnomaly.regulatoryStatus || "Audit Recommended"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Applicable Law / Directive</span>
                      <div className="font-bold text-white text-xs">
                        {selectedAnomaly.regulatoryRule || "Rule 135 of Aircraft Rules, 1937"}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Mandates scheduled air carriers to establish tariff bands with due regard to operating cost, characteristics of service, reasonable profit, and prevailing tariff of other air transport enterprises.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">AeroNex Automated Recommendation</span>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        {selectedAnomaly.remedialAction || "Issue tariff inquiry to operating carriers under DGCA Tariff Transparency Framework."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Primary Actions */}
            <div className="bg-slate-950 border-t border-slate-800 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={() => handleCopyTelemetry(selectedAnomaly)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              >
                {copiedTelemetry ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied Forensic JSON</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Forensic Data</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleJumpToRoute(selectedAnomaly)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                >
                  <Plane className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect Route Curves</span>
                </button>

                <button
                  onClick={() => handleInvestigateWithAI(selectedAnomaly)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>AI Forensic Deep Dive</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
