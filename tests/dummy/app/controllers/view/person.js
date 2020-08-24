import Controller from '@ember/controller';

export default class ViewPersonController extends Controller {
  queryParams = ['resource'];

  resource = null;
}
