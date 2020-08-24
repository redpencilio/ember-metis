
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

#### Installation
```
	ember install ember-metis
```
#### Usage
	
##### - Add the following lines of code to your router.js file

```
/my-app-name/app/router.js


import metisFallbackRoute from 'metis/utils/fallback-route';

Router.map(function() {
  metisFallbackRoute(this);  
});	
```
<br>

##### - Add the following lines of code to your environment.js file

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

If you want to add custom routes then you can use our class-route code for this. First generate the necessary files and add the code below-mentioned code to it.

##### - First we will create a gen-class-route util & add the necessary code to it:
```
ember generate util gen-class-route
```
<br>

##### - Navigate to the gen-class-route file and add the following code to it 

```
/my-app-name/app/utils/gen-class-route.js


import  env  from  '../config/environment';

export  default  function  genClassRoute(basePath, self) {
	return  function(name, options){
		let  route;
		if( basePath ) {
			route = basePath + "." + name;
		} else {
			route = name;
		}

		const  resourceClass = options.class;
		env.metis.routes[resourceClass] = route;

		return  this.route(name, options);
	}.bind(self);	
}
```
<br>

##### - Now we need to generate our route, as an example we will be generating a "person" route 

```
ember generate route view/person
```

##### - navigate to your route.js file and import the util class you just created to it 

```
/my-app-name/app/router.js


import  GCR  from  './utils/gen-class-route';
```

