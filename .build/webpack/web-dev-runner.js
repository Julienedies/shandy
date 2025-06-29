/*!
 * Created by j on 2019-03-05.
 */

const path = require('path')

//const { spawn } = require('child_process');
const spawn = require('cross-spawn');

const nodemon = require('nodemon');
const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const webConfig = require('./web.config')

const serverConfig = webConfig.serverConfig
const frontConfig = webConfig.frontConfig

let spawnNodemonProcess;


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


// webapck 打包 前端代码
function startFront() {
    
	const devServerPort = 8090; // 这里端口不一样，是为了可以同时跑npm run pro:web 和 npm run dev

	const compiler = webpack(frontConfig);

	compiler.hooks.done.tap("done", (stats) => {
		logStats("Front", stats);
	});

	if (frontConfig.mode === "production") {
		compiler.watch(
			{
				aggregateTimeout: 300,
				poll: undefined,
			},
			(err, stats) => {
				if (err) {
					console.log(err);
					return;
				}
				logStats("front", stats);
			}
		);

		return;
	}

	// 开发 环境
	// const hotMiddleware = webpackHotMiddleware(compiler, {
	//     log: false,
	//     heartbeat: 2500
	// })

	/*compiler.hooks.compilation.tap('compilation', compilation => {
        compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('html-webpack-plugin-after-emit', (data, cb) => {
            hotMiddleware.publish({action: 'reload'})
            cb()
        })
    })*/

	// const server = new WebpackDevServer(compiler,
	//     {
	//         port: 9080,
	//         publicPath: 'locahost:9080', // 静态资源路径
	//         sockPath: '/sockjs-node', // 显式指定 WebSocket 路径
	//         contentBase: path.join(__dirname, '../../'),
	//         quiet: true,
	//         writeToDisk: true,
	//         before (app, ctx) {
	//             app.use(hotMiddleware)
	//             ctx.middleware.waitUntilValid(() => {
	//                 console.log('++++++++ WebpackDevServer.start +++++++++++')
	//             })
	//         }
	//     }
	// )

	// server.listen(devServerPort)

	const server = new WebpackDevServer(
        frontConfig.devServer,
		compiler
	);

	//server.start();
    server.startCallback(() => {
			console.log("Successfully started WebpackDevServer on http://localhost:" + frontConfig.devServer.port);
		});
}


// 服务器端开发，使用webpack打包，通过nodemon观察打包文件变化，重启服务器
function startServer () {

    const compiler = webpack(serverConfig);
    let serverJs = path.resolve(serverConfig.output.path, './server.js');
    
    let nodemonInstance = null;
    let timer;

    compiler.watch({}, (err, stats) => {
        if (err) {
            console.log(err)
            return
        }
        logStats('webpack server', stats)
        
        
         if (nodemonInstance) {
            
            clearTimeout(timer);
            timer = setTimeout(() => {
                nodemonInstance.restart();
            }, 4000)
            
        } else {
            
            nodemonInstance = nodemon({
                script: serverJs,
                //watch: [serverJs],
                stdout: false,
                stderr: false
            });

            nodemonInstance
							.on("start", () => console.log("nodemon started"))
							.on("restart", () => console.log("nodemon Restarted"))
							.on("crash", () => console.log("nodemon crashed"))
							.on("quit", () => {
								console.log("quit");
								process.exit();
							});
        }
        
        nodemonInstance.on("stdout", (data) => {
			serverLog(data, 'blue')
		})

		nodemonInstance.on("stderr", (data) => {
			serverLog(data, 'red')
		})

        // if (spawnNodemonProcess) {
        //     spawnNodemonProcess.send('restart');
        // } else {
        //     // 改为使用本地安装的nodemon
        //     const nodemonPath = path.resolve(__dirname, '../../node_modules', '.bin', 'nodemon');
        //     spawnNodemonProcess = spawn(nodemonPath, [serverJs, '--watch', serverJs], {
        //         stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        //     });

        //     spawnNodemonProcess.stdout.on('data', data => {
        //         serverLog(data, 'blue')
        //     })
        //     spawnNodemonProcess.stderr.on('data', data => {
        //         serverLog(data, 'red')
        //     })

        //     spawnNodemonProcess.on('message', function (event) {
        //         if (event.type === 'start') {
        //             console.log('nodemon started');
        //         } else if (event.type === 'crash') {
        //             console.error(event)
        //             console.log('script crashed for some reason');
        //             setTimeout(() => {
        //                 spawnNodemonProcess = spawn(nodemonPath, [serverJs, '--watch', serverJs], {
        //                     stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        //                 }, 4000);
        //             })
        //         }
        //     });
        // }

    })

}


//startFront();

startServer();
