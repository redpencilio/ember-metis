var b = require('recast').types.builders;

// This function appends the route given in by the user

module.exports = function routeNode(name, options) {
  // Creates classroute attaching user input to property of object expression
  var node = b.expressionStatement(
    b.callExpression(b.identifier('classRoute'), [
      b.thisExpression(),
      b.literal(name),
      b.objectExpression([
        b.property('init', b.identifier('class'), b.literal(options)),
      ]),
    ])
  );

  return node;
};
