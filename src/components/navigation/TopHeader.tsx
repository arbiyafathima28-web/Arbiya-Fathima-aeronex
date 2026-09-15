import React from "react";
import {
  Menu,
  RefreshCw,
  Download,
  Bot,
  ChevronRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  Search,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { SectionId, SubsectionId } from "../../types/navigation";
import { getBreadcrumb } from "./navigationConfig";
import { useAuth } from "../../context/AuthContext";

interface TopHeaderProps {
  activeSection: SectionId;
  activeSubsection: SubsectionId;
  onOpenMobileSidebar: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenExport: () => void;
  onNavigate: (sectionId: SectionId, subsectionId?: SubsectionId) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeSection,
  activeSubsection,
  onOpenMobileSidebar,
  onRefresh,
  isRefreshing,
  onOpenExport,
  onNavigate,
}) => {
  const { user } = useAuth();
  const breadcrumb = getBreadcrumb(activeSection, activeSubsection);

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition shrink-0"
            title="Open Menu"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate" aria-label="Breadcrumb">
            <button
              onClick={() => onNavigate("overview")}
              className="hover:text-cyan-400 transition truncate text-slate-300"
            >
              AeroNex
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className={breadcrumb.subsectionLabel ? "text-slate-400" : "text-white font-semibold"}>
              {breadcrumb.sectionLabel}
            </span>
            {breadcrumb.subsectionLabel && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="text-white font-semibold truncate">
                  {breadcrumb.subsectionLabel}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right: Key Ticker Badges & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Key Tickers (Visible on md+) */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
            {/* AFPI */}
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-cyan-800/40 text-cyan-300 flex items-center gap-1.5 shadow-xs">
              <span className="text-[9px] uppercase font-sans tracking-wider text-slate-400">AFPI</span>
              <span className="font-bold text-white">128.4</span>
              <span className="text-emerald-400 text-[10px]">+4.2%</span>
            </div>

            {/* CPI Signal */}
            <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-amber-800/40 text-amber-300 flex items-center gap-1.5 shadow-xs">
              <span className="text-[9px] uppercase font-sans tracking-wider text-slate-400">CPI Signal</span>
              <span className="font-bold text-amber-200">+22 bps</span>
            </div>

            {/* Live Status */}
            <div className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold">LIVE</span>
            </div>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition shadow-xs"
            title="Refresh Ingestion Feed & Recompute Indices"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {/* Export Action */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold transition shadow-xs"
            title="Export Dataset"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* AI Analyst Shortcut */}
          <button
            type="button"
            onClick={() => onNavigate("ai-analyst")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-200 hover:text-white border border-purple-800/50 text-xs font-semibold transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Analyst</span>
          </button>
        </div>
      </div>
    </header>
  );
};
