export type SectionId =
  | "overview"
  | "live-data"
  | "airfare-index"
  | "cpi-augmentation"
  | "methodology"
  | "policy-simulator"
  | "ai-analyst"
  | "briefing-studio"
  | "admin";

export type LiveDataSubsection =
  | "route-explorer"
  | "india-map"
  | "advance-booking"
  | "fare-composition"
  | "ota-comparison";

export type AirfareIndexSubsection =
  | "national-afpi"
  | "route-index"
  | "airline-index"
  | "contributions";

export type CpiAugmentationSubsection =
  | "cpi-impact"
  | "nowcast"
  | "inflation-decomposition"
  | "official-vs-aeronex";

export type MethodologySubsection =
  | "basket-construction"
  | "weighting"
  | "index-formula"
  | "robustness-checks"
  | "validation";

export type PolicySimulatorSubsection =
  | "atf-shock"
  | "demand-shock"
  | "capacity-shock"
  | "fare-cap"
  | "scenario-comparison";

export type BriefingStudioSubsection =
  | "generate-brief"
  | "saved-briefings"
  | "generate-visual"
  | "export";

export type AdminSubsection =
  | "data-quality"
  | "collection-health"
  | "scraper-health"
  | "worker-health"
  | "system-status";

export type SubsectionId =
  | "overview"
  | "analyst"
  | LiveDataSubsection
  | AirfareIndexSubsection
  | CpiAugmentationSubsection
  | MethodologySubsection
  | PolicySimulatorSubsection
  | BriefingStudioSubsection
  | AdminSubsection;

export interface NavSubsection {
  id: SubsectionId;
  label: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

export interface NavSection {
  id: SectionId;
  label: string;
  iconName: string;
  badge?: string;
  badgeColor?: string;
  subsections?: NavSubsection[];
}
