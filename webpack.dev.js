var webpack = require('webpack');
var CompressionPlugin = require('compression-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    entry: ["./src/common/date.extension.ts","./src/browser/index.tsx"],
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist/public"
    },
    mode:"development",
    context:__dirname,

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".mjs",".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }
    
    // plugins: [
    //     new webpack.optimize.OccurrenceOrderPlugin(),
    //     new webpack.DefinePlugin({
    //         'process.env': {
    //             'NODE_ENV': JSON.stringify('production')
    //         }
    //     }),
    //     new webpack.optimize.AggressiveMergingPlugin(),
    //     new UglifyJsPlugin(),
    //     new CompressionPlugin({   
    //       asset: "[path].gz[query]",
    //       algorithm: "gzip",
    //       test: /\.js$|\.css$|\.html$/,
    //       threshold: 10240,
    //       minRatio: 0.8
    //     })
        
    // ],
};