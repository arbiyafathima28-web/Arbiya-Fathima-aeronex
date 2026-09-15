import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./components/navigation/Sidebar";
import { TopHeader } from "./components/navigation/TopHeader";
import { OverviewDashboard } from "./components/OverviewDashboard";
import { IndiaRouteMap } from "./components/IndiaRouteMap";
import { RouteFareExplorer } from "./components/RouteFareExplorer";
import { AdvanceBookingView } from "./components/views/AdvanceBookingView";
import { FareCompositionView } from "./components/views/FareCompositionView";
import { OtaMarginAnalyzer } from "./components/OtaMarginAnalyzer";
import { AirfareIndexView } from "./components/views/AirfareIndexView";
import { CpiAugmentationView } from "./components/views/CpiAugmentationView";
import { IndexMethodology } from "./components/IndexMethodology";
import { PolicySimulator } from "./components/PolicySimulator";
import { GeminiAnalyst } from "./components/GeminiAnalyst";
import { BriefingStudioView } from "./components/views/BriefingStudioView";
import { AdminDashboardView } from "./components/views/AdminDashboardView";
import { ExportModal } from "./components/ExportModal";
import {
  ROUTES_DATA,
  HISTORICAL_INDEX_DATA,
  SCRAPER_WORKERS,
  LIVE_SCRAPE_FEED,
  ANOMALIES_DATA,
} from "./data/mockData";
import {
  RouteData,
  IndexTimeSeriesPoint,
  ScraperWorkerInfo,
  LiveScrapeItem,
  AnomalyAlert,
} from "./types";
import { SectionId, SubsectionId } from "./types/navigation";
import { getDefaultSubsection } from "./components/navigation/navigationConfig";
import { Plane, ShieldCheck, Database, Award, ExternalLink } from "lucide-react";

