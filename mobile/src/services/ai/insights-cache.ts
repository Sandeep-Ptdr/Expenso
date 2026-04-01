import type { MonthlyInsightsResponse } from "@/types/transaction";

const CACHE_DURATION_MS = 10 * 60 * 1000;

type CachedInsight = {
  data: MonthlyInsightsResponse["data"];
  storedAt: number;
};

const insightCache = new Map<string, CachedInsight>();

export const getCachedMonthlyInsight = (cacheKey: string) => {
  const cachedInsight = insightCache.get(cacheKey);

  if (!cachedInsight) {
    return null;
  }

  if (Date.now() - cachedInsight.storedAt > CACHE_DURATION_MS) {
    insightCache.delete(cacheKey);
    return null;
  }

  return cachedInsight.data;
};

export const setCachedMonthlyInsight = (
  cacheKey: string,
  data: MonthlyInsightsResponse["data"]
) => {
  insightCache.set(cacheKey, {
    data,
    storedAt: Date.now(),
  });
};
