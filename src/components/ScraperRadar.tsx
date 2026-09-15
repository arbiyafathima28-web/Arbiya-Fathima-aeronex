import React, { useState } from "react";
import {
  Radio,
  RefreshCw,
  ShieldCheck,
  Zap,
  Globe,
  Server,
  Play,
  CheckCircle2,
  Terminal,
  Activity,
  Layers,
} from "lucide-react";
import { ScraperWorkerInfo, LiveScrapeItem } from "../types";

interface ScraperRadarProps {
  workers: ScraperWorkerInfo[];
  liveFeed: LiveScrapeItem[];
  onTriggerScrape: (route: string, airline: string) => Promise<any>;
}

export const ScraperRadar: React.FC<ScraperRadarProps> = ({
  workers,
  liveFeed,
  onTriggerScrape,
}) => {
  const [selectedSector, setSelectedSector] = useState("DEL ➔ BOM");
  const [selectedSource, setSelectedSource] = useState("IndiGo Direct (6E)");
  const [isTriggering, setIsTriggering] = useState(false);
  const [lastScrapeResult, setLastScrapeResult] = useState<any | null>(null);

  const handleRunScrape = async () => {
    setIsTriggering(true);
    setLastScrapeResult(null);
    try {
      const result = await onTriggerScrape(selectedSector, selectedSource);
      setLastScrapeResult(result);
    } catch (e) {
      console.log("[AeroNex Scraper] Scrape pass notice:", e);
    } finally {
      setIsTriggering(false);
    }
  };

  const totalQuotesToday = workers.reduce((acc, curr) => acc + curr.recordsToday, 0);
  const avgLatency = Math.round(
    workers.reduce((acc, curr) => acc + curr.avgLatencyMs, 0) / workers.length
  );
  const avgSuccessRate = (
    workers.reduce((acc, curr) => acc + curr.successRate, 0) / workers.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
              Automated Ingestion Cluster: Online
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Scraper Radar & Anti-Bot Ingestion Mesh
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time headless browser & network API harvesting across 4 primary carriers and 4 major OTAs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">24h Ingestion</div>
            <div className="text-base font-bold text-white">{totalQuotesToday.toLocaleString("en-IN")}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Avg Cluster Latency</div>
            <div className="text-base font-bold text-cyan-400">{avgLatency} ms</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Success Rate</div>
            <div className="text-base font-bold text-emerald-400">{avgSuccessRate}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-emerald-900/40" title="PostgreSQL table: fare_observations">
            <div className="text-[10px] text-emerald-400 font-mono uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloud SQL Store
            </div>
            <div className="text-base font-bold text-emerald-300">asia-southeast1</div>
          </div>
        </div>
      </div>

      {/* Manual Trigger & Live Telemetry Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Interactive Scraper Dispatch</span>
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              On-Demand Pass
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Dispatch a high-frequency worker to emulate human booking behavior, bypass WAF shields, and parse live sector quotes.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Sector:</label>
              <select
                id="scraper-sector-select"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 outline-none"
              >
                <option value="DEL ➔ BOM">DEL ➔ BOM (Delhi - Mumbai Trunk)</option>
                <option value="BLR ➔ DEL">BLR ➔ DEL (Bengaluru - Delhi)</option>
                <option value="BOM ➔ GOI">BOM ➔ GOI (Mumbai - Goa Tourist)</option>
                <option value="DEL ➔ CCU">DEL ➔ CCU (Delhi - Kolkata)</option>
                <option value="DEL ➔ PAT">DEL ➔ PAT (Patna Chhath Spike Sector)</option>
                <option value="DEL ➔ SXR">DEL ➔ SXR (Srinagar Leisure)</option>
                <option value="BLR ➔ HYD">BLR ➔ HYD (Bengaluru - Hyderabad)</option>
                <option value="DEL ➔ GAU">DEL ➔ GAU (Guwahati North-East)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Carrier / Aggregator Portal:</label>
              <select
                id="scraper-source-select"
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-500 outline-none"
              >
                <option value="IndiGo Direct (6E)">IndiGo Direct Engine (6E)</option>
                <option value="Air India Direct (AI)">Air India Direct Engine (AI)</option>
                <option value="Akasa Air Direct (QP)">Akasa Air Direct Engine (QP)</option>
                <option value="SpiceJet Direct (SG)">SpiceJet Direct Engine (SG)</option>
                <option value="MakeMyTrip Aggregator (MMT)">MakeMyTrip Aggregator (MMT)</option>
                <option value="EaseMyTrip Aggregator (EMT)">EaseMyTrip Aggregator (EMT)</option>
                <option value="Cleartrip OTA">Cleartrip OTA</option>
                <option value="Yatra OTA">Yatra OTA</option>
              </select>
            </div>

            <button
              id="scraper-execute-btn"
              onClick={handleRunScrape}
              disabled={isTriggering}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isTriggering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Emulating Browser & Scraping...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Execute Live Scrape Pass</span>
                </>
              )}
            </button>
          </div>

          {/* Last Scrape Result Box */}
          {lastScrapeResult && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Scrape Verified
                </span>
                <span>{lastScrapeResult.telemetry?.executionTimeMs}ms</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                Fare Captured: <strong className="text-white">₹{lastScrapeResult.result?.fare}</strong>
                <span className="text-slate-400 ml-1">({lastScrapeResult.result?.flightNo})</span>
              </div>
              <div className="text-[10px] text-slate-400 flex flex-wrap justify-between gap-1 pt-1 border-t border-emerald-900/50">
                <span>DOM Nodes: {lastScrapeResult.telemetry?.domNodesScraped}</span>
                <span>WAF Bypass: OK</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Scrape Feed Stream (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Live Scraping Harvester Stream (Real-Time Pipeline)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                Streaming Ingestion
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Source</th>
                    <th className="pb-2">Sector</th>
                    <th className="pb-2">Flight</th>
                    <th className="pb-2">Window</th>
                    <th className="pb-2">Fare</th>
                    <th className="pb-2">Surge Multiplier</th>
                    <th className="pb-2 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {liveFeed.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 text-slate-500 text-[11px]">{item.timestamp}</td>
                      <td className="py-2.5 text-slate-300 font-sans font-medium text-[11px]">
                        {item.source}
                      </td>
                      <td className="py-2.5 text-cyan-300 font-bold">{item.route}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{item.flightNo}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">T-{item.advanceDays}D</td>
                      <td className="py-2.5 text-white font-bold">₹{item.fare.toLocaleString("en-IN")}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.dynamicMultiplier > 1.3
                              ? "bg-amber-950 text-amber-400 border border-amber-800/40"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {item.dynamicMultiplier}x
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400 text-[11px]">
                        {item.convenienceFee > 0 ? (
                          <span className="text-amber-400">+₹{item.convenienceFee}</span>
                        ) : (
                          <span className="text-emerald-400">₹0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Data Validation: Outliers filtered with double-sided Huber estimator</span>
            <span className="text-cyan-400">Auto-refresh every 15 seconds</span>
          </div>
        </div>
      </div>

      {/* 8 Worker Node Cards Grid */}
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Scraper Worker Nodes & Proxy Mesh Telemetry (8 Engines)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workers.map((w) => (
            <div
              key={w.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                    {w.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">{w.type}</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {w.status}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <div className="flex justify-between">
                  <span className="text-slate-500">24h Quotes:</span>
                  <span className="text-white font-bold">{w.recordsToday.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Avg Latency:</span>
                  <span className="text-cyan-400">{w.avgLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Success Rate:</span>
                  <span className="text-emerald-400">{w.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Harvest:</span>
                  <span className="text-slate-400">{w.lastScraped}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 space-y-1 pt-1">
                <div className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span className="truncate">{w.captchaBypass}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Globe className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{w.ipRotation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
