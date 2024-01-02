const path = require('path');
const fs = require("fs");
const nodeExternals = require('webpack-node-externals');
const package = require('./package.json');
const version = package.version;

module.exports = {
  target: 'node',
  externals: [nodeExternals()], 
  entry: './server_build/back_server.js', 
  output: {
    path: path.join(__dirname, 'server_bundle'), 
    filename: 'back_server.js',
    clean: true,
  },
  resolve: {
    extensions: ["", ".tsx", ".ts", ".js"]
},
  optimization: {
    minimize: false, 
  },
  mode:"production"
};