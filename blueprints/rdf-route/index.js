'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const CustomRouterGenerator = require('./router-generator/custom-router-generator');

module.exports = {
  description: 'Generates a route and a template for a specific rdf:type, and registers the route with the router.',

  // --voc lets you enter your vocabulary when creating route
  availableOptions: [
    {
      name: "voc",
      type: String,
      default: "http://ChangeThisByYourVoc/"
    }
  ],

  // Makes the nescessary checks before
  beforeInstall: function(options){
    // Gets path to router
    let routerPath = path.join.apply(null, findRouter(options));

    // Get router.js file content
    let source = fs.readFileSync(routerPath, 'utf-8');

    // Check if the gen-class-route module is imported
    let importRegx = /()class-route()/gi;
    let checkImport = importRegx.test(source);

    if (!checkImport) {
      console.log("\n");
      console.log(chalk.red('You need to import the classRoute util in your router.js file first.'));
      console.log(chalk.red("import classRoute from 'metis/utils/class-route';"));
      throw new Error('Check ember-metis README for more information');
    }

    // Checks for nested routes (not supported yet)
    let namePart = options.entity.name.split('/');
    if (namePart.length > 1) {
      throw new Error("Nested rdf-routes are not supported yet. Notice that rdf-routes are already automatically nested under 'view'.");
    }
  },


  // Ember router code checking for flags
  shouldEntityTouchRouter: function(name) {
    let isIndex = name === 'index';
    let isBasic = name === 'basic';
    let isApplication = name === 'application';

    return !isBasic && !isIndex && !isApplication;
  },

  shouldTouchRouter: function(name, options) {
    let entityTouchesRouter = this.shouldEntityTouchRouter(name);
    let isDummy = Boolean(options.dummy);
    let isAddon = Boolean(options.project.isEmberCLIAddon());
    let isAddonDummyOrApp = isDummy === isAddon;

    return (
      entityTouchesRouter &&
      isAddonDummyOrApp &&
      !options.dryRun &&
      !options.inRepoAddon &&
      !options.skipRouter
    );
  },

  afterInstall: function(options) {
    updateRouter.call(this, 'add', options);
  },

  afterUninstall: function(options) {
    updateRouter.call(this, 'remove', options);
  },
  normalizeEntityName: function(entityName) {
    return entityName.replace(/\.js$/, ''); // Prevent generation of ".js.js" files
  },
};

// ============================================================================


function updateRouter(action, options) {
  let entity = options.entity;
  let actionColorMap = {
    add: 'green',
    remove: 'red',
  };
  let color = actionColorMap[action] || 'gray';

  if (this.shouldTouchRouter(entity.name, options)) {
    writeRoute(action, entity.name, options);
    this.ui.writeLine('updating rdf router');
    this._writeStatusToUI(chalk[color], action + ' route', 'view/' + entity.name);
  }
}

// Sets path to place to write the route
function findRouter(options) {
  let routerPathParts = [options.project.root];
  let root = 'app';

  if (options.dummy && options.project.isEmberCLIAddon()) {
    routerPathParts = routerPathParts.concat(['tests', 'dummy', root, 'router.js']);
  } else {
    routerPathParts = routerPathParts.concat([root, 'router.js']);
  }

  return routerPathParts;
}

function writeRoute(action, name, options) {
  let routerPath = path.join.apply(null, findRouter(options));
  let source = fs.readFileSync(routerPath, 'utf-8');

  let routes = new CustomRouterGenerator(source);
  let updateRoute = routes[action](name, options.voc);

  fs.writeFileSync(routerPath, updateRoute.code());
}
