import Route from '@ember/routing/route';

export default class View<%= classifiedModuleName %>Route extends Route {
  queryParams = {
    resource: { refreshModel: true }
  }

  model( { resource } ) {
    console.log(resource);
  }
}
