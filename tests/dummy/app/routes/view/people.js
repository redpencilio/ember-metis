import Route from '@ember/routing/route';

// Need to dynamically change class name to actual generator argument
export default class ViewPeopleRoute extends Route {
  queryParams = {
    resource: { refreshModel: true }
  }

  model( { resource } ) {
    console.log(resource);
  }
}
