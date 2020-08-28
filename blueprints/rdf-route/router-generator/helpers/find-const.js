var recast = require('recast');

// Checks if route already exists
module.exports = function findRoutes(routes) {
  var constFound = false // default
  recast.visit(routes, {
    visitVariableDeclaration: function(path) {
      var node = path.node;
      var declaration = node.declarations[0]

      // Basically checks if one of the nodes matches {{ const classRoute = GCR("view", this) }}
      if (declaration.id.name == "classRoute" && declaration.init.callee.name == "GCR" && declaration.init.arguments.length == 2 && declaration.init.arguments[0].value == "view" && declaration.init.arguments[1].type ===  "ThisExpression") {

        constFound = true
        return false;
        
      } else {
        this.traverse(path);
      }
    }
  });

  return constFound ;
};