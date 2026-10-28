import SubjectRoute from './-subject';

export default class FallbackRoute extends SubjectRoute {
  constructor() {
    super(...arguments);

    this.templateName = this.env.metis.fallbackTemplate || 'fallback';
  }

  async model({
    path,
    directedPageNumber,
    directedPageSize,
    inversePageNumber,
    inversePageSize,
  }) {
    const prefix = this.env.metis.baseUrl;
    const subject = `${prefix}${path}`;

    return this.fetchSubject(
      subject,
      directedPageNumber,
      directedPageSize,
      inversePageNumber,
      inversePageSize,
    );
  }
}
