import Service from '@ember/service';
import fetch, { Headers } from 'fetch';
import { getOwner } from '../utils/compat/get-owner';
const SHOEBOX_KEY = 'resource-label-cache';
export default class ResourceLabelService extends Service {
  backend = '/';
  cache = {};

  constructor() {
    super(...arguments);

    if (this.fastboot?.isFastBoot) {
      this.backend = (typeof window !== 'undefined' ? window.BACKEND_URL : null) || '/';
    } else {
      this.cache = this.fastboot?.shoebox.retrieve(SHOEBOX_KEY) || {};
    }
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

  async fetchPrefLabel(uri) {
    const promise = this._fetchPrefLabel(uri);
    if (this.fastboot?.isFastBoot) {
      this.fastboot.deferRendering(promise);
    }

    return await promise;
  }

  async _fetchPrefLabel(uri) {
    if (!this.cache[uri]) {
      const baseUrl = (this.backend && this.backend.endsWith('/')) ? this.backend.slice(0, -1) : (this.backend || '/');

      // Fallback for URLSearchParams in FastBoot environment
      let params;
      if (typeof URLSearchParams !== 'undefined') {
        params = new URLSearchParams({ term: uri });
      } else {
        // Manual query string construction for FastBoot
        params = `term=${encodeURIComponent(uri)}`;
      }

      const fetchUrl = `${baseUrl}/resource-labels/info?${params}`;

      const response = await fetch(fetchUrl, {
        headers: new Headers({ accept: 'application/vnd.api+json' }),
      });
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

      if (this.fastboot?.isFastBoot) {
        this.fastboot.shoebox.put(SHOEBOX_KEY, this.cache);
      }
    }

    return this.cache[uri];
  }
}
