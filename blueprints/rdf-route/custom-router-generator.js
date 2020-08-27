module.exports = CustomRouterGenerator;

const recast = require("recast");
const parser = require('recast/parsers/babel');
const chalk = require('chalk');

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


CustomRouterGenerator.prototype.clone = function() {
  return new CustomRouterGenerator(this.code());
};

// Runs at initilization checks if router has router map========================
CustomRouterGenerator.prototype._walk  = function() {

  // the word petal itself does not really mean anything and just references  `this`
  var petal = this;

  // visit the ast tree in and checks for router map
  recast.visit(this.ast, {



    visitCallExpression: function(path) {
      var node = path.node 
      if(node.arguments[0].value == "view"){
        petal.mapNode = node;
        console.log(chalk.green`== Node Found : View exists ==`)
        return false
      } 
      this.traverse(path)
    }})
}

// Adds a route to the router file ========================================

CustomRouterGenerator.prototype.add = function(routeName, options) {

  // if mapNode is undefined that means that router.map was not found
  if (typeof this.mapNode === 'undefined') {
    throw new Error('Source doesn\'t include Router.map');
  }

  // gets the ast including mapNode made prettier
  var route = this.clone();

  // Gets all route nodes 
  var routes = route.mapNode.arguments[1].body.body;

  // Call the function that will build the code for the router
  route._add.call(
    route,
    routeName,
    routes,
    options
  );

  return route;
};



CustomRouterGenerator.prototype._add = function(nameParts, routes, options) {
  
  options = options || {};
  var parent = nameParts[0];
  var name = parent;
  var paths = findRoutes(parent, routes, options.identifier);
  var route = paths.length ? paths[paths.length - 1].node : false;

  if (!route) {
    route = routeNode(name, options);
    routes.push(route);
  }

};


// Prints out prettyfied code
CustomRouterGenerator.prototype.code = function(options) {
  options = options || { tabWidth: 2, quote: 'single' };

  return recast.print(this.ast, options).code;
};

