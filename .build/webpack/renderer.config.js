/*!
 * Created by j on 2019-02-06.
 */

process.env.BABEL_ENV = 'renderer'

const inlineHtmlLoader = require('./inline-html-loader')

const path = require('path')
const glob = require('glob')
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

const entryHtml = glob.sync(path.join(context, 'renderer/pages/+(Xnote)/**index.html')) || []
const entryJsHtml = glob.sync(path.join(context, 'renderer/pages/!(stock|note)/**index.html')) || []
const entryJs = glob.sync(path.join(context, 'renderer/pages/!(stock)/**main.js')) || []

const entry = {}

let pages = entryJs.map((entryJsPath) => {
    let arr = entryJsPath.match(/pages\/(.+)\/main\.js$/i)
    let name = arr[1].replace('/', '_')
    let htmlPath = entryJsPath.replace(/main\.js$/i, 'index.html')

    entry[name] = [entryJsPath]

    return new HtmlPlugin({
        template: htmlPath,
        filename: `${ name }.html`,
        chunks: [name],
    })
})
entryHtml.forEach((htmlPath) => {
    let arr = htmlPath.match(/renderer\/pages\/((.+)\/index\.html)$/)
    let name = arr[1]
    //entry[name] = htmlPath
})

console.log(entryHtml)
//console.log(pages)

const plugins = [
    ...pages,
    new webpack.DefinePlugin({}),
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


let cssLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
        publicPath: publicPath
    }
}

if (isPro) {


} else {
    // hmr
    Object.entries(entry).forEach(([k, v]) => {
        v = Array.isArray(v) ? v : [v]
        v.push('webpack-hot-middleware/client?noInfo=true&reload=true&path=http://localhost:9080/__webpack_hmr')
        entry[k] = v
    })
    plugins.push(new webpack.HotModuleReplacementPlugin())
}


console.log(entry)

const config = {
    //context,  // 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
    mode: isPro ? 'production' : 'development',  // 会设置打包文件环境下的 process.env.NODE_ENV
    //devtool: '#cheap-module-eval-source-map',
    devtool: 'cheap-module-source-map',
    target: 'electron-renderer',
    entry,
    output: {
        path: outputPath,
        publicPath: publicPath,
        filename: '[name].js',
        chunkFilename: '[name].js',
        sourceMapFilename: '[file].map',
        libraryTarget: 'commonjs2',
    },
    node: false,
    plugins,
    resolve: {
        alias: {},
        extensions: ['.js', '.json', '.node', '.scss', '.css']
    },
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
                use: [{
                    loader: 'html-loader',
                    options: {
                        interpolate: true,
                        attrs: ['img:src', 'img:data-src', 'audio:src', 'link:href']
                    }
                },
                    //inlineHtmlLoader
                ]
            },
            {
                test: entryHtml,
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
                    },
                    //inlineHtmlLoader
                ]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    //cssLoader,
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
                        }
                    },
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