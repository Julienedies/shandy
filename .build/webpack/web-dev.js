/*!
 * Created by j on 2019-02-24.
 */

const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const express = require('express')

const devServerPort = 8080
const webpackConfig = require('./web.config')

const compiler = webpack(webpackConfig)

const app = express()

const devMiddleware = webpackDevMiddleware(compiler, {
    writeToDisk: true,
/*    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }*/
})

const hotMiddleware = webpackHotMiddleware(compiler, {
    log: true,
    //path: `http://localhost:${ devServerPort }/__webpack_hmr`,
    heartbeat: 2500
})


app.use(function (req, res, next) {
    console.log(req.url)
    next()
})
// 跨域支持
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    if (req.method === "OPTIONS") {
        res.send(200); // 让options请求快速返回
    } else {
        next();
    }
})

app.use(devMiddleware)
app.use(hotMiddleware)

app.listen(devServerPort, function () {
    console.log(`webpack-hot-middleware listening on port ${ devServerPort }!\n`);
});