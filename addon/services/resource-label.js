import Service, { inject } from '@ember/service';
import buildUrl from 'build-url';
import fetch from 'fetch';

export default class ResourceLabelService extends Service {
  @inject fastboot;

  constructor() {
    super(...arguments);
    this.cache = {};
    this.backend = this.fastboot.isFastBoot ? window.BACKEND_URL : '/';
  }

  async fetchPrefLabel(uri) {
    if (!this.cache[uri]) {
      const fetchUrl = buildUrl(this.backend, {
        path: 'resource-labels/info',
        queryParams: {
          term: uri,
        },
      });

      const response = await fetch(fetchUrl);
      const body = await response.json();

      if (response.status == 200 && body.data && body.data.attributes) {
        this.cache[uri] = {
          prefLabel: body.data.attributes.label,
          description: body.data.attributes.comment,
        };
      } else {
        this.cache[uri] = {
          prefLabel: null,
          description: null,
        };
      }
    }

    return this.cache[uri];
  }
}
