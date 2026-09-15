import React from "react";
import {
  Home,
  Plane,
  BarChart3,
  TrendingUp,
  Calculator,
  SlidersHorizontal,
  Bot,
  FileText,
  Settings,
} from "lucide-react";
import { NavSection, SectionId, SubsectionId } from "../../types/navigation";

export const NAVIGATION_SECTIONS: {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  subsections?: {
    id: SubsectionId;
    label: string;
    badge?: string;
    description?: string;
  }[];
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    subsections: undefined,
  },
  {
    id: "live-data",
    label: "Live Data",
    icon: Plane,
    badge: "LIVE",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    subsections: [
      { id: "route-explorer", label: "Route Explorer", description: "Why is this route changing?" },
      { id: "india-map", label: "India Airfare Intelligence Map", badge: "Map", description: "Where in India are prices moving?" },
      { id: "advance-booking", label: "Advance Booking", description: "T-60 to T-0 dynamic surge curve" },
      { id: "fare-composition", label: "Fare Composition", description: "Base fare, fuel, airport fee, GST breakdown" },
      { id: "ota-comparison", label: "Airline / OTA Comparison", description: "Direct vs MMT, EaseMyTrip, Cleartrip audit" },
    ],
  },
  {
    id: "airfare-index",
    label: "Airfare Index",
    icon: BarChart3,
    badge: "128.4",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    subsections: [
      { id: "national-afpi", label: "National AFPI", badge: "+4.2%", description: "National headline price index (Base 2024=100)" },
      { id: "route-index", label: "Route Index", description: "Sub-indices across Trunk & Regional sectors" },
      { id: "airline-index", label: "Airline Index", description: "IndiGo, Air India, Akasa, SpiceJet yield curves" },
      { id: "contributions", label: "Contributions", description: "Sectoral & carrier weight contribution decomposition" },
    ],
  },
  {
    id: "cpi-augmentation",
    label: "CPI Augmentation",
    icon: TrendingUp,
    badge: "+22 bps",
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    subsections: [
      { id: "cpi-impact", label: "CPI Impact", description: "MoSPI Transport & Communication impulse" },
      { id: "nowcast", label: "Nowcast", badge: "T-45d", description: "High-frequency nowcast vs official release lag" },
      { id: "inflation-decomposition", label: "Inflation Decomposition", description: "Fuel, Demand, Capacity & Base factors" },
      { id: "official-vs-aeronex", label: "Official vs AeroNex", description: "Comparative statistical variance & RMSE" },
    ],
  },
  {
    id: "methodology",
    label: "Methodology",
    icon: Calculator,
    subsections: [
      { id: "basket-construction", label: "Basket Construction", description: "DGCA domestic traffic representation" },
      { id: "weighting", label: "Weighting", description: "Passenger volume & seat capacity weights" },
      { id: "index-formula", label: "Index Formula", description: "Laspeyres, Fisher, Paasche & Jevons" },
      { id: "robustness-checks", label: "Robustness Checks", description: "IQR trimming & modal fare filters" },
      { id: "validation", label: "Validation", description: "Historical cross-validation with DGCA yields" },
    ],
  },
  {
    id: "policy-simulator",
    label: "Policy Simulator",
    icon: SlidersHorizontal,
    subsections: [
      { id: "atf-shock", label: "ATF Shock", description: "Aviation Turbine Fuel price shift elasticity" },
      { id: "demand-shock", label: "Demand Shock", description: "Festive & holiday seasonal surge multiplier" },
      { id: "capacity-shock", label: "Capacity Shock", description: "Aircraft grounding & engine supply crunch" },
      { id: "fare-cap", label: "Fare Cap", description: "Regulatory price ceilings under Rule 135" },
      { id: "scenario-comparison", label: "Scenario Comparison", description: "Multi-scenario policy impact matrix" },
    ],
  },
  {
    id: "ai-analyst",
    label: "AI Inflation Analyst",
    icon: Bot,
    badge: "Gemini 2.5",
    badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    subsections: undefined,
  },
  {
    id: "briefing-studio",
    label: "Briefing Studio",
    icon: FileText,
    subsections: [
      { id: "generate-brief", label: "Generate Brief", description: "MoSPI executive briefing memo generator" },
      { id: "saved-briefings", label: "Saved Briefings", description: "Archived policy briefs and notes" },
      { id: "generate-visual", label: "Generate Visual", badge: "AI", description: "Infographics and visual studio" },
      { id: "export", label: "Export", description: "Export CSV, JSON, Excel, MoSPI exchange" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: Settings,
    badge: "99.8%",
    badgeColor: "bg-slate-700/60 text-slate-300 border border-slate-600/40",
    subsections: [
      { id: "data-quality", label: "Data Quality", description: "Outlier trimming & schema validation" },
      { id: "collection-health", label: "Collection Health", description: "Daily 142k+ quote ingestion pipeline" },
      { id: "scraper-health", label: "Scraper / Source Health", badge: "8 Active", description: "Live scraper nodes and anti-bot mesh" },
      { id: "worker-health", label: "Worker Health", description: "Distributed scraping cluster telemetry" },
      { id: "system-status", label: "System Status", description: "Firestore, Cloud SQL & API connectivity" },
    ],
  },
];

export function getBreadcrumb(sectionId: SectionId, subsectionId?: SubsectionId): { sectionLabel: string; subsectionLabel?: string } {
  const section = NAVIGATION_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return { sectionLabel: "Overview" };

  if (!subsectionId || subsectionId === "overview" || subsectionId === "analyst") {
    return { sectionLabel: section.label };
  }

  const sub = section.subsections?.find((s) => s.id === subsectionId);
  return {
    sectionLabel: section.label,
    subsectionLabel: sub ? sub.label : undefined,
  };
}

export function getDefaultSubsection(sectionId: SectionId): SubsectionId {
  switch (sectionId) {
    case "overview":
      return "overview";
    case "live-data":
      return "route-explorer";
    case "airfare-index":
      return "national-afpi";
    case "cpi-augmentation":
      return "cpi-impact";
    case "methodology":
      return "basket-construction";
    case "policy-simulator":
      return "atf-shock";
    case "ai-analyst":
      return "analyst";
    case "briefing-studio":
      return "generate-brief";
    case "admin":
      return "scraper-health";
    default:
      return "overview";
  }
}
