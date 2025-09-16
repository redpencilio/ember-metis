import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';

export default class MetisIconComponent extends Component {
  get iconPrefix() {
    const config = getOwner(this)?.factoryFor('config:environment')?.class;
    return config.rootURL || '/';
  }
}
