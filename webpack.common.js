
const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());
const webpack = require("webpack");
const ammo = require('ammojs-typed');
module.exports = {
    entry: path.resolve(appDirectory, "src/app.ts"), //path to the main .ts file
    target: "web",
    resolve: {
        extensions: ["", ".tsx", ".ts", ".js"],
        fallback: {
            fs: false,
            path:false,
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        cannon: "CANNON",
        ammo: "Ammo"
    },
    
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }),
        //new webpack.ProvidePlugin({
        //    "ammo": "ammo"
        //}),
    ],
    //node: {
    //    fs: "empty"
    //},
    /*
    devServer: {
        host: "0.0.0.0",
        port: 8080, //port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        hot: true,
        devMiddleware: {
            publicPath: "/",
        }
    },
    
    */
};