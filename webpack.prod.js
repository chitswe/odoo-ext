var webpack = require("webpack");
require("babel-polyfill");
var CompressionPlugin = require("compression-webpack-plugin");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");
module.exports = {
  entry: [
    "babel-polyfill",
    "./build/browser/index.js"
  ],
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist/public"
  },
  mode: "production",
  context: __dirname,

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".mjs", ".js", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    // new UglifyJsPlugin(),
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js(\?.*)?$/i,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};
