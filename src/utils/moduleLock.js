/* Short-lived unlock tokens, kept in memory only (never in localStorage). */
const tokens = {};
export const setLockToken = (m, t) => { tokens[m] = t; };
export const clearLockToken = (m) => { delete tokens[m]; };
export const lockHeader = () => Object.entries(tokens).map(([m, t]) => `${m}=${t}`).join(',');