import env from '../config/environment';

export default function genClassRoute(basePath, self) {
  return function(name, options){
    let route;
    if( basePath ) {
      route = basePath + "." + name;
    } else {
      route = name;
    }

    const resourceClass = options.class;
    env.metis.routes[resourceClass] = route;

    return this.route(name, options);
  }.bind(self);
}
