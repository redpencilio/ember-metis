import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import fetch from 'fetch';
import buildUrl from 'build-url';

export default class MetisDisplayUriComponent extends Component {

  @service config;

  @tracked externalPreflabel = null;
  @tracked internalPreflabel = null;
  @tracked showShort = true;
  @tracked description;

  constructor() {
    super(...arguments);
    if (this.args.uri) {
      this.fetchPreflabels();
    }
  }

  async fetchPreflabels() {
    this.externalPreflabel = null;
    this.description = null;

    if (this.args.uri) {
      const backend = this.fastboot.isFastBoot ? window.BACKEND_URL : "/";
      const fetchUrl = buildUrl(backend, {
        path: 'resource-labels/info',
        queryParams: {
          term: this.args.uri
        }
      });

      const request = await fetch(fetchUrl);
      const body = await request.text();

      const value = JSON.parse(body);

      if (request.status == 200 && value.attributes) {
        this.externalPreflabel = value.attributes.label;
        this.description = value.attributes.comment;
      }
    }
  }

  get localBasePath() {
    const uri = this.args.uri || "";

    if (uri.startsWith(this.config.get('metis').baseUrl))
      return uri.slice(this.config.get('metis').baseUrl.length);
    else
      return null;
  }

  get label() {
    if (this.hasShort && this.showShort) {
      return this.externalPreflabel;
    } else {
      return this.args.uri;
    }
  }


  get description() {
    if (this.description) {
      return this.description;
    } else {
      return null;
    }
  }

  get hasShort() {
    return this.externalPreflabel;
  }
}
