/*!
 * Created by j on 2019-03-05.
 */

const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const express = require('express')

const webpackConfig = require('./web.config')

function logStats (proc, data) {
    let log = ''

    log += chalk.yellow.bold(` ${ proc } Process ${ new Array((19 - proc.length) + 1).join('-') }`)
    log += '\n\n'

    if (typeof data === 'object') {
        data.toString({
            colors: true,
            chunks: false
        }).split(/\r?\n/).forEach(line => {
            log += '  ' + line + '\n'
        })
    } else {
        log += `  ${ data }\n`
    }

    log += '\n' + chalk.yellow.bold(` ${ new Array(28 + 1).join('-') }`) + '\n'

    console.log(log)
}

const devServerPort = 8090

const compiler = webpack(webpackConfig)

const hotMiddleware = webpackHotMiddleware(compiler, {
    log: false,
    heartbeat: 2500
})

/*compiler.hooks.compilation.tap('compilation', compilation => {
    compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('html-webpack-plugin-after-emit', (data, cb) => {
        hotMiddleware.publish({action: 'reload'})
        cb()
    })
})*/

compiler.hooks.done.tap('done', stats => {
    logStats('Renderer', stats)
})

const server = new WebpackDevServer(
    compiler,
    {
        contentBase: path.join(__dirname, '../../'),
        quiet: true,
        writeToDisk: true,
        before (app, ctx) {
            app.use(hotMiddleware)
            ctx.middleware.waitUntilValid(() => {
                console.log('++++++++WebpackDevServer.before+++++++++++')
            })
        }
    }
)



server.listen(devServerPort)