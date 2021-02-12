import Route from '@ember/routing/route';

export default class View<%= classifiedModuleName %>Route extends Route {
  queryParams = {
    resource: { refreshModel: true }
  }

  model( { resource } ) {
    // Retrieve information about the given resource here
  }
}
