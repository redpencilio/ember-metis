var b  = require('recast').types.builders;

// This function appends the route given in by the user 

module.exports = function routeNode(name, options) {

  // Creates classroute attaching user input to property of object expression
  var node =  b.variableDeclaration(
    "const",
    [
      b.variableDeclarator(
        b.identifier("classRoute"),
        b.callExpression(
          b.identifier('GCR'),
          [
            b.literal('view'),
            b.thisExpression()
          ]
        )
      )
    ]
  );

  return node;
};