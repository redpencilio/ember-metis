import SubjectRoute from './-subject';

export default class FallbackRoute extends SubjectRoute {
  constructor() {
    super(...arguments);

    this.templateName = this.env.metis.fallbackTemplate || 'fallback';
  }

  async beforeModel(transition) {
    const { path } = transition.to.params;

    this.subject =
      path === undefined ? null : `${this.env.metis.baseUrl}${path}`;

    await this.maybeRedirectToCustomRoute(transition, this.subject);
  }
}
