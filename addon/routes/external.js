import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { findRouteByType } from '../utils/class-route';
import fetchUriInfo from '../utils/fetch-uri-info';

export default class ExternalRoute extends Route {
  queryParams = {
    directedPageNumber: {
      refreshModel: true,
    },
    directedPageSize: {
      refreshModel: true,
    },
    inversePageNumber: {
      refreshModel: true,
    },
    inversePageSize: {
      refreshModel: true,
    },
    resource: {
      refreshModel: true,
    },
  };

  @service router;
  @service fastboot;
  @service intl;

  constructor() {
    super(...arguments);
    this.templateName = 'external';
  }

  async model({
    directedPageNumber,
    directedPageSize,
    inversePageNumber,
    inversePageSize,
    resource,
  }) {
    const subject = resource;
    const backend = this.fastboot.isFastBoot ? window.BACKEND_URL : '/';

    const response = await RSVP.hash({
      directed: await fetchUriInfo(
        backend,
        subject,
        directedPageNumber,
        directedPageSize
      ),
      inverse: await fetchUriInfo(
        backend,
        subject,
        inversePageNumber,
        inversePageSize,
        'inverse'
      ),
    });

    return {
      directed: response.directed,
      inverse: response.inverse,
    };
  }

  afterModel(model) {
    // TODO it would be better to detect whether a redirection to a custom route/template is required
    // in the beforeModel hook.
    // If uri-info service provides an endpoint to get the rdf:Class of a given resource,
    // that request could be executed in the beforeModel-hook and a transition (if needed) can be triggered
    // before the model is loaded
    const customRoute = findRouteByType(model.directed.triples);
    if (customRoute) {
      this.router.replaceWith(customRoute, {
        queryParams: { resource: model.directed.subject },
      });
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isLoadingDirected = false;
    controller.isLoadingInverse = false;
  }
}
