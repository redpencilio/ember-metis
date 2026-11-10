import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';
import { findRouteByType } from '../utils/class-route';
import fetchUriInfo from '../utils/fetch-uri-info';
import { getOwner } from '../utils/compat/get-owner';

export const TYPE_PREDICATE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

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
   * Helper deciding whether navigation should be redirected to a custom route
   * instead of the default subject page.
   *
   * Resolves to `true` when a redirect was performed, `false` otherwise.
   */
  async maybeRedirectToCustomRoute(transition, subject) {
    const { facet } = transition.to.queryParams;
    // The 'triples' facet forces the default view, no custom redirection is done.
    if (facet === 'triples') return false;

    if (subject) {
      const { triples } = await fetchUriInfo(
        this.fastboot,
        subject,
        0,
        50,
        'direct',
        TYPE_PREDICATE,
      );
      const customRoute = findRouteByType(triples);
      if (customRoute) {
        this.router.replaceWith(customRoute, {
          queryParams: { resource: subject, facet },
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Fetch the directed and inverse relations for the subject determined in
   * `beforeModel`, exposed as `this.subject`.
   */
  async model({
    directedPageNumber,
    directedPageSize,
    inversePageNumber,
    inversePageSize,
    facet,
  }) {
    const response = await RSVP.hash({
      directed: await fetchUriInfo(
        this.fastboot,
        this.subject,
        directedPageNumber,
        directedPageSize,
      ),
      inverse: await fetchUriInfo(
        this.fastboot,
        this.subject,
        inversePageNumber,
        inversePageSize,
        'inverse',
      ),
    });

    return {
      directed: response.directed,
      inverse: response.inverse,
      facet,
    };
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isLoadingDirected = false;
    controller.isLoadingInverse = false;
  }
}
