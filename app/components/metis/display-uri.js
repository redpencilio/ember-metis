import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import fetch from 'fetch';
import env from '../../config/environment';

export default class MetisDisplayUriComponent extends Component {
  @tracked externalPreflabel = null
  @tracked internalPreflabel = null;
  @tracked showShort = true;

  constructor(){
    super(...arguments);
    if( this.args.uri ){
      this.fetchPreflabels();
    }
  }

  didReceiveAttrs(){
    this.fetchPreflabels();
  }

  async fetchPreflabels(){
    if( this.args.uri ) {
      const base = "http://preflabel.org/api/v1/label/";
      const fetchUrl = new URL(`${base}${encodeURIComponent( this.args.uri )}`);
      const request = await fetch( fetchUrl );
      const value = await request.text();
      if( request.status == 200 ) {
        this.externalPreflabel = value;
      } else {
        this.externalPreflabel = null;
      }
    } else {
      this.externalPreflabel = null;
    }
  }

  get localBasePath() {
    const uri = this.args.uri || "";

    if( uri.startsWith( env.metis.baseUrl ) )
      return uri.slice( env.metis.baseUrl.length );
    else
      return null;
  }

  get label() {
    if( this.hasShort && this.showShort ) {
      return this.externalPreflabel;
    } else {
      return this.args.uri;
    }
  }

  get hasShort() {
    return this.externalPreflabel;
  }
}
