/*!
 * Created by j on 2019-02-06.
 */

process.env.BABEL_ENV = 'renderer'

const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CleanPlugin = require('clean-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin');
const shellPlugin = require('webpack-shell-plugin')
const nodeExternals = require('webpack-node-externals');

const {dependencies} = require('../../package.json')

const isPro = process.env.NODE_ENV === 'production'

const publicPath = ''
const projectRoot = path.resolve(__dirname, '../../')
const outputPath = path.resolve(__dirname, '../../dist/renderer')
const context = path.resolve(__dirname, '../../src')

const nodeSassIncludePaths = [path.resolve(__dirname, '../../')]

let devServer = {}
let cssLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
        publicPath: publicPath
    }
}

if (isPro) {

} else {

    // 添加热模块替换client端脚本
    /*    for (let i in entry) {
            let arr = entry[i]
            arr = Array.isArray(arr) ? arr : [arr]
            arr.push('webpack-hot-middleware/client')
            entry[i] = arr
        }

        plugins.push(new webpack.HotModuleReplacementPlugin())*/

    devServer = {
        publicPath: publicPath,
        contentBase: outputPath,
        hot: true
    }

}

let pages = [
    new HtmlPlugin({
        template: path.resolve(__dirname, '../../src/renderer/pages/index/index.html'),
        filename: 'index.html',
        chunks: ['index'],
        nodeModules: path.resolve(__dirname, '../../node_modules')
    }),
    new HtmlPlugin({
        template: path.resolve(__dirname, '../../src/renderer/pages/viewer/index.html'),
        filename: 'viewer.html',
        chunks: ['viewer']
    }),
    new HtmlPlugin({
        template: path.resolve(__dirname, '../../src/renderer/pages/warn/index.html'),
        filename: 'warn.html',
        chunks: ['warn']
    }),
    new HtmlPlugin({
        template: path.resolve(__dirname, '../../src/renderer/pages/monitor/index.html'),
        filename: 'monitor.html',
        chunks: ['monitor']
    })
]

const plugins = [
    ...pages,
    new webpack.DefinePlugin({}),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ManifestPlugin(),
    new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].css'
    }),
    new CleanPlugin([`dist/renderer`], {
        root: projectRoot
    })
]

const config = {
    mode: 'development',  // 会设置打包文件环境下的 process.env.NODE_ENV
    //devtool: '#cheap-module-eval-source-map',
    devtool: 'cheap-module-source-map',
    target: 'electron-renderer',
    //context: context,  // 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
    entry: {
        index: [path.resolve(__dirname, '../../src/renderer/pages/index/main.js')],
        viewer: [path.resolve(__dirname, '../../src/renderer/pages/viewer/main.js')],
        warn: [path.resolve(__dirname, '../../src/renderer/pages/warn/main.js')],
        monitor: [path.resolve(__dirname, '../../src/renderer/pages/monitor/main.js')]
    },
    output: {
        path: outputPath,
        publicPath: publicPath,
        filename: '[name].js',
        chunkFilename: '[name].js',
        sourceMapFilename: '[file].map',
        libraryTarget: 'commonjs2',
    },
    resolve: {
        alias: {},
        extensions: ['.js', '.json', '.node', '.scss', '.css']
    },
    node: false,
    externals: [
        ...Object.keys(dependencies || {})
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
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'img:data-src', 'audio:src', 'link:href']
                    }
                }
            },
            {
                test: /\.(png|jpg|gif)$/,
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
                test: /\.css$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: '[name].[ext]',
                            outputPath: './css',
                            publicPath: publicPath + 'css/'
                        }
                    }
                ]
            },
            {
                test: [/\.(sa|sc)ss$/, /node_modules\/.+\.css$/],
                use: [
                    cssLoader,
                    {
                        loader: 'css-loader',
                        options: {}
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: nodeSassIncludePaths || ['']
                        }
                    }
                ]
            }
        ]
    },
    plugins: plugins
    /*optimization: {
        splitChunks: {
            chunks: 'all',  // async initial all
            minSize: 30,  // 3k  chunk最小30k以上, 才会分离提取
            minChunks: 1,    // 最少有两次重复引用, 才会分离提取
            maxAsyncRequests: 25,
            maxInitialRequests: 25,
            automaticNameDelimiter: '~',
            name: '',
            cacheGroups: {
                styles: {
                    name: 'brick',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                    priority: 20,
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
    },*/
}


module.exports = config