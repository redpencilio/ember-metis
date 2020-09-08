import Route from '@ember/routing/route';
import fetch from 'fetch';
import env from '../config/environment';
import BuildUrl from 'build-url';

export default class FallbackRoute extends Route {

  async model( { path } ) {
    const prefix = env.metis.baseUrl;
    const subject = `${prefix}${path}`;
      
    const requestUrl = BuildUrl(`${window.BACKEND_URL || "/"}`, {
      path: 'uri-info',
      queryParams:{
        subject: subject
      }
    });

    const response = await fetch( requestUrl );
    const jsonResponse = await response.json();

    return { triples: jsonResponse, subject: subject };
  }

  afterModel( model ) {
    super.afterModel(...arguments);

    const types = this.findTypes(model);

    for( let type of types )
      if( env.metis.routes[type] ) {
        this.replaceWith( env.metis.routes[type], { queryParams: { resource: model.subject } } );
        return;
      }
  }

  findTypes( model ) {
    return model
      .triples
      .directed
      .filter( ({predicate}) => predicate == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" )
      .map( ({object: { value } }) => value );
  }
}
