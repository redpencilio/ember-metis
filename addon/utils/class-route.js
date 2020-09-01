

import config from 'ember-get-config';
const { metis } = config;


function genClassRoute(basePath, self) {

  return function(name, options){
    let route;
    if( basePath ) {
      route = basePath + "." + name;
    } else {
      route = name;
    }

    const resourceClass = options.class;
    metis.routes[resourceClass] = route;

    return this.route(name, options);
  }.bind(self);
}

function classRoute(route, name, options) {
  // Calculate target route
  let routeString;
  if( route.parent !== "application" ) {
    routeString = `${route.parent}.${name}`;
  } else {
    routeString = name;
  }

  // Register class route combination
  const resourceClass = options.class;
  metis.routes[resourceClass] = routeString;

  // Create new route
  return route.route(name, options);
}

export { genClassRoute, classRoute }

