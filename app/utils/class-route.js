import env from '../config/environment';

export default function genClassRoute(route, name, options) {
  // Calculate target route
  let routeString;
  if( route.parent !== "application" ) {
    routeString = `${route.parent}.{name}`;
  } else {
    routeString = name;
  }

  // Register class route combination
  const resourceClass = options.class;
  env.metis.routes[resourceClass] = routeString;

  // Create new route
  return route.route(name, options);
}
