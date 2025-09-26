import Component from '@glimmer/component';
import { getOwner } from '../../utils/compat/get-owner';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class MetisDisplayUriComponent extends Component {
  @service('resource-label') labelService;

  @tracked externalPreflabel = null;
  @tracked internalPreflabel = null;
  @tracked showShort = true;
  @tracked description;

  constructor() {
    super(...arguments);
    this.config = getOwner(this).resolveRegistration('config:environment');
    this.fetchPreflabels();
  }

  async fetchPreflabels() {
    this.externalPreflabel = null;
    this.description = null;

    if (this.args.uri) {
      const entry = await this.labelService.fetchPrefLabel(this.args.uri);
      this.externalPreflabel = entry.prefLabel;
      this.description = entry.description;
    }
  }

  get isLocal() {
    return this.localBasePath && true;
  }

  get localBasePath() {
    const uri = this.args.uri || '';
    if (uri.startsWith(this.config.metis.baseUrl))
      return uri.slice(this.config.metis.baseUrl.length);
    else return null;
  }

  get label() {
    if (this.hasShort && this.showShort) {
      return this.externalPreflabel;
    } else {
      return this.args.uri;
    }
  }

  get hasShort() {
    return this.externalPreflabel;
  }

  get constructInternalPath() {
    let baseUrl;
    if (!window.BACKEND_URL) {
      baseUrl = `${window?.location?.protocol}//${window?.location?.host}/external`;
    } else {
      baseUrl = `${window.BACKEND_URL}/external`;
    }
    const queryParams = `?resource=${encodeURIComponent(this.args.uri)}`;
    return `${baseUrl}${queryParams}`;
  }
}
