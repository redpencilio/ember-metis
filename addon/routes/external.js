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

  beforeModel() {
    const {
      resource,
      directedPageNumber,
      directedPageSize,
      inversePageNumber,
      inversePageSize,
      facet,
    } = this.paramsFor('external');
    const path = localBasePath(resource, this.env.metis.baseUrl);

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
    }
  }

  async model({
    directedPageNumber,
    directedPageSize,
    inversePageNumber,
    inversePageSize,
    resource,
    facet,
  }) {
    const subjectPage = await this.fetchSubject(
      resource,
      directedPageNumber,
      directedPageSize,
      inversePageNumber,
      inversePageSize,
    );

    return {
      ...subjectPage,
      facet,
    };
  }
}
