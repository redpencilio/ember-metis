import Service from '@ember/service';
import fetch, { Headers } from 'fetch';
import { getOwner } from '../utils/compat/get-owner';
import { createUrlParams } from '../utils/url-params';
const SHOEBOX_KEY = 'resource-label-cache';
export default class ResourceLabelService extends Service {
  backend = '/';
  cache = {};

  constructor() {
    super(...arguments);

    if (this.fastboot?.isFastBoot) {
      this.backend =
        (typeof window !== 'undefined' ? window.BACKEND_URL : null) || '/';
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

  async fetchPrefLabel(uri, serviceBaseUrl = '/') {
    const promise = this._fetchPrefLabel(uri, serviceBaseUrl);
    if (this.fastboot?.isFastBoot) {
      this.fastboot.deferRendering(promise);
    }

    return await promise;
  }

  async _fetchPrefLabel(uri, serviceBaseUrl = '/') {
    if (!this.cache[uri]) {
      let baseUrl = this.fastboot?.isFastBoot
        ? typeof window !== 'undefined'
          ? window.BACKEND_URL
          : serviceBaseUrl
        : serviceBaseUrl;
      baseUrl =
        baseUrl && baseUrl.endsWith('/')
          ? baseUrl.slice(0, -1)
          : `${baseUrl || serviceBaseUrl}`;

      const params = createUrlParams({ term: uri });

      const fetchUrl = `${baseUrl}/resource-labels/info?${params}`;

      const response = await fetch(fetchUrl, {
        headers: new Headers({
          accept: 'application/vnd.api+json',
          ...(this.fastboot?.isFastBoot
            ? {
                Cookie: this.fastboot.request?.headers.get('Cookie'),
              }
            : {}),
        }),
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
