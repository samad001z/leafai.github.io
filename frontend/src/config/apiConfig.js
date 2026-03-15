const normalize = (value) => (typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '');

const legacyBase = normalize(process.env.REACT_APP_API_URL);
const apiOrigin = normalize(process.env.REACT_APP_API_ORIGIN);

export const API_BASE_URL = legacyBase || (apiOrigin ? `${apiOrigin}/api` : '/api');
