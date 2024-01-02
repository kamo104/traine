const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());
const webpack = require("webpack");

module.exports = {
    

    entry: path.resolve(appDirectory, "src/index"), 
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/, 
            }
        ],
    },
    plugins: [new HtmlWebpackPlugin({
        inject: true,
        // filename: "index.html",
        template: path.resolve(__dirname, "public/index.html"),
        })],

    target: "web",

    context: __dirname,
    output: {
        filename: "js/bundleName.js", //name for the js file that is created/compiled in memory
        clean: true,
    },
    devServer: {
        host: "0.0.0.0",
        port: 9000, //port that we're using for local host (localhost:8080)
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
        extensions: ['.ts', '.tsx', '.js', ".json"],
        fallback: {
          'fs': false,
          'path': false, // ammo.js seems to also use path
        }
    },
    mode: "development",
    devtool: "source-map"
};