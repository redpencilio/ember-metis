
# Ember Metis Addon
Ember addon creating an end-point that automatically gets resources from the underlying triplestore and checks for labels & descriptions. The addon is meant to be used together with the the mu.semte.ch microservice model. 

## Before using the addon

##### Check if you have performed the following actions:  

We assume that you are using the the mu-semte-ch stack for your back-end. The following actions build further upon the mu-project docker-image. 
The ``` Dispatcher ```, ``` Identifier ```,  ``` Database``` &  ``` mu-cl-resources``` are included by default.<br><small>( new to mu-semte-ch? Checkout the getting started tutorial on [mu.semte.ch](https://mu.semte.ch/getting-started/) )
<br>

##### - Included both the [**mu-uri-info-service**](https://github.com/redpencilio/mu-uri-info-service/) & [**resource-label-service**](https://github.com/lblod/resource-label-service/) to your docker-compose.yml file.
```
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

##### - Included the routes of the above mentioned services to your dispatcher.ex file

```
/config/dispatcher/dispatcher.ex


match "/resource-labels/*path" do
  Proxy.forward conn, path, "http://resource-labels/"
end

match "/uri-info/*path" do
  Proxy.forward conn, path, "http://uriinfo/"
end
```

> In case you do not have data to work with and want to populate your database you can can just continue this guide, otherwise you can skip the following steps.

<br>

##### - Included [**mu-migrations-service**](https://github.com/mu-semtech/mu-migrations-service) to your docker-compose.yml file

```
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

##### - Created migrations folder and add turtle ```.ttl``` files to it
> If you do not have any turtle files then you just download one from here: [click on me](https://mandaten.lokaalbestuur.vlaanderen.be/) ( At the bottom called ```Turtle: gestructureerde data voor dataverwerking en analyse.``` )
```
  /config/migrations/my-turtle-file(s).ttl
```
To take advantage of the label service you will probably also want to populate your database with labels corresponding to the data you just migrated to your service. Since with the mu-semte-ch model we only need one database, we can just add the turtle ```.ttl`` file together with our actual data file into the migrations folder and the migration-service will do, again, will de the heavy lifting for use. <br>
> Do not worry about starting your backend again with the same files in your migration folder, the migration service is smart enough to not migrate the same data more then ones and create duplicates in your database.

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
	
##### - Add the metisFallBackRoute to  code to your router.js file

```
/my-app-name/app/router.js


import metisFallbackRoute from 'metis/utils/fallback-route';

Router.map(function() {
  metisFallbackRoute(this);  
});	
```
<br>


##### - Add the metis object to you environment variables & define your baseURL

```
/my-app-name/config/environment.js


let ENV = {
    metis: {
      routes: {},
      baseUrl: "http://data.lblod.info/"
    },
    ...
```
##  Add Custom routes

#### Add RDF Routes

Generating rdf-routes is like generating normal routes in ember, so generating an rdf-route for people looks like this:

```
  ember generate rdf-route people --voc http://xmlns.com/foaf/0.1/Person 
```

This will generate a controller, template & router with the corresponding boiler code. You can see the raw code it generates in the dummy app.


##### Parameters

| Parameters    | Type          | default
| ------------- | ------------- | ----------------
| --voc         | String        | http://ChangeThisByYourVoc/

It also takes the default ember-router flags like --dummy 


##### Actions

| Actions       | Description  |
| ------------- | ------------ |
| generate      | Generates a controller, template & updates the router.js file |
| destroy       | Destroys the controller, template & removes the corresponding router.js code |

##### Update action

If you already have a people route in your file for example: 

```
/my-app-name/app/router.js

...

this.route("view", function() {
    const classRoute = GCR('view', this);

    classRoute('people', {
      class: 'http://xmlns.com/foaf/0.1/Person'
    });
  }) 

...
```

And you wanted to update the vocabulary of people route to be 'http://schema.org/Person' then it suffices to re-generate the people route but with the different vocabulary.
The command would look like this: 

...

  ember generate rdf-route people --voc http://schema.org/Person 
  
...

```http://xlmns.com/foaf/01/Person``` will get replaced with ```http://schema.org/Person``` without anything else getting changed

> Ofcoarse you can also change code manually in the router file.



















