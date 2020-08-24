import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';
import metisFallbackRoute from 'metis/utils/fallback-route';
import GCR from './utils/gen-class-route';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('view', function() {
    const classRoute = GCR("view", this);

    classRoute('person', { class: "http://www.w3.org/ns/person#Person" } );
  });
  
  metisFallbackRoute(this);
});
