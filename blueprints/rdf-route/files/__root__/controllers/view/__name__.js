import Controller from '@ember/controller';

export default class View<%= classifiedModuleName %>Controller extends Controller {
  queryParams = ['resource'];

  resource = null;
}
