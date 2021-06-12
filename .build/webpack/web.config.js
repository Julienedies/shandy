/*!
 * Created by j on 2019-02-11.
 */

process.env.BABEL_ENV = 'web'

const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ManifestPlugin = require('webpack-manifest-plugin')
const CleanPlugin = require('clean-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const shellPlugin = require('webpack-shell-plugin')

const {dependencies} = require('../../package.json')

const isPro = process.env.NODE_ENV === 'production'

const nodeSassIncludePaths = [path.resolve(__dirname, '../../')]

const projectRoot = path.resolve(__dirname, '../../')
const context = path.resolve(__dirname, '../../src')
const outputPath = path.resolve(__dirname, '../../dist/web/')
const publicPath = ''

///////////////////////////////////////////////////////////////////////////////////////////////

const entry = {}

const entryJs = glob.sync(path.join(context, 'renderer/pages/+(stock|monitor|note)/**/main.js')) || []

let pages = entryJs.map((entryJsPath) => {
    let arr = entryJsPath.match(/pages\/(.+)\/main\.js$/i)
    let name = arr[1].replace(/\//g, '_')
    let htmlPath = entryJsPath.replace(/main\.js$/i, 'index.html')

    entry[name] = [entryJsPath]

    return new HtmlPlugin({
        template: htmlPath,
        filename: `${ name }.html`,
        chunks: ['runtime', 'vendors', 'common', name],
    })
})


const plugins = [
    ...pages,
    new webpack.DefinePlugin({
        'process.env.DEV': JSON.stringify(!isPro),
    }),
    //new webpack.NoEmitOnErrorsPlugin(),  // 有错误的话就不输出编译文件
    new ManifestPlugin(),
    new CleanPlugin([`dist/web`], {
        root: projectRoot
    })
]

const devServerPort = 8090
let devServer = {}

let cssLoader


if (isPro) {

    cssLoader = {
        loader: MiniCssExtractPlugin.loader,
        options: {
            publicPath: publicPath
        }
    }

    plugins.push(new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].css'
    }))

} else {

    cssLoader = {
        loader: 'style-loader'
    }

    // hmr
    Object.entries(entry).forEach(([k, v]) => {
        v = Array.isArray(v) ? v : [v]
        v.push(`webpack-hot-middleware/client?noInfo=true&reload=true&path=http://localhost:${ devServerPort }/__webpack_hmr`)
        // v.unshift(`webpack-dev-server/client?http://localhost:${ devServerPort }/`)
        entry[k] = v
    })
    plugins.push(new webpack.HotModuleReplacementPlugin())

    /*    devServer = {
            publicPath: publicPath,
            contentBase: outputPath,
            port: devServerPort,
            writeToDisk: true,
            quiet: false,
            hot: true,
            disableHostCheck: true
        }*/

}

///////////////////////////////////////////////////////////////////////////////////////////////
let whiteListedModules = ['lodash', 'jquery', '@julienedies/brick', 'echarts', 'moment']

const frontConfig = {
    name: 'frontend',
    //context,  // 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
    mode: isPro ? 'production' : 'development',
    devtool: isPro ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
    target: 'web',
    entry,
    output: {
        path: outputPath,
        publicPath: publicPath,
        filename: '[name].js',
        chunkFilename: '[name].js',
        sourceMapFilename: '[file].map',
    },
    plugins,
    devServer,
    resolve: {
        alias: {},
        extensions: ['.js', '.json', '.node', '.scss', '.css']
    },
    externals: [
        ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d)),
        // 主要是为了解决web环境和renderer环境构建兼容性问题
        {
            'e-bridge': {
                root: 'electronBridge'
            }
        }
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ]
            },
            {
                test: /\.html$/,
                use: [{
                    loader: 'html-loader',
                    options: {
                        interpolate: true,
                        attrs: ['img:src', 'img:data-src', 'audio:src', 'link:href']
                    }
                }
                ]
            },
            {
                test: /entry-html-test.html$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[path][name].[ext]',
                            //outputPath: './html',
                            //publicPath: publicPath + 'html/'
                        }
                    },
                    {loader: "extract-loader"},
                    {
                        loader: "html-loader",
                        options: {
                            interpolate: true,
                            attrs: ["img:src", "link:href", "script:src"]
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[name].[ext]',
                            outputPath: './css',
                            publicPath: publicPath + 'css/'
                        }
                    },
                    {loader: "extract-loader"},
                    {
                        loader: 'css-loader',
                        options: {
                            url: true,
                            modules: false
                        }
                    },
                ]
            },
            {
                test: [/\.(sa|sc)ss$/, /node_modules.+\.css$/],
                use: [
                    cssLoader,
                    {
                        loader: 'css-loader',
                        options: {
                            url: true,
                            modules:false
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: nodeSassIncludePaths || ['']
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|ico)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[hash].[ext]',
                            outputPath: './img',
                            publicPath: publicPath + 'img/'
                        }
                    }
                ]
            },
            {
                test: /\.(svg|woff2?|eot|ttf)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1024,
                            name: '[name].[ext]',
                            outputPath: './fonts',
                            publicPath: publicPath + '/fonts/'
                        }
                    }
                ]
            },
        ]
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',  // async initial all
            minSize: 30000,  // 3k  chunk最小30k以上, 才会分离提取
            minChunks: 3,    // 最少有两次重复引用, 才会分离提取
            maxAsyncRequests: 15,
            maxInitialRequests: 15,
            automaticNameDelimiter: '~',
            name: 'common',
            cacheGroups: {
                /*                styles: {
                                    name: 'styles',
                                    test: /\.css$/,
                                    chunks: 'all',
                                    enforce: true,
                                    priority: 20,
                                },*/
                vendors: {
                    name: 'vendors',
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'all',
                    minChunks: 1,
                    minSize: 3000,
                    priority: 100
                },
                common: {
                    name: 'all',
                    test: /\.zzz/,
                    minChunks: 2,
                    chunks: 'async',
                    priority: 10,
                    minSize: 30000,
                    reuseExistingChunk: true // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
                }
            }
        }
    },
}

const serverConfig = {
    name: 'server',
    mode: isPro ? 'production' : 'development',
    devtool: 'cheap-module-source-map',
    target: 'node',
    entry: {
        server: [path.join(__dirname, '../../src/server/server.js')]
    },
    output: {
        path: outputPath,
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },
    externals: [
        ...Object.keys(dependencies || {})
    ],
    plugins: [
        //new webpack.NoEmitOnErrorsPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: {
                    loader: 'eslint-loader',
                    options: {
                        // formatter: require('eslint-friendly-formatter')
                    }
                }
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.(ico)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[name].[ext]',
                            outputPath: './',
                            publicPath: publicPath + ''
                        }
                    }
                ]
            },
        ]
    },
    node: false,
    resolve: {
        extensions: ['.js', '.json', '.node']
    }
}


module.exports = {
    frontConfig,
    serverConfig
}
