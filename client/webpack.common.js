
const path = require('path');
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());
const webpack = require("webpack");
//const ammo = require('ammojs-typed');
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
        //ammo: "Ammo"
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
};