export function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [activeSubsection, setActiveSubsection] = useState<SubsectionId>(
    getDefaultSubsection("overview")
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [routes, setRoutes] = useState<RouteData[]>(ROUTES_DATA);
  const [timeSeries, setTimeSeries] = useState<IndexTimeSeriesPoint[]>(HISTORICAL_INDEX_DATA);
  const [workers, setWorkers] = useState<ScraperWorkerInfo[]>(SCRAPER_WORKERS);
  const [liveFeed, setLiveFeed] = useState<LiveScrapeItem[]>(LIVE_SCRAPE_FEED);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>(ANOMALIES_DATA);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("del-bom");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Prefill state for Gemini AI prompt when jumped from other views
  const [aiPrefillPrompt, setAiPrefillPrompt] = useState<string>("");
  const [aiPrefillType, setAiPrefillType] = useState<string>("mospi_brief");
  const [aiPrefillContext, setAiPrefillContext] = useState<any>(null);

  // Load telemetry from backend if available
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
        console.log("[AeroNex] Initialized with statistical baseline dataset:", err);
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
      console.log("[AeroNex] Telemetry refresh status:", e);
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
      console.log("[AeroNex] Executing simulated scraper pass:", e);
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

  const handleNavigate = useCallback(
    (sectionId: SectionId, subsectionId?: SubsectionId) => {
      setActiveSection(sectionId);
      if (subsectionId) {
        setActiveSubsection(subsectionId);
      } else {
        setActiveSubsection(getDefaultSubsection(sectionId));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  // Map legacy tabs from Overview or widgets to new hierarchical routing
  const handleLegacyNavigate = (legacyTab: string) => {
    switch (legacyTab) {
      case "overview":
        handleNavigate("overview");
        break;
      case "routes":
        handleNavigate("live-data", "route-explorer");
        break;
      case "map":
        handleNavigate("live-data", "india-map");
        break;
      case "advance":
        handleNavigate("live-data", "advance-booking");
        break;
      case "composition":
        handleNavigate("live-data", "fare-composition");
        break;
      case "otas":
        handleNavigate("live-data", "airline-ota");
        break;
      case "index":
        handleNavigate("airfare-index", "national-afpi");
        break;
      case "cpi":
        handleNavigate("cpi-augmentation", "cpi-impact");
        break;
      case "methodology":
        handleNavigate("methodology");
        break;
      case "simulator":
        handleNavigate("policy-simulator");
        break;
      case "analyst":
        handleNavigate("ai-analyst");
        break;
      case "briefing":
      case "infographics":
        handleNavigate("briefing-studio", "generate-brief");
        break;
      case "radar":
      case "admin":
        handleNavigate("admin", "scraper-health");
        break;
      default:
        handleNavigate("overview");
    }
  };

  const handleTriggerAiFromOtherTab = (prompt: string, analysisType: string, contextData: any) => {
    setAiPrefillPrompt(prompt);
    setAiPrefillType(analysisType);
    setAiPrefillContext(contextData);
    handleNavigate("ai-analyst");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-cyan-500 selection:text-black antialiased">
      {/* 1. PROFESSIONAL FIXED LEFT SIDEBAR (Desktop persistent, Mobile drawer) */}
      <Sidebar
        activeSection={activeSection}
        activeSubsection={activeSubsection}
        onNavigate={handleNavigate}
        mobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. MAIN APPLICATION WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* COMPACT TOP HEADER */}
        <TopHeader
          activeSection={activeSection}
          activeSubsection={activeSubsection}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onOpenExport={() => setIsExportOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* WORKSPACE CONTENT CANVAS */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* SECTION 1: OVERVIEW */}
          {activeSection === "overview" && (
            <OverviewDashboard
              routes={routes}
              timeSeries={timeSeries}
              anomalies={anomalies}
              onSelectRoute={(rId) => {
                setSelectedRouteId(rId);
                handleNavigate("live-data", "route-explorer");
              }}
              onNavigateToTab={handleLegacyNavigate}
              onTriggerAiAnalysis={handleTriggerAiFromOtherTab}
            />
          )}

          {/* SECTION 2: LIVE DATA */}
          {activeSection === "live-data" && (
            <>
              {activeSubsection === "route-explorer" && (
                <RouteFareExplorer
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                  anomalies={anomalies}
                  onOpenMap={() => handleNavigate("live-data", "india-map")}
                />
              )}

              {activeSubsection === "india-map" && (
                <IndiaRouteMap
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                />
              )}

              {activeSubsection === "advance-booking" && (
                <AdvanceBookingView
                  routes={routes}
                  onSelectRouteForExplorer={(rId) => {
                    setSelectedRouteId(rId);
                    handleNavigate("live-data", "route-explorer");
                  }}
                />
              )}

              {activeSubsection === "fare-composition" && (
                <FareCompositionView
                  routes={routes}
                  onSelectRouteForExplorer={(rId) => {
                    setSelectedRouteId(rId);
                    handleNavigate("live-data", "route-explorer");
                  }}
                  onNavigateToOtaComparison={() => handleNavigate("live-data", "ota-comparison")}
                />
              )}

              {(activeSubsection === "ota-comparison" || activeSubsection === "airline-ota") && (
                <OtaMarginAnalyzer routes={routes} />
              )}
            </>
          )}

          {/* SECTION 3: AIRFARE INDEX */}
          {activeSection === "airfare-index" && (
            <AirfareIndexView
              routes={routes}
              timeSeries={timeSeries}
              currentSubsection={activeSubsection as any}
              onSelectSubsection={(sub) => handleNavigate("airfare-index", sub)}
              onSelectRouteForExplorer={(rId) => {
                setSelectedRouteId(rId);
                handleNavigate("live-data", "route-explorer");
              }}
            />
          )}

          {/* SECTION 4: CPI AUGMENTATION */}
          {activeSection === "cpi-augmentation" && (
            <CpiAugmentationView
              routes={routes}
              timeSeries={timeSeries}
              currentSubsection={activeSubsection as any}
              onSelectSubsection={(sub) => handleNavigate("cpi-augmentation", sub)}
            />
          )}

          {/* SECTION 5: METHODOLOGY */}
          {activeSection === "methodology" && (
            <IndexMethodology routes={routes} />
          )}

          {/* SECTION 6: POLICY SIMULATOR */}
          {activeSection === "policy-simulator" && (
            <PolicySimulator
              routes={routes}
              onTriggerAiAnalysis={handleTriggerAiFromOtherTab}
            />
          )}

          {/* SECTION 7: AI INFLATION ANALYST */}
          {activeSection === "ai-analyst" && (
            <GeminiAnalyst
              routes={routes}
              timeSeries={timeSeries}
              prefilledPrompt={aiPrefillPrompt}
              prefilledType={aiPrefillType}
              prefilledContext={aiPrefillContext}
            />
          )}

          {/* SECTION 8: BRIEFING STUDIO */}
          {activeSection === "briefing-studio" && (
            <BriefingStudioView
              routes={routes}
              timeSeries={timeSeries}
              currentSubsection={activeSubsection as any}
              onSelectSubsection={(sub) => handleNavigate("briefing-studio", sub)}
              onOpenExportModal={() => setIsExportOpen(true)}
            />
          )}

          {/* SECTION 9: ADMIN */}
          {activeSection === "admin" && (
            <AdminDashboardView
              workers={workers}
              liveFeed={liveFeed}
              currentSubsection={activeSubsection as any}
              onSelectSubsection={(sub) => handleNavigate("admin", sub)}
              onTriggerScrape={handleTriggerScrape}
            />
          )}
        </main>

        {/* WORKSPACE FOOTER */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-800/50 flex items-center justify-center">
                <Plane className="w-3 h-3 text-cyan-400 transform -rotate-45" />
              </div>
              <span className="font-bold text-white tracking-tight">AeroNex Intelligence</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">National Statistical Office (NSO) · RBI MPC Framework</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Telemetry Live
              </span>
              <span>Base 2024 = 100</span>
              <span>Laspeyres & Fisher Ideal</span>
            </div>
          </div>
        </footer>
      </div>

      {/* EXPORT DATASET MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        routes={routes}
        timeSeries={timeSeries}
      />
    </div>
  );
}

export default App;
