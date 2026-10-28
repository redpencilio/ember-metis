import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';
import { findRouteByType } from '../utils/class-route';
import fetchUriInfo from '../utils/fetch-uri-info';
import { getOwner } from '../utils/compat/get-owner';

export const paginationQueryParams = {
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
  facet: {
    refreshModel: true,
  },
};

export default class SubjectRoute extends Route {
  queryParams = paginationQueryParams;

  @service router;

  constructor() {
    super(...arguments);
    this.env = getOwner(this).resolveRegistration('config:environment');
  }

  /**
   * We are not sure the `fastboot` service is available in the host app,
   * as using fastboot with this addon is optional.
   * Instead of injecting the service through the `@service` decorator (which always expects the service to be present, else will throw an error),
   * we lookup the service dynamically in a getter.
   */
  get fastboot() {
    return getOwner(this).lookup('service:fastboot');
  }

  /**
   * Fetch the directed and inverse relations for the given subject.
   */
  async fetchSubject(
    subject,
    directedPageNumber,
    directedPageSize,
    inversePageNumber,
    inversePageSize,
  ) {
    const response = await RSVP.hash({
      directed: await fetchUriInfo(
        this.fastboot,
        subject,
        directedPageNumber,
        directedPageSize,
      ),
      inverse: await fetchUriInfo(
        this.fastboot,
        subject,
        inversePageNumber,
        inversePageSize,
        'inverse',
      ),
    });

    return {
      directed: response.directed,
      inverse: response.inverse,
    };
  }

  afterModel(model) {
    // For now there is only one possible value of 'facet', 'triples', which corresponds to showing
    // the default view. Anything else is redirected to the single custom route.
    if (model.facet !== 'triples') {
      // TODO it would be better to detect whether a redirection to a custom route/template is required
      // in the beforeModel hook.
      // If uri-info service provides an endpoint to get the rdf:Class of a given resource,
      // that request could be executed in the beforeModel-hook and a transition (if needed) can be triggered
      // before the model is loaded
      const customRoute = findRouteByType(model.directed.triples);
      if (customRoute) {
        this.router.replaceWith(customRoute, {
          queryParams: { resource: model.directed.subject, facet: model.facet },
        });
      }
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isLoadingDirected = false;
    controller.isLoadingInverse = false;
  }
}
