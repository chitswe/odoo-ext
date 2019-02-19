
var WebpackDevServer =  require("webpack-dev-server");
var webpack =require ('webpack');
var webpackConfig= require('./webpack.dev');
const proxyPort = 3031;
webpackConfig.output.path="/dist/public";
    const server = new WebpackDevServer(webpack(webpackConfig), {
        contentBase: __dirname,
        hot: true,
        quiet: false,
        noInfo: false,
        publicPath:"/dist/public",
        stats: { colors: true }
    });
    
server.listen(proxyPort, "localhost", function() {
    console.log(`Proxy server is running on port ${proxyPort}`);
});