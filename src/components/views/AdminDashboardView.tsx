import React from "react";
import {
  Settings,
  ShieldCheck,
  Activity,
  Server,
  Database,
  Cloud,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Layers,
  Radio,
} from "lucide-react";
import { ScraperWorkerInfo, LiveScrapeItem } from "../../types";
import { AdminSubsection } from "../../types/navigation";
import { ScraperRadar } from "../ScraperRadar";
import { useAuth } from "../../context/AuthContext";

interface AdminDashboardViewProps {
  workers: ScraperWorkerInfo[];
  liveFeed: LiveScrapeItem[];
  currentSubsection: AdminSubsection;
  onSelectSubsection: (sub: AdminSubsection) => void;
  onTriggerScrape: (route: string, airline: string) => Promise<any>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  workers,
  liveFeed,
  currentSubsection,
  onSelectSubsection,
  onTriggerScrape,
}) => {
  const { dbConnected } = useAuth();

  const totalQuotesToday = workers.reduce((acc, curr) => acc + curr.recordsToday, 0);
  const avgLatency = Math.round(
    workers.reduce((acc, curr) => acc + curr.avgLatencyMs, 0) / workers.length
  );
  const avgSuccessRate = (
    workers.reduce((acc, curr) => acc + curr.successRate, 0) / workers.length
  ).toFixed(1);

  // Worker node cluster data
  const workerNodes = [
    { name: "ap-south-1a (Mumbai Node 01)", role: "Direct Airline Ingestion (6E/AI)", status: "healthy", cpu: "28%", ram: "1.4 GB / 4.0 GB", uptime: "99.99%", quotes: "48,290" },
    { name: "ap-south-1b (Delhi Node 02)", role: "OTA Feeds (MMT/EMT)", status: "healthy", cpu: "34%", ram: "1.8 GB / 4.0 GB", uptime: "99.95%", quotes: "42,100" },
    { name: "ap-south-1c (Bengaluru Node 03)", role: "Regional & Anti-Bot Proxy Mesh", status: "healthy", cpu: "22%", ram: "1.1 GB / 4.0 GB", uptime: "99.98%", quotes: "32,840" },
    { name: "ap-south-2a (Hyderabad Node 04)", role: "Cleartrip/Yatra & Hot Standby", status: "healthy", cpu: "18%", ram: "0.9 GB / 4.0 GB", uptime: "100.0%", quotes: "19,620" },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            System Administration & Telemetry
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          {[
            { id: "data-quality" as const, label: "Data Quality" },
            { id: "collection-health" as const, label: "Collection Health" },
            { id: "scraper-health" as const, label: "Scrapers & Anti-Bot" },
            { id: "worker-health" as const, label: "Worker Cluster" },
            { id: "system-status" as const, label: "System Status" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectSubsection(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                currentSubsection === tab.id
                  ? "bg-slate-700 text-white font-bold shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW 1: Data Quality */}
      {currentSubsection === "data-quality" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Data Quality & Statistical Hygiene SLA</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Automated pipelines filter raw portal HTML/JSON responses, eliminating ghost flight fares, cancelled inventory, and scraper artifacts before computing national indices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Outlier Trimming Rate</div>
              <div className="text-2xl font-bold text-cyan-300 font-mono">2.4%</div>
              <p className="text-[10px] text-slate-500">Quotes &gt; 3.0σ trimmed using sliding IQR</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Missing Quote Imputation</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">99.8%</div>
              <p className="text-[10px] text-slate-500">Linear time-to-departure Kalman smoothing</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Schema Validation Pass</div>
              <div className="text-2xl font-bold text-white font-mono">100.0%</div>
              <p className="text-[10px] text-slate-500">Zero non-conforming flight payloads</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1">
              <div className="text-[11px] text-slate-400 font-medium">Data Freshness SLA</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">&lt; 15 mins</div>
              <p className="text-[10px] text-slate-500">Continuous quote ingestion cycles</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Collection Health */}
      {currentSubsection === "collection-health" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Daily Ingestion Throughput & Feed Metrics</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Monitoring daily quote intake across all 8 scraper targets. High volume guarantees representative modal and median airfare estimates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center font-mono">
              <div className="text-xs text-slate-400 uppercase font-sans">Total Quotes Ingested Today</div>
              <div className="text-3xl font-black text-cyan-300 mt-1">{totalQuotesToday.toLocaleString("en-IN")}</div>
              <div className="text-[11px] text-emerald-400 mt-1 font-sans">Target: 140,000+ quotes/day</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center font-mono">
              <div className="text-xs text-slate-400 uppercase font-sans">Average Scraper Latency</div>
              <div className="text-3xl font-black text-white mt-1">{avgLatency} ms</div>
              <div className="text-[11px] text-slate-400 mt-1 font-sans">Across residential proxy pool</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center font-mono">
              <div className="text-xs text-slate-400 uppercase font-sans">Ingestion Success Rate</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">{avgSuccessRate}%</div>
              <div className="text-[11px] text-slate-400 mt-1 font-sans">Zero scraper IP bans recorded</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Scrapers & Anti-Bot */}
      {currentSubsection === "scraper-health" && (
        <ScraperRadar
          workers={workers}
          liveFeed={liveFeed}
          onTriggerScrape={onTriggerScrape}
        />
      )}

      {/* VIEW 4: Worker Cluster */}
      {currentSubsection === "worker-health" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Distributed Worker Node Cluster</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Worker nodes distributed across Indian cloud availability zones to query airline booking engines with sub-millisecond local network hops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workerNodes.map((node) => (
              <div key={node.name} className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-bold text-white font-mono">{node.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 uppercase">
                    {node.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{node.role}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">CPU Load</span>
                    <strong className="text-slate-200">{node.cpu}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">RAM Usage</span>
                    <strong className="text-slate-200">{node.ram}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Quotes Handled</span>
                    <strong className="text-cyan-400">{node.quotes}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 5: System Status */}
      {currentSubsection === "system-status" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-lg font-bold text-white">Cloud Infrastructure & Database Status</h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Monitoring dual-tier storage: Google Cloud Firestore for real-time reactive documents and Cloud SQL PostgreSQL for relational index series and user audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Google Cloud Firestore</h4>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${dbConnected ? "bg-emerald-950 text-emerald-300" : "bg-amber-950 text-amber-300"}`}>
                  {dbConnected ? "ONLINE" : "SYNCING"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                User reports, saved simulations, and real-time reactive quote streaming.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Cloud SQL (PostgreSQL)</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Drizzle ORM schema storing historical index points and user audit sessions.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Express / tsx Runtime</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                  HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                API proxy endpoints, Gemini 2.5 SDK integration, and live scraper triggers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
