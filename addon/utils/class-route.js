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
