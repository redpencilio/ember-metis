import Component from '@glimmer/component';
import { helper } from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class MetisPaginationComponent extends Component {
  @service intl;

  get t() {
    return helper(([key], options) => {
      return this.intl.t(`${this.routeType}.${key}`, options);
    });
  }

  get routeType() {
    return typeof this.args.controller.resource === 'undefined'
      ? 'fallback'
      : 'external';
  }
}
