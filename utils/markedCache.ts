// utils/markedCache.ts
type CacheKey = string;
const cache = new Map<CacheKey, boolean>();

export const getMarkedCache = (
  adId: string,
  adType: string,
  userId: string,
): boolean | undefined => {
  const key = `${adId}_${adType}_${userId}`;
  return cache.get(key);
};

export const setMarkedCache = (
  adId: string,
  adType: string,
  userId: string,
  value: boolean,
): void => {
  const key = `${adId}_${adType}_${userId}`;
  cache.set(key, value);
};

export const clearMarkedCache = (): void => {
  cache.clear();
};
