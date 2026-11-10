import SubjectRoute, { paginationQueryParams } from './-subject';
import localBasePath from '../utils/local-base-path';

export default class ExternalRoute extends SubjectRoute {
  queryParams = {
    ...paginationQueryParams,
    resource: {
      refreshModel: true,
    },
  };

  constructor() {
    super(...arguments);

    this.templateName = this.env.metis.externalTemplate || 'external';
  }

  async beforeModel(transition) {
    const {
      resource,
      directedPageNumber,
      directedPageSize,
      inversePageNumber,
      inversePageSize,
      facet,
    } = this.paramsFor('external');
    const path = localBasePath(resource, this.env.metis.baseUrl);

    // Resources within the baseUrl are handled by the fallback route,
    // which will itself decide whether to redirect to a custom route.
    if (path !== null) {
      this.router.replaceWith('fallback', path, {
        queryParams: {
          directedPageNumber,
          directedPageSize,
          inversePageNumber,
          inversePageSize,
          facet,
        },
      });
      return;
    }

    this.subject = resource;

    // Check for a custom route only when the resource is a true external URI.
    await this.maybeRedirectToCustomRoute(transition, this.subject);
  }
}
