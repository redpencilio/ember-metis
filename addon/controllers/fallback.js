import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class FallbackController extends Controller {

  queryParams = {
    directedPageNumber: {
      type: 'number'
    },
    directedPageSize: {
      type: 'number'
    },
    inversePageNumber: {
      type: 'number'
    },
    inversePageSize: {
      type: 'number'
    },
  };

  @service config;

  @tracked directedPageNumber = 0;
  @tracked directedPageSize = (this.config.get('metis').pageSize && this.config.get('metis').pageSize.directed) || 500 ;

  @tracked inversePageNumber = 0;
  @tracked inversePageSize = (this.config.get('metis').pageSize && this.config.get('metis').pageSize.inverse) || 500 ;;

  @tracked isLoadingDirected = false;
  @tracked isLoadingInverse = false;

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
