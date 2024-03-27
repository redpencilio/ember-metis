import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
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

  get constructInternalPath() {
    const baseUrl = `${window.BACKEND_URL}/external/`;
    const queryParams = `?resourceUri=${encodeURIComponent(this.args.uri)}`;
    return `${baseUrl}${queryParams}`;
  }
}
