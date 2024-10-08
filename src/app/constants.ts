export const CACHE_S_MAXAGE = 60;
export const CACHE_STALE_WHILE_REVALIDATE = CACHE_S_MAXAGE * 5;
export const CACHE_CONTROL = `public, max-age=0, s-maxage=${CACHE_S_MAXAGE}, stale-while-revalidate=${CACHE_STALE_WHILE_REVALIDATE}`
export const REFRESH_INTERVAL_SECONDS = Math.ceil(CACHE_S_MAXAGE / 2);
