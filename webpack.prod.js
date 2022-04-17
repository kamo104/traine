const { merge } = require('webpack-merge');
const fs = require("fs");
const common = require('./webpack.common.js');
const path = require('path');
const appDirectory = fs.realpathSync(process.cwd());

module.exports = merge(common, {
  //entry: path.resolve(appDirectory, "src copy/app.ts"), //path to the main .ts file
    
  entry: {
    app: {
      import: path.resolve(appDirectory, "src copy/app.ts"),
    },
  },
  resolve: {
    fallback: {
      'fs': false,
      'path': false, // ammo.js seems to also use path
    }
  },
  context: __dirname,
  output: {
      filename: 'app.js',
      //filename: "js/bundleName.js", //name for the js file that is created/compiled in memory
      clean: true,
    },
  mode: 'production', //production
});