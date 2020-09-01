module.exports = CustomRouterGenerator;

// ref : https://github.com/ember-cli/ember-router-generator/blob/master/lib/ember-router-generator.js

const recast = require("recast");
const parser = require('recast/parsers/babel');

//Helpers
const findRoutes = require('./helpers/find-routes');
var routeNode = require('./helpers/route-node');



// Base function initilized by calling new CustomRouter(.. , ..)
function CustomRouterGenerator(source, ast) {
  this.source = source;

  // ast = Abstract Tree Syntax
  this.ast = ast;
  this.mapNode = null;

  this._ast();
  this._walk();
}

// Checks if AST has been passed to the function call otherwise parse it now====
CustomRouterGenerator.prototype._ast  = function() {
  return (this.ast = this.ast || recast.parse(this.source, { parser }));
};

// calls code function that clone's the body part of the router file & prettifies it 
CustomRouterGenerator.prototype.clone = function() {
  return new CustomRouterGenerator(this.code());
};

// Runs at initilization checks if router has view========================
CustomRouterGenerator.prototype._walk  = function() {

  // the word petal itself does not really mean anything and just references  `this`
  var petal = this;

  // visit the ast tree in and checks for router map
  recast.visit(this.ast, {


    // checks if it finds the view route & puts it inside petal.mapNode for later use 
    visitCallExpression: function(path) {
      var node = path.node 
      if(node.arguments[0].value == "view"){
        petal.mapNode = node;
        return false
      } 
      

      // If not found in first node that has type: CallExpression it will keep looping through the AST until it finds it or there are none left 
      this.traverse(path)
    }})
}

// Adds a route to the router file ========================================
CustomRouterGenerator.prototype.add = function(routeName, options) {

  // gets the ast including mapNode made prettier
  var route = this.clone();

  // Gets all route nodes 
  var routes = route.mapNode.arguments[1].body.body;


  // Calls the function that will build the code for the router 
  route._add.call(
    route,
    routeName,
    routes,
    options
  );

  return route;
};


// This function is responsible for adding the code
CustomRouterGenerator.prototype._add = function(routeName, routes, options) {
  

    // Checks if the given route already exists
    var routeExists = findRoutes(routeName, routes, options, true)

    // if the route does not exists yet then add the route
    if(!routeExists){
      route = routeNode(routeName, options);
      routes.push(route);
    }


};

CustomRouterGenerator.prototype._remove = function(name, routes, options) {

  var parent = name;

  var paths = findRoutes(parent, routes, options.identifier, false);

  // If route exists then execute following code
  if(paths){

    // Filter out the route that needs to be removed
    routes = routes.filter((node) => {
      
      if(node.expression != undefined && node.expression.arguments != undefined && node.expression.arguments.length == 2  && node.expression.arguments[0].value == name){
        return false
      } else {
        return true
      }
    })

    // Return the routes without the one that needed to be removed
    return routes
  }
};


CustomRouterGenerator.prototype.remove = function(routeName, options) {

  // gets the ast including mapNode made prettier
  var route = this.clone();

  // Gets all route nodes 
  var routes = route.mapNode.arguments[1].body.body;


  // Calls the function that will build the code for the router 
  var newRoutes = route._remove.call(
    route,
    routeName,
    routes,
    options
  );


  // if route existed and newRoutes has new array with routes then update 

  if (newRoutes) {
    route.mapNode.arguments[1].body.body = newRoutes;
  }

  return route;
};




// returns prettyfied code                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
CustomRouterGenerator.prototype.code = function(options) {
  options = options || { tabWidth: 2, quote: 'single' };

  return recast.print(this.ast, options).code;
};

