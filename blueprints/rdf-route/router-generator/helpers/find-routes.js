var recast = require('recast');

// Checks if route already exists
module.exports = function findRoutes(name, routes, identifier, addAction) {
  var routeFound = false; // default

  recast.visit(routes, {
    visitExpressionStatement: function (path) {
      var node = path.node;

      // Checks if route exists
      if (
        node.expression.callee.name == 'classRoute' &&
        node.expression.arguments.length > 0 &&
        node.expression.arguments[0].type == 'ThisExpression' &&
        node.expression.arguments[1].value == name
      ) {
        routeFound = true;

        // Check if findRoutes function is called by ADD & not REMOVE
        if (addAction) {
          // If route exists then update the property value to the vocabulary given by the user
          node.expression.arguments[2].properties[0].value = `'${identifier}'`;
        }

        return false;
      } else {
        this.traverse(path);
      }
    },
  });

  return routeFound;
};
