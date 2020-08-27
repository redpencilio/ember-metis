import Controller from '@ember/controller';

export default class ViewPeopleController extends Controller {
  queryParams = ['resource'];

  resource = null;
}
