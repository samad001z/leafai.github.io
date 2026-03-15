const normalize = (value) => (typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '');
const isLocalHost = (host) => host === 'localhost' || host === '127.0.0.1';
const isLocalApiUrl = (url) => /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url || '');

const legacyBase = normalize(process.env.REACT_APP_API_URL);
const apiOrigin = normalize(process.env.REACT_APP_API_ORIGIN);
const productionFallbackOrigin = 'https://leafai-backend.onrender.com';

const hostIsLocal =
	typeof window !== 'undefined' && window.location
		? isLocalHost(window.location.hostname)
		: false;

// Guard against accidental production builds that still carry localhost API values.
const safeLegacyBase = !hostIsLocal && isLocalApiUrl(legacyBase) ? '' : legacyBase;
const resolvedOrigin = apiOrigin || (!hostIsLocal ? productionFallbackOrigin : '');

export const API_BASE_URL = safeLegacyBase || (resolvedOrigin ? `${resolvedOrigin}/api` : '/api');
