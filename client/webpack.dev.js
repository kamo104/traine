const { merge } = require('webpack-merge');
const fs = require("fs");
const common = require('./webpack.common.js');
const path = require('path');
const appDirectory = fs.realpathSync(process.cwd());

module.exports = merge(common, {
    //entry: path.resolve(appDirectory, "src copy/app.ts"), //path to the main .ts file
    context: __dirname,
    output: {
        //filename: '[name].bundle.js',
        filename: "js/bundleName.js", //name for the js file that is created/compiled in memory
        clean: true,
    },
    devServer: {
        host: "0.0.0.0",
        port: 8080, //port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        hot: true,
        devMiddleware: {
            publicPath: "/",
        }
    },
    experiments: {
        topLevelAwait: true
    },
    resolve: {
        fallback: {
          'fs': false,
          'path': false, // ammo.js seems to also use path
        }
    },
    mode: "development",
    devtool: 'eval-source-map',
});