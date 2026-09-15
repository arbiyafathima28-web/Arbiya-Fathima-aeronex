import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  PlaneTakeoff,
  Layers,
  Database,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
import { SectionId, SubsectionId } from "../../types/navigation";
import { NAVIGATION_SECTIONS } from "./navigationConfig";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  activeSection: SectionId;
  activeSubsection: SubsectionId;
  onNavigate: (sectionId: SectionId, subsectionId?: SubsectionId) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  activeSubsection,
  onNavigate,
  mobileOpen,
  onMobileClose,
}) => {
  const { user, dbConnected, signIn, signOut } = useAuth();

  // Keep track of which accordion sections are expanded
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "live-data": true,
    "airfare-index": true,
    "cpi-augmentation": false,
    "methodology": false,
    "policy-simulator": false,
    "briefing-studio": false,
    admin: false,
  });

  // Ensure currently active section is always expanded
  useEffect(() => {
    if (activeSection && activeSection !== "overview" && activeSection !== "ai-analyst") {
      setExpandedSections((prev) => ({
        ...prev,
        [activeSection]: true,
      }));
    }
  }, [activeSection]);

  const toggleSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSectionClick = (sectionId: SectionId, defaultSubsection?: SubsectionId) => {
    // If section has subsections, expand it and go to the first subsection or default
    if (defaultSubsection) {
      setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
      onNavigate(sectionId, defaultSubsection);
    } else {
      onNavigate(sectionId, "overview");
    }
    if (window.innerWidth < 1024) {
      onMobileClose();
    }
  };

  const handleSubsectionClick = (sectionId: SectionId, subsectionId: SubsectionId, e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate(sectionId, subsectionId);
    if (window.innerWidth < 1024) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 lg:w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:shrink-0 select-none shadow-2xl lg:shadow-none`}
      >
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-cyan-950/50 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <PlaneTakeoff className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-base text-white font-mono">
                    AERONEX
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                    IN
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400 leading-tight">
                  Real-Time Airfare Intelligence
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MoSPI · DGCA Feed</span>
            </span>
            <span className="font-mono text-cyan-400/90 font-semibold">AFPI 128.4</span>
          </div>
        </div>

        {/* Scrollable Navigation Tree */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-sm scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {NAVIGATION_SECTIONS.map((section) => {
            const Icon = section.icon;
            const hasSubsections = section.subsections && section.subsections.length > 0;
            const isSectionActive = activeSection === section.id;
            const isExpanded = expandedSections[section.id] ?? false;

            return (
              <div key={section.id} className="space-y-0.5">
                {/* Main Section Navigation Row */}
                <div
                  className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isSectionActive
                      ? "bg-slate-900 text-white border border-slate-800 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleSectionClick(
                        section.id,
                        hasSubsections ? section.subsections![0].id : undefined
                      )
                    }
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left py-0.5 cursor-pointer"
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isSectionActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                      }`}
                    />
                    <span className="truncate">{section.label}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {section.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                          section.badgeColor || "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {section.badge}
                      </span>
                    )}

                    {hasSubsections && (
                      <button
                        type="button"
                        onClick={(e) => toggleSection(section.id, e)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                        title={isExpanded ? "Collapse" : "Expand"}
                        aria-label={isExpanded ? `Collapse ${section.label}` : `Expand ${section.label}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Subsections List */}
                {hasSubsections && isExpanded && (
                  <div className="ml-3 pl-3 my-0.5 space-y-0.5 border-l border-slate-800/80">
                    {section.subsections!.map((sub) => {
                      const isSubActive = isSectionActive && activeSubsection === sub.id;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={(e) => handleSubsectionClick(section.id, sub.id, e)}
                          className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                            isSubActive
                              ? "bg-cyan-950/50 text-cyan-300 font-semibold border border-cyan-800/40 shadow-xs"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                          }`}
                        >
                          <span className="truncate">{sub.label}</span>
                          {sub.badge && (
                            <span
                              className={`text-[9px] font-mono px-1 py-0.2 rounded shrink-0 ml-1.5 ${
                                isSubActive
                                  ? "bg-cyan-900 text-cyan-200 border border-cyan-700/50"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer / System Status & User Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 shrink-0 space-y-2 text-xs">
          {/* Status Indicators */}
          <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Ingestion Pipeline</span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/60 text-[10px] font-mono">
              <div className="flex items-center gap-1 text-slate-400">
                <Cloud className={`w-3 h-3 ${dbConnected ? "text-cyan-400" : "text-amber-400"}`} />
                <span>Firestore</span>
                <span className={dbConnected ? "text-emerald-400 ml-auto" : "text-amber-400 ml-auto"}>
                  {dbConnected ? "OK" : "SYNC"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>Postgres</span>
                <span className="text-emerald-400 ml-auto">LIVE</span>
              </div>
            </div>
          </div>

          {/* User Auth or Sign-in */}
          {user ? (
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "User")}&background=0284c7&color=fff`}
                  alt=""
                  className="w-6 h-6 rounded-full border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-200 truncate">
                    {user.displayName || "Analyst Session"}
                  </p>
                  <p className="text-[9px] text-slate-400 truncate">{user.email || "Authenticated"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Analyst Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
