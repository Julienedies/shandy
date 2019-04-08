/*!
 * Created by j on 2019-03-05.
 */
const {spawn} = require('child_process');
const path = require('path')

const nodemon = require('nodemon');
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const webConfig = require('./web.config')

const serverConfig = webConfig.serverConfig
const frontConfig = webConfig.frontConfig

let spawnNodemonProcess


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

    log += '\n' + chalk.yellow.bold(` ${ new Array(28 + 1).join('-') } ${ (new Date).toLocaleString() }`) + '\n'

    console.log(log)
}

function serverLog (data, color) {
    let log = ''
    data = data.toString().split(/\r?\n/)
    data.forEach(line => {
        log += `  ${ line }\n`
    })
    if (/[0-9A-z]+/.test(log)) {
        console.log(
            chalk[color].bold('{ Server -------------------') +
            '\n\n' +
            log +
            chalk[color].bold(`---------------------------- }`) +
            '\n'
        )
    }
}

function startFront () {

    const devServerPort = 8090

    const compiler = webpack(frontConfig)

    compiler.hooks.done.tap('done', stats => {
        logStats('Front', stats)
    })

    if (frontConfig.mode === 'production') {

        compiler.watch({
            aggregateTimeout: 300,
            poll: undefined
        }, (err, stats) => {
            if (err) {
                console.log(err)
                return
            }
            logStats('front', stats)
        });

        return;
    }

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


    const server = new WebpackDevServer(compiler,
        {
            contentBase: path.join(__dirname, '../../'),
            quiet: true,
            writeToDisk: true,
            before (app, ctx) {
                app.use(hotMiddleware)
                ctx.middleware.waitUntilValid(() => {
                    console.log('++++++++ WebpackDevServer.start +++++++++++')
                })
            }
        }
    )

    server.listen(devServerPort)
}


function startServer () {

    const compiler = webpack(serverConfig)

    compiler.watch({}, (err, stats) => {
        if (err) {
            console.log(err)
            return
        }
        logStats('server', stats)

        if (spawnNodemonProcess) {
            spawnNodemonProcess.send('restart');
        } else {

            let serverJs = path.resolve(serverConfig.output.path, './server.js')
            spawnNodemonProcess = spawn('nodemon', [serverJs, '--watch', serverJs], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc']
            });

            spawnNodemonProcess.stdout.on('data', data => {
                serverLog(data, 'blue')
            })
            spawnNodemonProcess.stderr.on('data', data => {
                serverLog(data, 'red')
            })

            spawnNodemonProcess.on('message', function (event) {
                if (event.type === 'start') {
                    console.log('nodemon started');
                } else if (event.type === 'crash') {
                    console.error(event)
                    console.log('script crashed for some reason');
                    setTimeout(() => {
                        spawnNodemonProcess = spawn('nodemon', [serverJs, '--watch', serverJs], {
                            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
                        }, 4000);
                    })
                }
            });
        }

    })

}


startFront()

startServer()
