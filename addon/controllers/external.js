import Controller from '@ember/controller';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ExternalController extends Controller {
  queryParams = [
    {
      directedPageNumber: {
        type: 'number',
      },
      directedPageSize: {
        type: 'number',
      },
      inversePageNumber: {
        type: 'number',
      },
      inversePageSize: {
        type: 'number',
      },
      resourceUri: {
        type: 'string',
      },
    },
  ];

  @tracked directedPageNumber = 0;
  @tracked directedPageSize = 50;

  @tracked inversePageNumber = 0;
  @tracked inversePageSize = 50;

  @tracked isLoadingDirected = false;
  @tracked isLoadingInverse = false;

  @tracked resourceUri = '';

  constructor() {
    super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
    if (config.metis && config.metis.pageSize) {
      this.directedPageSize = config.metis.pageSize.directed;
      this.inversePageSize = config.metis.pageSize.inverse;
    }
  }

  get isEmpty() {
    return this.model.directed.count == 0 && this.model.inverse.count == 0;
  }

  @action
  selectDirectedPage(page) {
    this.directedPageNumber = page;
    this.isLoadingDirected = true;
  }

  @action
  selectInversePage(page) {
    this.inversePageNumber = page;
    this.isLoadingInverse = true;
  }
}
