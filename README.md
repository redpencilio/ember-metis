# Table of content

- [Description](#description)
- [Before using the addon](#before-using-the-addon)
- [Installation & Usage](#installation---usage)
  - [Installation](#installation)
  - [Usage](#usage)
- [Add Custom routes](#add-custom-routes)
  - [Add RDF Routes](#add-rdf-routes)
- [Parameters](#parameters)
- [Actions](#actions)
- [Update action](#update-action)
  <br>

# Description

Ember addon creating an end-points that automatically get resources from the underlying triplestore and checks for labels & descriptions. The addon is meant to be used together with the the mu.semte.ch microservice model.

## Before using the addon

**Check if you have performed the following actions:**

We assume that you are using the the mu-semte-ch stack in the back-end. The following actions build further upon the mu-project docker-image.
The `Dispatcher`, `Identifier`, ` Database` & ` mu-cl-resources` are included by default.<br><small>( new to mu-semte-ch? Checkout the getting started tutorial on [mu.semte.ch](https://mu.semte.ch/getting-started/) )
<br>

- Included both the [**mu-uri-info-service**](https://github.com/redpencilio/mu-uri-info-service/) & [**resource-label-service**](https://github.com/lblod/resource-label-service/) to your docker-compose.yml file.

```yaml
/config/docker-compose.yml


services:
  uriinfo:
    image: redpencil/mu-uri-info-service
    links:
      - db:database

  resource-labels:
    image: lblod/resource-label-service:0.0.3
    restart: always
    links:
      - db:database
    labels:
      - "logging=true"
```

<br>

- Included the routes of the above mentioned services to your dispatcher.ex file

```elixir
/config/dispatcher/dispatcher.ex


match "/resource-labels/*path" do
  Proxy.forward conn, path, "http://resource-labels/"
end

match "/uri-info/*path" do
  Proxy.forward conn, path, "http://uriinfo/"
end
```

<sup>In case you do not have data to work with and want to populate your database you can can just continue reading, otherwise you can skip the following 2 steps.</sup>

<br>

- Included [**mu-migrations-service**](https://github.com/mu-semtech/mu-migrations-service) to your docker-compose.yml file

```yaml
/config/docker-compose.yml


services:
  migrations:
    image: semtech/mu-migrations-service
    links:
      - db:database
    volumes:
      - ./config/migrations:/data/migrations
```

<br>

- Created migrations folder and add turtle `.ttl` files to it
  <sup>If you do not have any turtle files then you just download one from here: [click on me](https://mandaten.lokaalbestuur.vlaanderen.be/) ( At the bottom called `Turtle: gestructureerde data voor dataverwerking en analyse.` )</sup>

```
  /config/migrations/my-turtle-file(s).ttl
```

To take advantage of the label service you will probably also want to populate your database with labels corresponding to the data you just migrated to your triplestore. Since with the mu-semte-ch model we only need one database, we can just add the turtle `.ttl` file together with our actual data file into the migrations folder and the migration-service will do the heavy lifting for use. <br>

> Do not worry about starting your backend again with the same files in your migration folder, the migration service is smart enough to not migrate the same data more then ones and accidentially create duplicates in your database.

Your migration folder structure should now look something like this:

```
config
└───migrations
    │-- my-data-file.ttl
    │-- my-label-file.ttl
    │--	maybe-another-data-file.ttl
    │-- add-as-many-as-you-need.ttl
    │-- ...
```

<br>

## Addon Installation & Usage

### Installation

```
ember install ember-metis
```

### Usage

- Add the metisFallBackRoute to code to your router.js file

```js
/my-app-name/app/router.js


import metisFallbackRoute from 'metis/utils/fallback-route';

Router.map(function() {
  this.route("view", function() {


  }
  metisFallbackRoute(this);
});
```

<br>

- Add the metis object to you environment variables & define your baseURL

```js
/my-app-name/config/environment.js


let ENV = {
    metis: {
      routes: {},
      baseUrl: "http://data.lblod.info/",
      pageSize: {
        directed: 100,
        inverse: 100
      }
    },
    ...
```

The pageSize variable is optional. The default pageSize is 500 for both directed and inverse links.

## Add Custom routes

### Add RDF Routes

- First import the classRoute file into your router.js file. Your router.js file should look something like this:

```js
import EmberRouter from "@ember/routing/router";
import config from "dummy/config/environment";
import metisFallbackRoute from "metis/utils/fallback-route";
import classRoute from "metis/utils/class-route";

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route("view", function () {});

  metisFallbackRoute();
});
```

- Now you can generate your routes

Generating rdf-routes is similar to generating generic ember routes. Generating an rdf-route for 'person' looks like this:

```
  ember generate rdf-route person --voc http://xmlns.com/foaf/0.1/Person
```

This will generate a controller, template & router with the corresponding boilerplate code. You can see the raw code it generates in the dummy app.

## Parameters

| Parameters | Type   | default                     |
| ---------- | ------ | --------------------------- |
| --voc      | String | http://ChangeThisByYourVoc/ |

It also takes the default ember-router flags like --dummy

## Actions

| Actions  | Description                                                                                |
| -------- | ------------------------------------------------------------------------------------------ |
| generate | Generates a controller, template & routes file + updates the router.js file                |
| destroy  | Destroys the controller, template & routes file + removes the corresponding router.js code |

## Update action

If you already have a people route in your file for example:

```js
/my-app-name/app/router.js

...

this.route("view", function() {

    classRoute(this, 'people', {
      class: 'http://xmlns.com/foaf/0.1/Person'
    });
  })

...
```

And you wanted to update the vocabulary of people route to be 'http://schema.org/Person' then it suffices to re-generate the people route but with the different vocabulary.
The command would look like this:

```

  ember generate rdf-route people --voc http://schema.org/Person

```

`http://xlmns.com/foaf/01/Person` will get replaced with `http://schema.org/Person` without anything else getting changed

<sup>Ofcoarse you can also change code manually in the router file.</sup>
