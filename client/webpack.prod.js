const { merge } = require('webpack-merge');
const fs = require("fs");
const common = require('./webpack.common.js');
const path = require('path');
const appDirectory = fs.realpathSync(process.cwd());
const package = require('./package.json');
const version = package.version;

module.exports = merge(common, {
  //entry: path.resolve(appDirectory, "src copy/app.ts"), //path to the main .ts file
    
  //entry: {app: {import: path.resolve(appDirectory, "src copy/app.ts"),},},
  resolve: {
    fallback: {
      'fs': false,
      'path': false, // ammo.js seems to also use path
    }
  },
  context: __dirname,
  output: {
      filename: 'app-'+version+'.js',
      //filename: "js/bundleName.js", //name for the js file that is created/compiled in memory
      clean: false,
    },
  mode: 'production', //production
});