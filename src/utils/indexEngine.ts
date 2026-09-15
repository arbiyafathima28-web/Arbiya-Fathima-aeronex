import { RouteData, SimulationParams } from "../types";

/**
 * Calculates Laspeyres Price Index (Base Period Weighted):
 * I_L = (sum(p_t * q_0) / sum(p_0 * q_0)) * 100
 */
export function calculateLaspeyres(routes: RouteData[]): number {
  let numerator = 0;
  let denominator = 0;

  routes.forEach((r) => {
    // q_0 is proxied by DGCA route weight
    numerator += r.currentMedianPrice * r.dgcaWeight;
    denominator += r.basePrice2024 * r.dgcaWeight;
  });

  return denominator > 0 ? (numerator / denominator) * 100 : 100;
}

/**
 * Calculates Paasche Price Index (Current Period Weighted)
 */
export function calculatePaasche(routes: RouteData[]): number {
  let numerator = 0;
  let denominator = 0;

  routes.forEach((r) => {
    // Simulate current quantity shift: higher prices slightly lower elasticity
    const currentWeight = r.dgcaWeight * (1 - (r.currentMedianPrice - r.basePrice2024) / 50000);
    numerator += r.currentMedianPrice * currentWeight;
    denominator += r.basePrice2024 * currentWeight;
  });

  return denominator > 0 ? (numerator / denominator) * 100 : 100;
}

/**
 * Calculates Fisher Ideal Index:
 * I_F = sqrt(I_L * I_P)
 * This is the gold standard geometric average endorsed by IMF, RBI, and MoSPI for reducing substitution bias.
 */
export function calculateFisher(routes: RouteData[]): number {
  const laspeyres = calculateLaspeyres(routes);
  const paasche = calculatePaasche(routes);
  return Math.sqrt(laspeyres * paasche);
}

/**
 * Calculates Jevons Geometric Mean Index (unweighted or log-weighted)
 */
export function calculateJevons(routes: RouteData[]): number {
  let logSum = 0;
  let totalWeight = 0;

  routes.forEach((r) => {
    if (r.basePrice2024 > 0 && r.currentMedianPrice > 0) {
      logSum += r.dgcaWeight * Math.log(r.currentMedianPrice / r.basePrice2024);
      totalWeight += r.dgcaWeight;
    }
  });

  const avgLog = totalWeight > 0 ? logSum / totalWeight : 0;
  return Math.exp(avgLog) * 100;
}

/**
 * Computes the Augmented CPI Transmission Delta:
 * In India's Consumer Price Index (Base 2012=100), Transport & Communication has ~8.59% weight.
 * Passenger Air Transport has an estimated effective basket weight of ~0.84% (84 basis points).
 */
export function calculateAugmentedCpiImpact(afpiCurrent: number, afpiBase: number = 100): {
  headlineImpactBps: number;
  transportGroupDelta: number;
  officialLagDays: number;
} {
  const airfareGrowthPercent = ((afpiCurrent - afpiBase) / afpiBase) * 100;
  const airBasketWeight = 0.0084; // 0.84%
  const headlineImpactBps = Math.round(airfareGrowthPercent * airBasketWeight * 100); // in basis points
  const transportGroupDelta = +(airfareGrowthPercent * 0.098).toFixed(2); // transport sub-index impact

  return {
    headlineImpactBps,
    transportGroupDelta,
    officialLagDays: 12, // MoSPI releases monthly data with ~12 days lag
  };
}

/**
 * Policy & ATF Shock Simulator:
 * Given fuel adjustments, fare band caps, and capacity shortages,
 * recalculate projected route prices and macroeconomic index impact.
 */
export function simulatePolicyScenario(
  routes: RouteData[],
  params: SimulationParams
): {
  simulatedRoutes: RouteData[];
  projectedLaspeyres: number;
  projectedFisher: number;
  cpiHeadlineBpsShift: number;
  consumerSurplusDeltaCrores: number;
} {
  // Fuel (ATF) accounts for ~40-42% of Indian airline operational costs (CASK)
  const atfCostShare = 0.41;
  const atfPriceElasticity = (params.atfPriceChangePercent / 100) * atfCostShare;

  // Capacity grounding reduces seat supply -> dynamic pricing multiplier rises
  const capacitySurge = (params.capacityGroundingPercent / 100) * 0.85;

  const simulatedRoutes = routes.map((r) => {
    let price = r.currentMedianPrice;

    // Apply fuel shock
    price = price * (1 + atfPriceElasticity);

    // Apply capacity shock
    price = price * (1 + capacitySurge);

    // Apply seasonal multiplier
    price = price * params.seasonalSurgeMultiplier;

    // Apply MoCA regulatory fare cap if enabled
    if (params.fareCapPolicy === "moderate") {
      const cap = r.basePrice2024 * 1.5; // Max 50% above base
      if (price > cap) price = cap;
    } else if (params.fareCapPolicy === "strict") {
      const cap = r.basePrice2024 * 1.25; // Max 25% above base
      if (price > cap) price = cap;
    }

    return {
      ...r,
      currentMedianPrice: Math.round(price),
    };
  });

  const baseLaspeyres = calculateLaspeyres(routes);
  const projectedLaspeyres = calculateLaspeyres(simulatedRoutes);
  const projectedFisher = calculateFisher(simulatedRoutes);

  const deltaIndex = projectedLaspeyres - baseLaspeyres;
  const cpiHeadlineBpsShift = Math.round(deltaIndex * 0.0084 * 100);

  // Annual Indian domestic air travelers ~15.5 Crore passengers
  const avgFareShift = simulatedRoutes.reduce((acc, r) => acc + (r.currentMedianPrice - routes.find(orig => orig.id === r.id)!.currentMedianPrice) * r.dgcaWeight, 0);
  const annualPax = 155000000;
  const consumerSurplusDeltaCrores = Math.round((avgFareShift * annualPax) / 10000000);

  return {
    simulatedRoutes,
    projectedLaspeyres: +projectedLaspeyres.toFixed(1),
    projectedFisher: +projectedFisher.toFixed(1),
    cpiHeadlineBpsShift,
    consumerSurplusDeltaCrores,
  };
}
