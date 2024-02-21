import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';
import { classRoute, fallbackRoute } from 'ember-metis';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('view', function () {
    classRoute(this, 'person', {
      class: 'http://www.w3.org/ns/person#Person',
    });
  });

  fallbackRoute(this);
});
