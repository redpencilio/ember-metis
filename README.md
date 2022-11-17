# ember-metis

Ember addon providing default subject pages for your Linked Data resources. The default subject page lists all incoming and outgoing relations of a resource. The addon allows to override subject pagess per resource types with a custom template.

## Getting started
### Adding ember-metis to your application
#### Setup the backend
ember-metis assumes a mu.semte.ch stack is used in the backend. The addon requires the following services to be available:
- [**uri-info**](https://github.com/redpencilio/mu-uri-info-service/): Microservice listing all incoming and outgoing relations for a given subject URI
- [**resource-labels**](https://github.com/lblod/resource-label-service/): Microservice providing a human-readable label for a URI
- [**resource-labels-cache**](https://github.com/mu-semtech/mu-cache/): Cache for the `resource-labels` service

Add the following snippet to the `docker-compose.yml` file of your backend stack:
```yaml
services:
  uri-info:
    image: redpencil/mu-uri-info-service:0.2.0
  resource-labels-cache:
    image: semtech/mu-cache:2.0.1
    links:
      - resource-labels:backend
  resource-labels:
    image: lblod/resource-label-service:0.0.3
```

The `uri-info` and `resource-labels` services assume the triplestore is available as `database` in your stack. If not, provide the appropriate docker alias to the service in the `docker-compose.yml`.

Next, make the service endpoints available in `./config/dispatcher/dispatcher.ex`:

```elixir
  define_accept_types [
    json: [ "application/json", "application/vnd.api+json" ]
  ]

  get "/uri-info/*path", %{ accept: %{ json: true } } do
    forward conn, path, "http://uri-info/"
  end

  get "/resource-labels/*path", %{ accept: %{ json: true } } do
    forward conn, path, "http://resource-labels-cache/"
  end

```
#### Setup the frontend
ember-metis requires [Ember FastBoot](https://github.com/ember-fastboot/ember-cli-fastboot). Install the addon in your application if it's not yet available:

```bash
ember install ember-cli-fastboot
```

For local development using `ember serve` ember-metis requires `BACKEND_URL` as a sandbox global when running in fastboot mode. The value of `BACKEND_URL` must be the same URL you pass as proxy URL in `ember serve --proxy`. Typically `http://localhost/` (or `http://host` when serving the frontend from a Docker container).

To define the sandbox global, add the follow content to `./config/fastboot.js` in your frontend application:
```javascript
module.exports = function(environment) {
  return {
    sandboxGlobals: {
      BACKEND_URL: "http://localhost/",
    }
  };
};
```

Install the ember-metis addon in your application.
```bash
ember install ember-metis
```

Add the following configuration to `./config/environment.js`:
```javascript
let ENV = {
  metis: {
    baseUrl: "http://data.lblod.info/"
  },
  ...
```

The `baseUrl` specifies the domain you want to serve subject pages for. I.e. the base URL of your production environment.

Finally, import and add the `metisFallbackRoute` util to your `router.js`

```javascript
import metisFallbackRoute from 'metis/utils/fallback-route';

Router.map(function() {
  // ... other routes here

  metisFallbackRoute(this);
});
```

Since `metisFallbackRoute` matches all paths, it's best to put the route at the bottom of your routes list.

#### Setup styling
ember-metis currently depends on [ember-appuniversum](https://appuniversum.github.io/ember-appuniversum/docs/outline/getting-started) and [ember-cli-sass](https://github.com/adopted-ember-addons/ember-cli-sass) for styling.

After installing both packages, import the `metis` styling as follows in your `app.scss`
Import the metis styles in your app.scss file
```scss
// ... appuniversum imports

@import "metis";
```

## How-to guides
### Provide human-readable labels for URIs on the subject page
Check the README of the [resource label service](https://github.com/lblod/resource-label-service/#db-information) how to insert human-readable labels in the triplestore. Once the labels are available, they will be automatically picked up by ember-metis.

### Setup a custom template for a specific resource type
For some resources you may want to display a custom template instead of the default one provided by ember-metis. The addon supports custom templates per resource type. E.g. you can provide a custom template for all resources of type `http://xmlns.com/foaf/0.1/Person`.

Before you generate your first custom route/template, import the `classRoute` util in `router.js` and define a `view` route at the root level:

```javascript
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import metisFallbackRoute from 'metis/utils/fallback-route';
import classRoute from 'metis/utils/class-route';   // <---- Add this line

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  // other routes
  this.route('view', function() { });  // <---- Add this line
  metisFallbackRoute(this);
});
```

Next, generate your custom route using the following generate command
```bash
ember generate rdf-route <route-name> --voc <rdf-type>
```

E.g. to generate a `person` route for all resources of type `foaf:Person`
```bash
ember generate rdf-route person --voc http://xmlns.com/foaf/0.1/Person
```

A `person` route, controller and template will be generated as subroute of `view` which you can implement as regular Ember routes to your needs. A new routing rule will also automatically be added to `router.js`.

Whenever the user navigates to a subject page of a resource of type `foaf:Person`, he will be redirected to the custom template instead of the default one.

## Reference
### Addon configuration
ember-metis can be configured in `./config/environment.js` via the `metis` key:

```javascript
let ENV = {
  metis: {
    // ember-metis configuration here
  },
  ...
```

The available options are described below.

#### Base URL (required)
The `baseUrl` specifies the domain you want to serve subject pages for. I.e. the base URL of your production environment. Based on this configuration, ember-metis ensures navigation through subject pages also works on other environments and on localhost during development.

E.g.
```javascript
  metis: {
    baseUrl: "http://data.lblod.info/"
  }
```

#### Pagination (optional)
By default ember-metis only shows the first 50 directed and inverse relations for a subject URI. The default page size for both directions can be configured via `pageSize`.

E.g.

```javascript
  metis: {
    ...
    pageSize: {
      directed: 100,
      inverse: 50
    }
  }
```
### Generators
#### rdf-route
Generate a custom route/controller/template per rdf:type using

```bash
ember generate rdf-route <route-name> --voc <rdf-type>
```

Similarly, remove the custom route/controller/template using
```bash
ember delete rdf-route <route-name>
```

## Discussion
### Why using a `classRoute` util for custom templates?
On generation of a custom rdf-route, a routing rule will be added to the `router.js` which makes use of the `classRoute` util.

E.g.

```javascript
  this.route('view', function() {
    classRoute(this, 'person', {
      class: 'http://xmlns.com/foaf/0.1/Person'
    });
  });
```

The `classRoute` util is a wrapper around the regular `this.route` functionality used for regular routes. In addition to the regular behaviour, the `classRoute` util also ensures the route-name and rdf:Class combination gets registered. This registration is used to redirect the user to the appropriate custom route when navigating through the subject pages based on the subject's rdf:Class.
