'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const stringUtil = require('ember-cli-string-utils');


module.exports = {
  description: 'Generates a route and a template, and registers the route with the router.',

  availableOptions: [
    {
      name: 'path',
      type: String,
      default: '',
    },
    {
      name: 'skip-router',
      type: Boolean,
      default: false,
    },
    {
      name: 'reset-namespace',
      type: Boolean,
    },
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

  beforeInstall: function(options){
    // Gets content of router file 
    let routerPath = path.join.apply(null, findRouter(options));
    let source = fs.readFileSync(routerPath, 'utf-8');
    let importRegx = /()gen-class-route()/
    let checkImport = importRegx.test(source)
    if(!checkImport){
      console.log("\n")
      console.log(chalk.red(`You need to import the gen-class-route into your router.js file first.`))
      throw 'More information inside the Readme file'
    }

      console.log(routerPath)

    

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


  let routes = new GenerateRoute(source); 
  let newRoutes = routes.source;

  fs.writeFileSync(routerPath, newRoutes);
}

class GenerateRoute {
  constructor(source){
    this.source = source
    this.checkFile()
  }

  checkFile(){
    console.log(this.source)
    let viewRegx = /this.route\("view"/g
    let viewExists = viewRegx.test(this.source)
    console.log("Existst" + viewExists)
    if(!viewExists){
      let mapRegx = /Router.map\(function\(\) {/g
      this.source = this.source.replace(mapRegx,
          'Router.map(function() { \n this.route("view", function() { \n const classRoute = GCR("view", this); \n })'
          )
      }
    }

  addRoute(){
    
  }
  
}