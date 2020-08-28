 
var recast = require('recast');

// Checks if route already exists
module.exports = function findRoutes(name, routes, identifier) {
  var routeFound = false // default

  console.log(identifier)
  recast.visit(routes, {
    visitExpressionStatement: function(path) {
      var node = path.node;

      // Checks if route exists 
      if (node.expression.callee.name == "classRoute" && node.expression.arguments[0].value == name) {

        routeFound = true

        // If route exists then update the property value to the vocabulary given by the user
        node.expression.arguments[1].properties[0].value = `'${identifier}'`

        return false;
        
      } else {
        this.traverse(path);
      }
    }
  });

  return  routeFound ;
};