/**
 * Get the path of a subject URI relative to the configured `metis.baseUrl`.
 */
export default function localBasePath(uri, baseUrl) {
  if (uri && baseUrl) {
    const parsedUri = parseUri(uri);
    const parsedBase = parseUri(baseUrl);

    if (parsedUri && parsedBase) {
      const sameOrigin =
        parsedUri.protocol === parsedBase.protocol &&
        parsedUri.host.toLowerCase() === parsedBase.host.toLowerCase();

      if (sameOrigin) {
        const basePath = parsedBase.pathname.replace(/\/$/, '');

        if (parsedUri.pathname.toLowerCase() === basePath.toLowerCase()) {
          return '';
        } else if (
          parsedUri.pathname
            .toLowerCase()
            .startsWith(`${basePath.toLowerCase()}/`)
        ) {
          return parsedUri.pathname.slice(basePath.length + 1);
        }
      }
    }
  }

  return null;
}

function parseUri(uri) {
  try {
    return new URL(uri);
  } catch {
    return null;
  }
}
