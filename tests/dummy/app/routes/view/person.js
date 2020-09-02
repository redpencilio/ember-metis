import Route from '@ember/routing/route';

export default class ViewPersonRoute extends Route {
  queryParams = {
    resource: { refreshModel: true }
  }

  model( { resource } ) {
    console.log(resource);
  }
}
