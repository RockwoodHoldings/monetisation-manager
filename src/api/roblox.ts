import type { GamePass, DeveloperProduct } from "../types";

const BASE = "/api/roblox";

// ── Helpers ──────────────────────────────────────────────────────────────

async function robloxFetch(
  apiKey: string,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "x-api-key": apiKey,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Roblox API ${res.status}: ${text}`);
  }
  return res;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Icon Cache ──────────────────────────────────────────────────────────

const ICON_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  url: string;
  expires: number;
}

const iconCache = new Map<string, CacheEntry>();

function getCachedIcon(key: string): string | undefined {
  const entry = iconCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    iconCache.delete(key);
    return undefined;
  }
  return entry.url;
}

function setCachedIcon(key: string, url: string): void {
  iconCache.set(key, { url, expires: Date.now() + ICON_CACHE_TTL });
}

function invalidateCachedIcon(key: string): void {
  iconCache.delete(key);
}

// ── Icons (Thumbnails API) ───────────────────────────────────────────────

interface ThumbnailResponse {
  data: { targetId: number; state: string; imageUrl: string }[];
}

async function fetchGamePassIcons(
  ids: string[]
): Promise<Map<string, string>> {
  const iconMap = new Map<string, string>();
  if (ids.length === 0) return iconMap;

  // Check cache first, collect uncached IDs
  const uncached: string[] = [];
  for (const id of ids) {
    const cached = getCachedIcon(`gp:${id}`);
    if (cached) {
      iconMap.set(id, cached);
    } else {
      uncached.push(id);
    }
  }
  if (uncached.length === 0) return iconMap;

  // Batch in groups of 100 (API limit)
  for (let i = 0; i < uncached.length; i += 100) {
    const batch = uncached.slice(i, i + 100);
    const params = new URLSearchParams({
      gamePassIds: batch.join(","),
      size: "150x150",
      format: "Png",
    });
    try {
      const res = await fetch(`/api/thumbnails/v1/game-passes?${params}`);
      if (res.ok) {
        const data: ThumbnailResponse = await res.json();
        for (const item of data.data) {
          if (item.state === "Completed" && item.imageUrl) {
            const id = String(item.targetId);
            iconMap.set(id, item.imageUrl);
            setCachedIcon(`gp:${id}`, item.imageUrl);
          }
        }
      }
    } catch {
      // Ignore icon fetch failures
    }
    if (i + 100 < uncached.length) await delay(250);
  }
  return iconMap;
}

async function fetchDevProductIcons(
  ids: string[],
  iconImageAssetIds: (number | undefined)[]
): Promise<Map<string, string>> {
  const iconMap = new Map<string, string>();

  // Build parallel arrays of valid (dpId, assetId) pairs, checking cache first
  const validIds: string[] = [];
  const validAssetIds: number[] = [];
  for (let i = 0; i < ids.length; i++) {
    const cached = getCachedIcon(`dp:${ids[i]}`);
    if (cached) {
      iconMap.set(ids[i], cached);
    } else if (iconImageAssetIds[i]) {
      validIds.push(ids[i]);
      validAssetIds.push(iconImageAssetIds[i]!);
    }
  }
  if (validAssetIds.length === 0) return iconMap;

  // Use the assets thumbnail endpoint (dev-products/icons is unreliable)
  for (let i = 0; i < validAssetIds.length; i += 100) {
    const batchAssetIds = validAssetIds.slice(i, i + 100);
    const batchDpIds = validIds.slice(i, i + 100);
    const params = new URLSearchParams({
      assetIds: batchAssetIds.join(","),
      size: "150x150",
      format: "Png",
    });
    try {
      const res = await fetch(`/api/thumbnails/v1/assets?${params}`);
      if (res.ok) {
        const data: ThumbnailResponse = await res.json();
        for (const item of data.data) {
          if (item.state === "Completed" && item.imageUrl) {
            const idx = batchAssetIds.indexOf(item.targetId);
            if (idx !== -1) {
              iconMap.set(batchDpIds[idx], item.imageUrl);
              setCachedIcon(`dp:${batchDpIds[idx]}`, item.imageUrl);
            }
          }
        }
      }
    } catch {
      // Ignore icon fetch failures
    }
    if (i + 100 < validAssetIds.length) await delay(250);
  }
  return iconMap;
}

// ── Universe Info ────────────────────────────────────────────────────────

interface GamesApiResponse {
  data: { id: number; name: string; rootPlaceId: number }[];
}

interface PlaceDetailsResponse {
  placeId: number;
  name: string;
}

export async function fetchUniverseInfo(
  universeId: string
): Promise<{ name: string; iconUrl: string }> {
  // Fetch universe info and icon in parallel
  const [universeResult, iconResult] = await Promise.allSettled([
    fetch(`/api/games/v1/games?universeIds=${universeId}`).then((r) =>
      r.ok ? (r.json() as Promise<GamesApiResponse>) : null
    ),
    fetch(
      `/api/thumbnails/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png`
    ).then((r) =>
      r.ok ? (r.json() as Promise<ThumbnailResponse>) : null
    ),
  ]);

  const universeData =
    universeResult.status === "fulfilled" ? universeResult.value : null;
  const iconData =
    iconResult.status === "fulfilled" ? iconResult.value : null;

  const iconUrl =
    iconData?.data?.find(
      (d) => d.state === "Completed" && d.imageUrl
    )?.imageUrl ?? "";

  // Try to get the start place name
  const rootPlaceId = universeData?.data?.[0]?.rootPlaceId;
  if (rootPlaceId) {
    try {
      const placeRes = await fetch(
        `/api/games/v1/games/multiget-place-details?placeIds=${rootPlaceId}`
      );
      if (placeRes.ok) {
        const placeData: PlaceDetailsResponse[] = await placeRes.json();
        if (placeData[0]?.name) {
          return { name: placeData[0].name, iconUrl };
        }
      }
    } catch {
      // Fall through to universe name
    }
  }

  // Fallback to universe name
  const name = universeData?.data?.[0]?.name ?? "";
  return { name, iconUrl };
}

export async function fetchUniverseIcons(
  universeIds: string[]
): Promise<Map<string, string>> {
  const iconMap = new Map<string, string>();
  if (universeIds.length === 0) return iconMap;

  const params = new URLSearchParams({
    universeIds: universeIds.join(","),
    size: "150x150",
    format: "Png",
  });
  try {
    const res = await fetch(`/api/thumbnails/v1/games/icons?${params}`);
    if (res.ok) {
      const data: ThumbnailResponse = await res.json();
      for (const item of data.data) {
        if (item.state === "Completed" && item.imageUrl) {
          iconMap.set(String(item.targetId), item.imageUrl);
        }
      }
    }
  } catch {
    // Ignore icon fetch failures
  }
  return iconMap;
}

// ── Game Passes ──────────────────────────────────────────────────────────

interface ListGamePassesResponse {
  gamePasses: RawGamePass[];
  nextPageToken?: string;
}

interface RawGamePass {
  gamePassId: number;
  productId: number;
  name: string;
  description: string;
  isForSale: boolean;
  iconImageAssetId?: number;
  priceInformation?: {
    defaultPriceInRobux?: number;
    enabledFeatures?: string[];
  };
}

function hasRegionalPricing(features?: string[]): boolean {
  return features?.includes("RegionalPricing") ?? false;
}

export async function listGamePasses(
  apiKey: string,
  universeId: string
): Promise<GamePass[]> {
  const all: GamePass[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "50" });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await robloxFetch(
      apiKey,
      `/game-passes/v1/universes/${universeId}/game-passes/creator?${params}`
    );
    const data: ListGamePassesResponse = await res.json();

    for (const gp of data.gamePasses ?? []) {
      all.push({
        id: String(gp.gamePassId),
        name: gp.name,
        description: gp.description ?? "",
        price: gp.priceInformation?.defaultPriceInRobux ?? 0,
        isForSale: gp.isForSale ?? false,
        isRegionalPricingEnabled: hasRegionalPricing(gp.priceInformation?.enabledFeatures),
        iconUrl: undefined,
      });
    }

    pageToken = data.nextPageToken;
    if (pageToken) await delay(250);
  } while (pageToken);

  // Fetch all icons in one batch call
  const iconMap = await fetchGamePassIcons(all.map((gp) => gp.id));
  for (const gp of all) {
    gp.iconUrl = iconMap.get(gp.id);
  }

  return all;
}

export async function createGamePass(
  apiKey: string,
  universeId: string,
  data: {
    name: string;
    description: string;
    price: number;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }
): Promise<{ id: string; name: string; price: number }> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("description", data.description);
  form.append("price", String(data.price));
  form.append("isForSale", "true");
  form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) {
    form.append("imageFile", data.imageFile);
  }

  const res = await robloxFetch(
    apiKey,
    `/game-passes/v1/universes/${universeId}/game-passes`,
    { method: "POST", body: form }
  );
  const body: RawGamePass = await res.json();
  return {
    id: String(body.gamePassId),
    name: body.name,
    price: body.priceInformation?.defaultPriceInRobux ?? data.price,
  };
}

export async function updateGamePass(
  apiKey: string,
  universeId: string,
  passId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    isForSale?: boolean;
    isRegionalPricingEnabled?: boolean;
    imageFile?: File | null;
  }
): Promise<void> {
  const form = new FormData();
  if (data.name !== undefined) form.append("name", data.name);
  if (data.description !== undefined) form.append("description", data.description);
  if (data.price !== undefined) form.append("price", String(data.price));
  if (data.isForSale !== undefined) form.append("isForSale", String(data.isForSale));
  if (data.isRegionalPricingEnabled !== undefined)
    form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) form.append("imageFile", data.imageFile);

  await robloxFetch(
    apiKey,
    `/game-passes/v1/universes/${universeId}/game-passes/${passId}`,
    { method: "PATCH", body: form }
  );

  if (data.imageFile) invalidateCachedIcon(`gp:${passId}`);
}

// ── Developer Products ───────────────────────────────────────────────────

interface ListDevProductsResponse {
  developerProducts: RawDevProduct[];
  nextPageToken?: string;
}

interface RawDevProduct {
  productId: number;
  name: string;
  description: string;
  isForSale: boolean;
  iconImageAssetId?: number;
  priceInformation?: {
    defaultPriceInRobux?: number;
    enabledFeatures?: string[];
  };
}

export async function listDeveloperProducts(
  apiKey: string,
  universeId: string
): Promise<DeveloperProduct[]> {
  const all: DeveloperProduct[] = [];
  const assetIds: (number | undefined)[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "50" });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await robloxFetch(
      apiKey,
      `/developer-products/v2/universes/${universeId}/developer-products/creator?${params}`
    );
    const data: ListDevProductsResponse = await res.json();

    for (const dp of data.developerProducts ?? []) {
      all.push({
        id: String(dp.productId),
        name: dp.name,
        description: dp.description ?? "",
        price: dp.priceInformation?.defaultPriceInRobux ?? 0,
        isForSale: dp.isForSale ?? false,
        isRegionalPricingEnabled: hasRegionalPricing(dp.priceInformation?.enabledFeatures),
        iconUrl: undefined,
      });
      assetIds.push(dp.iconImageAssetId);
    }

    pageToken = data.nextPageToken;
    if (pageToken) await delay(150);
  } while (pageToken);

  // Fetch icons via assets thumbnail API (dev-products/icons endpoint is unreliable)
  const iconMap = await fetchDevProductIcons(all.map((dp) => dp.id), assetIds);
  for (const dp of all) {
    dp.iconUrl = iconMap.get(dp.id);
  }

  return all;
}

export async function createDeveloperProduct(
  apiKey: string,
  universeId: string,
  data: {
    name: string;
    description: string;
    price: number;
    isRegionalPricingEnabled: boolean;
    imageFile: File | null;
  }
): Promise<{ id: string; name: string; price: number }> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("description", data.description);
  form.append("price", String(data.price));
  form.append("isForSale", "true");
  form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) {
    form.append("imageFile", data.imageFile);
  }

  const res = await robloxFetch(
    apiKey,
    `/developer-products/v2/universes/${universeId}/developer-products`,
    { method: "POST", body: form }
  );
  const body: RawDevProduct = await res.json();
  return {
    id: String(body.productId),
    name: body.name,
    price: body.priceInformation?.defaultPriceInRobux ?? data.price,
  };
}

export async function updateDeveloperProduct(
  apiKey: string,
  universeId: string,
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    isForSale?: boolean;
    isRegionalPricingEnabled?: boolean;
    imageFile?: File | null;
  }
): Promise<void> {
  const form = new FormData();
  if (data.name !== undefined) form.append("name", data.name);
  if (data.description !== undefined) form.append("description", data.description);
  if (data.price !== undefined) form.append("price", String(data.price));
  if (data.isForSale !== undefined) form.append("isForSale", String(data.isForSale));
  if (data.isRegionalPricingEnabled !== undefined)
    form.append("isRegionalPricingEnabled", String(data.isRegionalPricingEnabled));
  if (data.imageFile) form.append("imageFile", data.imageFile);

  await robloxFetch(
    apiKey,
    `/developer-products/v2/universes/${universeId}/developer-products/${productId}`,
    { method: "PATCH", body: form }
  );

  if (data.imageFile) invalidateCachedIcon(`dp:${productId}`);
}
