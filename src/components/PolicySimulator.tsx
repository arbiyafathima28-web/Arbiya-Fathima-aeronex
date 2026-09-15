import React, { useState, useMemo, useEffect } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Shield,
  Fuel,
  Users,
  Plane,
  Coins,
  BookmarkPlus,
  Save,
  Trash2,
  Cloud,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { RouteData, SimulationParams } from "../types";
import { simulatePolicyScenario, calculateLaspeyres } from "../utils/indexEngine";
import { useAuth } from "../context/AuthContext";
import {
  saveUserSimulation,
  deleteUserSimulation,
  subscribeToUserSimulations,
  SavedSimulationDoc,
} from "../lib/firebase";

interface PolicySimulatorProps {
  routes: RouteData[];
  onTriggerAiAnalysis: (prompt: string, analysisType: string, contextData: any) => void;
}

export const PolicySimulator: React.FC<PolicySimulatorProps> = ({
  routes,
  onTriggerAiAnalysis,
}) => {
  const { user, signIn } = useAuth();

  const defaultParams: SimulationParams = {
    atfPriceChangePercent: 0,
    fareCapPolicy: "none",
    seasonalSurgeMultiplier: 1.0,
    capacityGroundingPercent: 0,
  };

  const [params, setParams] = useState<SimulationParams>(defaultParams);
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulationDoc[]>([]);

  // Real-time listener for user saved simulations in Firestore
  useEffect(() => {
    if (!user) {
      setSavedSimulations([]);
      return;
    }
    const unsubscribe = subscribeToUserSimulations(
      user.uid,
      (sims) => {
        setSavedSimulations(sims);
      },
      (err) => {
        console.log("[AeroNex Simulator] Simulation state notice:", err);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const simulationResults = useMemo(() => {
    return simulatePolicyScenario(routes, params);
  }, [routes, params]);

  const baseLaspeyres = calculateLaspeyres(routes);
  const indexDelta = simulationResults.projectedLaspeyres - baseLaspeyres;

  const handleRunAiAudit = () => {
    const prompt = `Analyze this simulated civil aviation shock: ATF fuel change is ${params.atfPriceChangePercent}%, Fare capping policy is ${params.fareCapPolicy}, Festival surge multiplier is ${params.seasonalSurgeMultiplier}x, and Fleet grounding is ${params.capacityGroundingPercent}%. Explain the resulting AFPI change to ${simulationResults.projectedLaspeyres} and headline CPI impulse of ${simulationResults.cpiHeadlineBpsShift} basis points. Recommend policy interventions for MoCA and MoSPI.`;
    onTriggerAiAnalysis(prompt, "policy_simulation", {
      params,
      baseLaspeyres,
      projectedLaspeyres: simulationResults.projectedLaspeyres,
      cpiShiftBps: simulationResults.cpiHeadlineBpsShift,
      consumerSurplusDeltaCrores: simulationResults.consumerSurplusDeltaCrores,
    });
  };

  const handleSaveToFirestore = async () => {
    if (!user) {
      await signIn();
      return;
    }
    const titleToSave = scenarioTitle.trim() || `Simulation ${params.atfPriceChangePercent > 0 ? "+" : ""}${params.atfPriceChangePercent}% Fuel (${params.fareCapPolicy} cap)`;
    setIsSaving(true);
    try {
      const newSimId = "sim-" + Date.now();
      await saveUserSimulation(user.uid, {
        id: newSimId,
        title: titleToSave,
        fuelShockPercent: params.atfPriceChangePercent,
        capRule: params.fareCapPolicy,
        festivalSurge: params.seasonalSurgeMultiplier,
        capacityShock: params.capacityGroundingPercent,
        cpiBasisPointsImpact: simulationResults.cpiHeadlineBpsShift,
        nationalSurplusShiftCr: simulationResults.consumerSurplusDeltaCrores,
        createdAt: new Date().toISOString(),
      });
      setScenarioTitle("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.log("[AeroNex Simulator] Simulation save notice:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSimulation = (sim: SavedSimulationDoc) => {
    setParams({
      atfPriceChangePercent: sim.fuelShockPercent,
      fareCapPolicy: (sim.capRule as any) || "none",
      seasonalSurgeMultiplier: sim.festivalSurge,
      capacityGroundingPercent: sim.capacityShock,
    });
  };

  const handleDeleteSimulation = async (e: React.MouseEvent, simId: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteUserSimulation(user.uid, simId);
    } catch (err) {
      console.log("[AeroNex Simulator] Simulation delete notice:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                MoCA / MoSPI / RBI POLICY SANDBOX
              </span>
              <span className="text-xs text-slate-400">Macroeconomic Policy Simulator</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Aviation Turbine Fuel (ATF) & Regulatory Fare Cap Simulator
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Model how tax adjustments on ATF, emergency fare band ceilings, and seasonal festival spikes transmit into the headline Consumer Price Index.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setParams(defaultParams)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Parameters</span>
            </button>
            <button
              onClick={handleRunAiAudit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-950/50 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>AI Policy Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Grid: Sliders (Left) vs Projected Macro Impact (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Box (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Policy & Cost Variables</span>
          </h3>

          {/* Slider 1: ATF Price Shock */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                ATF Fuel Price Fluctuation:
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {params.atfPriceChangePercent > 0 ? "+" : ""}
                {params.atfPriceChangePercent}%
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="40"
              step="5"
              value={params.atfPriceChangePercent}
              onChange={(e) =>
                setParams({ ...params, atfPriceChangePercent: Number(e.target.value) })
              }
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-30% (Tax Cut)</span>
              <span>Baseline (₹97,800/kL)</span>
              <span>+40% (Global Shock)</span>
            </div>
          </div>

          {/* Selector 2: MoCA Fare Band Regulatory Ceiling */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              MoCA Emergency Fare Band Cap:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setParams({ ...params, fareCapPolicy: "none" })}
                className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer text-[11px] ${
                  params.fareCapPolicy === "none"
                    ? "bg-cyan-950 text-cyan-300 border-cyan-700 font-bold"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                Uncapped
              </button>
              <button
                type="button"
                onClick={() => setParams({ ...params, fareCapPolicy: "moderate" })}
                className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer text-[11px] ${
                  params.fareCapPolicy === "moderate"
                    ? "bg-cyan-950 text-cyan-300 border-cyan-700 font-bold"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                +50% Band
              </button>
              <button
                type="button"
                onClick={() => setParams({ ...params, fareCapPolicy: "strict" })}
                className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer text-[11px] ${
                  params.fareCapPolicy === "strict"
                    ? "bg-cyan-950 text-cyan-300 border-cyan-700 font-bold"
                    : "bg-slate-950 text-slate-400 border-slate-800"
                }`}
              >
                +25% Strict
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              {params.fareCapPolicy === "none"
                ? "Full dynamic algorithmic pricing permitted."
                : params.fareCapPolicy === "moderate"
                ? "Caps maximum fare at 1.5x of base corridor rate."
                : "Strict regulatory ceiling at 1.25x of base corridor rate."}
            </p>
          </div>

          {/* Slider 3: Festive & Holiday Demand Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Festive Demand Multiplier:
              </span>
              <span className="font-mono font-bold text-amber-400">
                {params.seasonalSurgeMultiplier}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.2"
              step="0.1"
              value={params.seasonalSurgeMultiplier}
              onChange={(e) =>
                setParams({ ...params, seasonalSurgeMultiplier: Number(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1.0x (Normal)</span>
              <span>1.5x (Diwali/Puja)</span>
              <span>2.2x (Extreme Peak)</span>
            </div>
          </div>

          {/* Slider 4: Fleet Capacity Shortage */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-rose-400" />
                Fleet Supply Grounding:
              </span>
              <span className="font-mono font-bold text-rose-400">
                {params.capacityGroundingPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              value={params.capacityGroundingPercent}
              onChange={(e) =>
                setParams({ ...params, capacityGroundingPercent: Number(e.target.value) })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Full Fleet)</span>
              <span>10% (Engine Checks)</span>
              <span>25% (Crisis)</span>
            </div>
          </div>
        </div>

        {/* Output Telemetry & Macro Economic Projections (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Projected KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">
                Projected Airfare Index (AFPI)
              </div>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-3xl font-extrabold text-white">
                  {simulationResults.projectedLaspeyres}
                </span>
                <span
                  className={`text-xs font-bold ${
                    indexDelta >= 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {indexDelta >= 0 ? "+" : ""}{indexDelta.toFixed(1)} pts
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Current base: {baseLaspeyres.toFixed(1)}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">
                Headline CPI Shift
              </div>
              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-3xl font-extrabold text-cyan-400">
                  {simulationResults.cpiHeadlineBpsShift > 0 ? "+" : ""}
                  {simulationResults.cpiHeadlineBpsShift} bps
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Direct transmission to National CPI
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">
                Consumer Surplus Impact
              </div>
              <div className="flex items-baseline gap-2 font-mono">
                <span
                  className={`text-2xl font-extrabold ${
                    simulationResults.consumerSurplusDeltaCrores >= 0
                      ? "text-rose-400"
                      : "text-emerald-400"
                  }`}
                >
                  {simulationResults.consumerSurplusDeltaCrores >= 0 ? "+" : ""}₹
                  {Math.abs(simulationResults.consumerSurplusDeltaCrores).toLocaleString("en-IN")} Cr
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {simulationResults.consumerSurplusDeltaCrores >= 0 ? "Added Consumer Cost" : "Consumer Savings"}
              </div>
            </div>
          </div>

          {/* Projected Sector Matrix Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-white mb-3">
              Sector Pricing Simulation (Top Corridors)
            </h4>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2 font-sans">Sector</th>
                    <th className="pb-2">Current Median</th>
                    <th className="pb-2">Projected Fare</th>
                    <th className="pb-2">Rupee Delta</th>
                    <th className="pb-2 text-right">Regulatory Cap Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {simulationResults.simulatedRoutes.slice(0, 7).map((sr) => {
                    const original = routes.find((r) => r.id === sr.id)!;
                    const diff = sr.currentMedianPrice - original.currentMedianPrice;
                    const isCapped =
                      params.fareCapPolicy !== "none" &&
                      (params.fareCapPolicy === "moderate"
                        ? sr.currentMedianPrice >= original.basePrice2024 * 1.5
                        : sr.currentMedianPrice >= original.basePrice2024 * 1.25);

                    return (
                      <tr key={sr.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 text-white font-sans font-medium">
                          {sr.origin} ➔ {sr.destination}
                        </td>
                        <td className="py-2.5 text-slate-400">
                          ₹{original.currentMedianPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 text-white font-bold text-sm">
                          ₹{sr.currentMedianPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`font-bold ${
                              diff >= 0 ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {diff >= 0 ? "+" : ""}₹{diff.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-sans">
                          {isCapped ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800/50 font-semibold">
                              Capped by Policy
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Unconstrained</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Firestore Saved Scenarios Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Firestore Cloud Scenarios</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  {savedSimulations.length} Saved
                </span>
              </div>
              {user ? (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced as {user.email?.split("@")[0]}
                </span>
              ) : (
                <button
                  onClick={signIn}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in with Google to sync</span>
                </button>
              )}
            </div>

            {/* Save Current Scenario Form */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={scenarioTitle}
                onChange={(e) => setScenarioTitle(e.target.value)}
                placeholder="Name this scenario (e.g. Diwali Surge +15% Fuel)..."
                maxLength={120}
                className="flex-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
              />
              <button
                onClick={handleSaveToFirestore}
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving..." : "Save to Cloud"}</span>
                  </>
                )}
              </button>
            </div>

            {/* Saved Scenarios List */}
            {savedSimulations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {savedSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => handleLoadSimulation(sim)}
                    className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                          {sim.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            Fuel: {sim.fuelShockPercent > 0 ? "+" : ""}{sim.fuelShockPercent}%
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            Cap: {sim.capRule}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                            Surge: {sim.festivalSurge}x
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSimulation(e, sim.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition cursor-pointer"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-cyan-400 font-mono font-semibold">
                        CPI: {sim.cpiBasisPointsImpact > 0 ? "+" : ""}{sim.cpiBasisPointsImpact} bps
                      </span>
                      <span className="text-slate-500 font-sans">
                        Click to load ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 font-sans">
                {user ? (
                  "No saved simulation scenarios in your cloud profile yet. Enter a name above and click Save to Cloud."
                ) : (
                  "Sign in to persist your customized stress-test scenarios in Google Cloud Firestore."
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
