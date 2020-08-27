'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const stringUtil = require('ember-cli-string-utils');

const CustomRouterGenerator = require('./custom-router-generator');
const { type } = require('os');

module.exports = {
  description: 'Generates a route and a template, and registers the route with the router.',

  // --voc lets you enter your vocabulary when creating route
  availableOptions: [
    {
      name: "voc",
      type: String,
      default: "http://ChangeThisByYourVoc/"
    }
  ],

  locals: function(options) {
    let moduleName = options.entity.name;
    if (options.resetNamespace) {
      moduleName = moduleName.split('/').pop();
    }

    return {
      moduleName: stringUtil.dasherize(moduleName),
    };
  },


  // Makes the nescessary checks before 
  beforeInstall: function(options){
    // Gets path to router
    let routerPath = path.join.apply(null, findRouter(options));

    // Get router.js file content
    let source = fs.readFileSync(routerPath, 'utf-8');

    // Check if the gen-class-route module is imported
    let importRegx = /()gen-class-route()/gi
    let checkImport = importRegx.test(source)

    if(!checkImport){
      console.log("\n")
      console.log(chalk.red(`You need to import the gen-class-route into your router.js file first.`))
      throw 'More information inside the repo\'s readme file'
    }

    // Checks for nested routes + throws error if nested
    let namePart = options.entity.name.split('/')
    if(namePart.length > 1){
      throw "Nested rdf-routes are not supported yet. Notice that rdf-routes are already automatically nested under 'view'."
    }
  },

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
    return entityName.replace(/\.js$/, ''); //Prevent generation of ".js.js" files
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
    this.ui.writeLine('updating router');
    this._writeStatusToUI(chalk[color], action + ' route', 'view/'+entity.name);
  }
}

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
  console.log(options)


  let routes = new CustomRouterGenerator(source); 
  let addRoute = routes.add(name, options.voc)
  
  fs.writeFileSync(routerPath, addRoute.code());
}

