import config from 'ember-get-config';

export default function genClassRoute(basePath, self) {
  const { metis } = config;
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
