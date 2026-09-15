import React from "react";
import {
  TrendingUp,
  Radio,
  MapPin,
  SplitSquareVertical,
  Scale,
  SlidersHorizontal,
  BrainCircuit,
  Image as ImageIcon,
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  anomaliesCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  anomaliesCount,
}) => {
  const tabs = [
    {
      id: "overview",
      label: "Executive CPI Nowcast",
      icon: TrendingUp,
      badge: null,
    },
    {
      id: "radar",
      label: "Scraper Radar & Ingestion",
      icon: Radio,
      badge: "8 Active",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-800/50",
    },
    {
      id: "routes",
      label: "India Route Map & Sectors",
      icon: MapPin,
      badge: "Interactive Map",
      badgeColor: "bg-cyan-950 text-cyan-400 border-cyan-800/50",
    },
    {
      id: "otas",
      label: "Direct vs OTA Margins",
      icon: SplitSquareVertical,
      badge: "Fee Audit",
      badgeColor: "bg-amber-950 text-amber-400 border-amber-800/50",
    },
    {
      id: "methodology",
      label: "Index Methodology",
      icon: Scale,
      badge: "Laspeyres / Fisher",
      badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
    },
    {
      id: "simulator",
      label: "Policy & ATF Simulator",
      icon: SlidersHorizontal,
      badge: "What-If",
      badgeColor: "bg-indigo-950 text-indigo-400 border-indigo-800/50",
    },
    {
      id: "analyst",
      label: "AI Inflation Analyst",
      icon: BrainCircuit,
      badge: "Gemini",
      badgeColor: "bg-cyan-950 text-cyan-400 border-cyan-800/50",
    },
    {
      id: "infographics",
      label: "Visual Briefing Studio",
      icon: ImageIcon,
      badge: "Image AI",
      badgeColor: "bg-fuchsia-950 text-fuchsia-400 border-fuchsia-800/50",
    },
  ];

  return (
    <nav className="bg-slate-900/60 border-b border-slate-800/80 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/70 shadow-sm shadow-cyan-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium hidden sm:inline ${
                    tab.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
