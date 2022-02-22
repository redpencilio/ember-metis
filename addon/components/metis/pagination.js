import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class MetisPaginationComponent extends Component {
  get count() {
    return this.args.count || 0;
  }

  get page() {
    return this.args.page || 0;
  }

  get size() {
    return this.args.size || 500;
  }

  get startItem() {
    return this.size * this.page + 1;
  }

  get endItem() {
    return Math.min(this.size * this.page + this.size, this.count);
  }

  get hasMultiplePages() {
    return this.count > this.size;
  }

  get isFirstPage() {
    return this.page == 0;
  }

  get isLastPage() {
    return this.endItem == this.count;
  }

  @action
  previousPage() {
    this.setPage(this.page - 1);
  }

  @action
  nextPage() {
    this.setPage(this.page + 1);
  }

  @action
  setPage(page) {
    this.args.selectPage(page);
  }
}
