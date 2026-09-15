import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { ScraperRadar } from "./components/ScraperRadar";
import { RouteFareExplorer } from "./components/RouteFareExplorer";
import { OtaMarginAnalyzer } from "./components/OtaMarginAnalyzer";
import { IndexMethodology } from "./components/IndexMethodology";
import { PolicySimulator } from "./components/PolicySimulator";
import { GeminiAnalyst } from "./components/GeminiAnalyst";
import { VisualStudio } from "./components/VisualStudio";
import { ExportModal } from "./components/ExportModal";
import {
  ROUTES_DATA,
  HISTORICAL_INDEX_DATA,
  SCRAPER_WORKERS,
  LIVE_SCRAPE_FEED,
  ANOMALIES_DATA,
} from "./data/mockData";
import { RouteData, IndexTimeSeriesPoint, ScraperWorkerInfo, LiveScrapeItem, AnomalyAlert } from "./types";
import { Plane, ShieldCheck, Database, Award, ExternalLink } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [routes, setRoutes] = useState<RouteData[]>(ROUTES_DATA);
  const [timeSeries, setTimeSeries] = useState<IndexTimeSeriesPoint[]>(HISTORICAL_INDEX_DATA);
  const [workers, setWorkers] = useState<ScraperWorkerInfo[]>(SCRAPER_WORKERS);
  const [liveFeed, setLiveFeed] = useState<LiveScrapeItem[]>(LIVE_SCRAPE_FEED);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>(ANOMALIES_DATA);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("del-bom");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Prefill state for Gemini AI prompt when jumped from other tabs
  const [aiPrefillPrompt, setAiPrefillPrompt] = useState<string>("");
  const [aiPrefillType, setAiPrefillType] = useState<string>("mospi_brief");
  const [aiPrefillContext, setAiPrefillContext] = useState<any>(null);

  // Fetch initial telemetry from backend if available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [routesRes, telemetryRes, anomaliesRes] = await Promise.all([
          fetch("/api/routes"),
          fetch("/api/scrapers/telemetry"),
          fetch("/api/anomalies"),
        ]);
        const routesType = routesRes.headers.get("content-type") || "";
        if (routesRes.ok && routesType.includes("application/json")) {
          const rData = await routesRes.json();
          if (Array.isArray(rData) && rData.length > 0) setRoutes(rData);
        }
        const telemetryType = telemetryRes.headers.get("content-type") || "";
        if (telemetryRes.ok && telemetryType.includes("application/json")) {
          const tData = await telemetryRes.json();
          if (tData.workers) setWorkers(tData.workers);
          if (tData.liveFeed) setLiveFeed(tData.liveFeed);
        }
        const anomaliesType = anomaliesRes.headers.get("content-type") || "";
        if (anomaliesRes.ok && anomaliesType.includes("application/json")) {
          const aData = await anomaliesRes.json();
          if (Array.isArray(aData) && aData.length > 0) setAnomalies(aData);
        }
      } catch (err) {
        console.log("[AeroNex] Using local fallback dataset:", err);
      }
    }
    loadBackendData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/scrapers/telemetry");
      const cType = res.headers.get("content-type") || "";
      if (res.ok && cType.includes("application/json")) {
        const data = await res.json();
        if (data.workers) setWorkers(data.workers);
        if (data.liveFeed) setLiveFeed(data.liveFeed);
      }
    } catch (e) {
      console.log("[AeroNex] Telemetry refresh notice:", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleTriggerScrape = async (route: string, airline: string) => {
    try {
      const res = await fetch("/api/scrapers/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route, airline }),
      });
      const cType = res.headers.get("content-type") || "";
      if (res.ok && cType.includes("application/json")) {
        const data = await res.json();
        if (data.result) {
          setLiveFeed((prev) => [data.result, ...prev.slice(0, 19)]);
        }
        return data;
      }
      throw new Error("Invalid response format");
    } catch (e) {
      console.log("[AeroNex] Using simulated scrape pass:", e);
      // Local fallback
      const newItem: LiveScrapeItem = {
        id: "mock-" + Date.now(),
        timestamp: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        source: airline,
        route,
        flightNo: "AI-" + Math.floor(100 + Math.random() * 800),
        advanceDays: 3,
        fare: 5400 + Math.floor(Math.random() * 2000),
        dynamicMultiplier: 1.25,
        convenienceFee: airline.includes("Direct") ? 0 : 349,
      };
      setLiveFeed((prev) => [newItem, ...prev.slice(0, 19)]);
      return { success: true, result: newItem };
    }
  };

  const handleTriggerAiFromOtherTab = (prompt: string, analysisType: string, contextData: any) => {
    setAiPrefillPrompt(prompt);
    setAiPrefillType(analysisType);
    setAiPrefillContext(contextData);
    setActiveTab("analyst");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top App Header */}
      <Header
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenExport={() => setIsExportOpen(true)}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />

      {/* Main Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        anomaliesCount={anomalies.length}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <OverviewDashboard
            routes={routes}
            timeSeries={timeSeries}
            anomalies={anomalies}
            onSelectRoute={(rId) => {
              setSelectedRouteId(rId);
              setActiveTab("routes");
            }}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
            onTriggerAiAnalysis={handleTriggerAiFromOtherTab}
          />
        )}

        {activeTab === "radar" && (
          <ScraperRadar
            workers={workers}
            liveFeed={liveFeed}
            onTriggerScrape={handleTriggerScrape}
          />
        )}

        {activeTab === "routes" && (
          <RouteFareExplorer
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
          />
        )}

        {activeTab === "otas" && <OtaMarginAnalyzer routes={routes} />}

        {activeTab === "methodology" && <IndexMethodology routes={routes} />}

        {activeTab === "simulator" && (
          <PolicySimulator
            routes={routes}
            onTriggerAiAnalysis={handleTriggerAiFromOtherTab}
          />
        )}

        {activeTab === "analyst" && (
          <GeminiAnalyst
            routes={routes}
            timeSeries={timeSeries}
            prefilledPrompt={aiPrefillPrompt}
            prefilledType={aiPrefillType}
            prefilledContext={aiPrefillContext}
          />
        )}

        {activeTab === "infographics" && <VisualStudio />}
      </main>

      {/* Export Dataset Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        routes={routes}
        timeSeries={timeSeries}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <Plane className="w-3.5 h-3.5 text-cyan-400 transform -rotate-45" />
            </div>
            <div>
              <span className="font-bold text-white">AeroNex</span> — Real-time Airfare Price Index (APIx)
            </div>
          </div>

          <div className="text-center md:text-right space-y-0.5 font-mono text-[11px] text-slate-500">
            <div>Development of Real-time Airfare Price Index for CPI Augmentation</div>
            <div className="text-slate-400">
              National Statistical Office (NSO) · Ministry of Civil Aviation (MoCA) · RBI MPC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
