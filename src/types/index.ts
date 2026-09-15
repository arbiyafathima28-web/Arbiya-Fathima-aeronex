export type RouteCategory = "Metro-Metro" | "Metro-NonMetro" | "Regional UDAN" | "Tourist & Leisure";

export type AirlineCode = "6E" | "AI" | "QP" | "SG";

export interface RouteData {
  id: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  category: RouteCategory;
  dgcaWeight: number; // e.g. 0.082 (8.2% of national domestic traffic)
  basePrice2024: number; // ₹ base year
  currentMedianPrice: number; // ₹ current scraped median
  minPrice: number;
  maxPrice: number;
  momChange: number; // %
  yoyChange: number; // %
  volatilityScore: number; // 0-100
  advanceCurve: {
    t0: number; // Same day (0-24h)
    t3: number; // 3 days
    t7: number; // 7 days
    t14: number; // 14 days
    t30: number; // 30 days
    t60: number; // 60 days
  };
  carrierShare: {
    airline: string;
    code: AirlineCode;
    sharePercent: number;
    avgPrice: number;
  }[];
  otaComparison: {
    directAirline: number;
    makeMyTrip: number;
    easeMyTrip: number;
    cleartrip: number;
    yatra: number;
  };
}

export interface ScraperWorkerInfo {
  id: string;
  name: string;
  type: "Airline Direct" | "OTA Aggregator";
  status: "idle" | "scraping" | "rate_limited" | "healthy";
  lastScraped: string;
  recordsToday: number;
  avgLatencyMs: number;
  successRate: number;
  captchaBypass: string;
  ipRotation: string;
}

export interface LiveScrapeItem {
  id: string;
  timestamp: string;
  source: string;
  route: string;
  flightNo: string;
  fare: number;
  advanceDays: number;
  dynamicMultiplier: number;
  taxAmount?: number;
  convenienceFee: number;
}

export interface IndexTimeSeriesPoint {
  date: string;
  laspeyres: number; // Base 2024 = 100
  fisher: number;
  paasche: number;
  jevons: number;
  cpiTransportOfficial: number; // MoSPI official index
  nowcastAugmentedCpi: number; // AeroNex augmented CPI
  atfPricePerKl: number; // ₹ per kilolitre
  eventAnnotation?: string;
}

export interface SimulationParams {
  atfPriceChangePercent: number; // -30% to +40%
  fareCapPolicy: "none" | "moderate" | "strict";
  seasonalSurgeMultiplier: number; // 1.0 to 2.5
  capacityGroundingPercent: number; // 0% to 25%
}

export interface CarrierFareQuote {
  carrier: string;
  carrierCode: string;
  fare: number;
  deltaPercent: number;
  loadFactorEstimatePercent: number;
  flightNumber: string;
}

export interface AnomalyAlert {
  id: string;
  severity: "high" | "medium" | "info";
  route: string;
  routeId?: string;
  originIata?: string;
  originName?: string;
  destinationIata?: string;
  destinationName?: string;
  corridorType?: "Metro-Metro Trunk" | "Metro-NonMetro" | "Tourist & Leisure" | "Regional UDAN";
  dgcaWeightPercent?: number;
  flightDistanceKm?: number;
  title: string;
  description: string;
  detectedAt: string; // Relative time, e.g. "24 mins ago"
  timestamp: string; // Precise ISO/IST timestamp, e.g. "2026-09-14 18:25:12 IST"
  confidenceScore: number; // e.g. 0.968 for 96.8% confidence
  zScore?: number; // e.g. 3.84 standard deviations
  isolationForestScore?: number; // e.g. -0.428
  detectionAlgorithm?: string; // e.g. "Ensemble: Robust Sliding Z-Score (14d) + Isolation Forest"
  ingestionBatchId?: string; // e.g. "BATCH-20260914-1820-T3"
  observedFare?: number; // e.g. 6250
  baselineFare?: number; // e.g. 2550
  medianHistoricalFare?: number; // e.g. 2780
  surgeMultiplier: number; // e.g. 2.45
  bookingWindowDays?: number; // e.g. 3 for T-3
  suspectedCause: string;
  carrierQuotes?: CarrierFareQuote[];
  regulatoryRule?: string; // e.g. "Rule 135 of Aircraft Rules 1937"
  regulatoryStatus?: "Audit Recommended" | "Regulatory Inquiry" | "Active Monitoring";
  remedialAction?: string;
}
