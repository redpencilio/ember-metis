import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';
import metisFallbackRoute from 'metis/utils/fallback-route';
import classRoute from 'metis/utils/class-route';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route("view", function() {
    classRoute(this, 'person', {
      class: 'http://www.w3.org/ns/person#Person'
    });
  });

  metisFallbackRoute(this);
});
