const routes = {};

export default function classRoute(route, name, options) {
  // Calculate target route
  let routeString;
  if (route.parent !== 'application') {
    routeString = `${route.parent}.${name}`;
  } else {
    routeString = name;
  }

  // Register custom route mapping
  defineRoute(routeString, options);

  // Create new route
  return route.route(name, options);
}

/**
 * Register class route combination
 * The register is used to redirect to custom pages based on
 * the subject's rdf:Class
 */
export function defineRoute(routeString, options) {
  const resourceClass = options.class;
  routes[resourceClass] = routeString;
}

/**
 * Get route name for a given rdf-type
 */
export function findRoute(rdfType) {
  return routes[rdfType];
}

/**
 * Get route name by rdf-type
 */
export function findRouteByType(triples) {
  const rdfTypes = triples
    .filter(
      ({ predicate }) =>
        predicate == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    )
    .map(({ object: { value } }) => value);

  for (let type of rdfTypes) {
    const customRoute = findRoute(type);
    if (customRoute) {
      return customRoute;
    }
  }

  return null;
}
