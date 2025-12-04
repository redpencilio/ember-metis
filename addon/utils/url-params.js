/**
 * Create URL search params string with FastBoot compatibility fallback
 * @param {Object} params - Object with key-value pairs for URL parameters
 * @returns {string} - URL encoded query string
 */
export function createUrlParams(params) {
  if (typeof URLSearchParams !== 'undefined') {
    return new URLSearchParams(params).toString();
  } else {
    // Manual query string construction for FastBoot environments without URLSearchParams global
    const queryParts = [];
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
        );
      }
    }
    return queryParts.join('&');
  }
}
