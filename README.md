# ember-metis

Ember addon providing default subject pages for your Linked Data resources. The default subject page lists all incoming and outgoing relations of a resource. The addon allows to override subject pagess per resource types with a custom template.

## Compatibility

- Ember.js v4.12 or above
- Ember CLI v4.12 or above
- Node.js v18 or above


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
    image: redpencil/mu-uri-info-service:0.2.1
  resource-labels-cache:
    image: semtech/mu-cache:2.0.2
    links:
      - resource-labels:backend
  resource-labels:
    image: lblod/resource-label-service:0.3.2
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

For local development using `ember serve` ember-metis requires `BACKEND_URL` as a sandbox global when running in fastboot mode. The value of `BACKEND_URL` must be the same URL you pass as proxy URL in `ember serve --proxy`. Typically `http://localhost/` (or `http://host` when serving the frontend from a Docker container using [eds](https://github.com/madnificent/docker-ember#eds)).

If your app depends on Ember Data >= v4.12 you will need some additional sandbox globals to support `fetch` in Fastboot.

To define the sandbox global, add the follow content to `./config/fastboot.js` in your frontend application:
```javascript
module.exports = function(environment) {
  return {
    buildSandboxGlobals(defaultGlobals) {
      return Object.assign({}, defaultGlobals, {
        BACKEND_URL: 'http://localhost',

        // Fastboot support for Ember Data >= 4.12
        AbortController,
        ReadableStream:
        typeof ReadableStream !== "undefined"
          ? ReadableStream
          : require("node:stream/web").ReadableStream,
        WritableStream:
        typeof WritableStream !== "undefined"
          ? WritableStream
          : require("node:stream/web").WritableStream,
        TransformStream:
        typeof TransformStream !== "undefined"
          ? TransformStream
          : require("node:stream/web").TransformStream,
        Headers: typeof Headers !== "undefined" ? Headers : undefined,
      });
    },
  };
};
```

When using Ember Data add the following `fastbootDependencies` section in `package.json`, next to `dependencies` and `devDependencies`:
```javascript
{
  "devDependencies": {
    // ... dependencies here
  },
  "fastbootDependencies": [
    "crypto"
  ]
}
```

Finally, configure a host whitelist for Fastboot in your frontend's `./config/environment.js`:
```javascript
module.exports = function (environment) {
  const ENV = {
    // ... other config here ...
    fastboot: {
      hostWhitelist: ['backend',/^host:\d+$/,/^localhost:\d+$/]
    }
  }
}
```

#### Install ember-metis
Install the ember-metis addon in your application.

```bash
npm install -D ember-metis
```

Add the following configuration to `./config/environment.js`:
```javascript
module.exports = function (environment) {
  const ENV = {
    // ... other config here ...
    metis: {
      baseUrl: "http://data.lblod.info/"
    }
  }
}
```

The `baseUrl` specifies the domain you want to serve subject pages for. I.e. the base URL of your production environment.

Then, add the styles to your included path and include them in your stylesheet:
```javascript
// ember-cli-build.js

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: [ 'node_modules/ember-metis/styles' ],
    },
  })
  // ...
};
```

```scss
// app/styles/app.scss

@import "ember-metis/styles";
``````

Finally, import and add the `fallbackRoute` util to your `router.js`

```javascript
import { fallbackRoute, externalRoute } from 'ember-metis';

Router.map(function() {
  // ... other routes here

  externalRoute(this);
  fallbackRoute(this);
});
```

Since `fallbackRoute` matches all paths, it's best to put the route at the bottom of your routes list.

## How-to guides
### Upgrade from 0.9.0
Since 0.10.0 there is a `externalRoute` which must also be exposed in your `router.js`.

```javascript
import { fallbackRoute, externalRoute } from 'ember-metis'; // <-- Add externalRoute import

Router.map(function() {
  // ... other routes here

  externalRoute(this); // <-- Add this line before fallbackRoute
  fallbackRoute(this);
});
```


### Change the locale to nl-be
ember-metis uses [ember-intl](https://ember-intl.github.io/ember-intl/) for internationalization. By default the locale is set to `en-us` unless otherwise configured in the host app. To configure the locale in your host app, add the following application instance initializer:

```javascript
// app/instance-initializers/locale.js

export function initialize(appInstance) {
  // Set default locale for intl
  const intl = appInstance.lookup('service:intl');
  intl.setLocale(['nl-be']);
}

export default {
  initialize,
};
```
### Provide human-readable labels for URIs on the subject page
Check the README of the [resource label service](https://github.com/lblod/resource-label-service/#db-information) how to insert human-readable labels in the triplestore. Once the labels are available, they will be automatically picked up by ember-metis.

### Customize the appearance

#### Customize a few components
To allow you to customize the appearance of the resource page, the template is composed of multiple small components. You can override any of them to change the component's appearance on all resource pages.

For instance, if you want to show different levels of headings with different colors, add the following to your `app/components/metis/heading.hbs`:
```handlebars
{{#if (eq @level "3")}}
  <h3 class="text-red" ...attributes>{{yield}}</h3>
{{else if (eq @level "2")}}
  <h2 class="text-blue" ...attributes>{{yield}}</h2>
{{else}}
  <h1 class="text-green" ...attributes>{{yield}}</h1>
{{/if}}
```

This component will automatically be used for all metis headings instead of the default one. To see the components available for overriding and take inspiration in the default templates, see the `addon/components/metis` folder.

Alternatively, you can specify your own styles to be applied to the components' classes.


#### Customize the whole template
If you wish to customize the entire resource page template instead of overriding individual components (e.g., to display the properties table next to some other content), the addon offers two components:

- `<Metis::ResourcePage />` containing the entire content of the resource page without layout wrappers
- `<Metis::ResourceMetadata />` containing only the tables rendering direct and inverse triples without additional description

You may use these components anywhere in your application, given that you provide them with `@model` and `@controller` attributes containing a metis route model and a metis controller instance, respectively.

For a minimal working use case, define your own route instead of the fallback route in `router.js`:

```javascript
Router.map(function() {
  // ... other routes here

  externalRoute(this);
  this.route('metis', { path: '/*path' }); // <-- Replace fallbackRoute(this) with this line
});
```

Then create the corresponding route and controller extending the addon's ones:

```javascript
// app/routes/metis.js

import FallbackRoute from 'ember-metis/routes/fallback';

export default class MetisRoute extends FallbackRoute {
  templateName = 'metis';
}
```

```javascript
// app/controllers/metis.js

import FallbackController from 'ember-metis/controllers/fallback';

export default class MetisController extends FallbackController {
  // additional arbitrary logic
}

```

And finally define your template, using one of the provided components and arbitrary additional content.
```handlebars
<!-- app/templates/metis.hbs -->

<div>
  {{#if this.isEmpty}}
    Bad luck!
  {{else}}
    <Metis::ResourceMetadata
      @model={{@model}}
      @controller={{this}}
    />
  {{/if}}
</div>
```

To see the components used in practice, refer to the `addon/templates/external.hbs` and `addon/components/metis/resource-page.hbs` files.

#### Customize the template for a specific resource type only
You might wish to display a custom template only for specific resource types. E.g. you can provide a custom template for all resources of type `http://xmlns.com/foaf/0.1/Person`.

Before you generate your first custom route/template, import the `classRoute` util in `router.js` and define a `view` route at the root level:

```javascript
import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { classRoute, fallbackRoute, externalRoute } from 'ember-metis';   // <---- Edit this line

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  // other routes
  this.route('view', function() { });  // <---- Add this line

  externalRoute(this);
  fallbackRoute(this);
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

#### Fallback template (optional)
Handlebars template to render the fallback page. Defaults to `fallback` as provided by the addon. Useful to customize the fallback page. The route and controller for the `fallback` page are provided by the addon, also when using a custom template.

E.g.
```javascript
  metis: {
    fallbackTemplate: "my-custom/fallback"
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
