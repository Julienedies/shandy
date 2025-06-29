/*!
 * Created by j on 2019-02-06.
 */

process.env.BABEL_ENV = 'renderer';

const inlineHtmlLoader = require('./inline-html-loader');
const debugLoader = require('./debug-loader');

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const shellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');

const { VueLoaderPlugin } = require('vue-loader');

const { dependencies } = require('../../package.json');

const isPro = process.env.NODE_ENV === 'production';

const projectRoot = path.resolve(__dirname, '../../');
const context = path.resolve(__dirname, '../../src');
const outputPath = path.resolve(__dirname, '../../dist/electron');
const publicPath = '';

const nodeSassIncludePaths = [path.resolve(__dirname, '../../')];

///////////////////////////////////////////////////////////////////////////////////////////////

const entry = {};

//const entryJs = glob.sync(path.join(context, 'renderer/pages/_test/main.js')) || [];
// 'renderer/pages/+(index|csd|monitor|rp|system|tags|viewer|news|todo|reminder|_test)/**/main.js'
const entryJs =
  glob.sync(
    path.join(
      context,
      'renderer/pages/+(index|tags|viewer|system)/**/main.js'
    )
  ) || [];
  
  //console.log(1111111111, entryJs);
  
/////////////////////////////////////////////////////////////////////////////////////////////////
// html 页面
let pages = entryJs.map((entryJsPath) => {
  let arr = entryJsPath.match(/pages\/(.+)\/main\.js$/i);
  let name = arr[1].replace('/', '_');
  let htmlPath = entryJsPath.replace(/main\.js$/i, 'index.html');
  entry[name] = [entryJsPath];

  return new HtmlPlugin({
    minify: isPro, // 是否启用压缩
    template: htmlPath,
    filename: `${name}.html`,
    chunks: [name],
  });
});

///////////////////////////////////////////////////////////////////////////////////////////////////
// 插件
const plugins = [
  ...pages,
  new webpack.DefinePlugin({
    'process.env.DEV': JSON.stringify(!isPro),
    'process.env.HOT': JSON.stringify(true), // 客户端代码可通过此变量判断 HMR 状态
  }),
  new VueLoaderPlugin(),
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash:8].css',
    chunkFilename: 'css/[id].[contenthash:8].css',
  }),

  new webpack.NoEmitOnErrorsPlugin(),
  new WebpackManifestPlugin(),
  new CleanPlugin([`dist/electron`], {
    root: projectRoot,
  }),
];

///////////////////////////////////////////////////////////////////////////////////////////////////
// 开发环境 或 生产环境
let cssLoader;

if (isPro) {
  plugins.push(
    new MiniCssExtractPlugin({
      filename: 'css/[name]_[hash].css',
      chunkFilename: '[name]_[id].css',
    })
  );

  cssLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: publicPath,
    },
  };
} else {
  cssLoader = {
    loader: 'style-loader',
  };

  // hmr
  let as = [
    // 模块热替换的运行时代码
    'webpack/hot/dev-server.js',
    // 用于 web 套接字传输、热重载逻辑的 web server 客户端
    'webpack-dev-server/client/index.js?hot=true&live-reload=true&port=9080',
  ];
  
  Object.entries(entry).forEach(([k, v]) => {
    v = Array.isArray(v) ? v : [v];
	v = [...as, ...v];
    entry[k] = v;
  });
  // 添加 hmr 插件
  plugins.push(new webpack.HotModuleReplacementPlugin())
}

//console.log(entry)

///////////////////////////////////////////////////////////////////////////////////////////////
// 只有这些会被打包进vendors
let whiteListedModules = [
  "lodash",
  "jquery",
  "vue",
  "@julienedies/brick",
  "echarts",
  "moment",
];

const config = {
	//context,  // 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
	mode: isPro ? "production" : "development", // 会设置打包文件环境下的 process.env.NODE_ENV
	devtool: isPro ? "source-map" : "inline-source-map", // 开发环境（可调试）: 生产环境（生成独立 .map 文件）
	target: "electron-renderer",
	node: false,
	plugins,
	entry,
	output: {
		path: outputPath,
		publicPath: publicPath,
		filename: "[name].js",
		chunkFilename: "[name].js",
		sourceMapFilename: "[file].map",
		libraryTarget: "commonjs2",
	},
	externals: [...Object.keys(dependencies).filter((d) => {
		return d;
		// electron运行的时候，是从node_modules找这些类库的，也就是说node_modules是程序运行的一部分，如果发布的时候不包含node_modules，那么这些都要通过webpack打包进去最终的发布文件
		//return !whiteListedModules.includes(d);
	})],
	resolve: {
		alias: {
			"@fortawesome": path.resolve(projectRoot, "node_modules/@fortawesome"),
			// 主要是为了解决web环境和renderer环境构建兼容性问题
			"e-bridge": path.resolve(projectRoot, "./src/libs/e-bridge.js"),
			//'brick.css': path.resolve(projectRoot, './src/renderer/css/vendor/brick.css'),
		},
		extensions: [".js", ".json", ".node", ".css", ".scss", "vue"],
	},
	resolveLoader: {
		modules: ["node_modules", path.resolve(__dirname, "")], // 添加本地目录解析自定义loader
	},
	stats: {
		children: true, // 显示子编译的详细错误
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				include: path.resolve(__dirname, "../../src"),
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
					},
				],
			},
			{
				test: /\.vue$/,
				loader: "vue-loader",
			},
			{
				test: /\.html$/,
				use: [
					//'debug-loader',
					{
						loader: "html-loader",
						options: {
							minimize: false, // 禁用压缩
							esModule: false, // 确保 html-loader 也不返回 ES Module
							sources: {
								list: [
									// All default supported tags and attributes
									"...",
									{
										tag: "script",
										attribute: "src",
										type: "src",
										filter: (tag, attribute, attributes, resourcePath) => {
											return false; // 不处理script标签
											// 排除 /set_node_modules_path.js
											if (attributes[0].value === "/set_node_modules_path.js") {
												return false; // 不处理这个标签
											}
											return true; // 处理其他 script 标签
										},
									},
									{
										tag: "img",
										attribute: "data-src",
										type: "src",
									},
									{
										tag: "img",
										attribute: "data-srcset",
										type: "srcset",
									},
									{
										// Tag name
										tag: "link",
										// Attribute name
										attribute: "href",
										// Type of processing, can be `src` or `scrset`
										type: "src",
										// Allow to filter some attributes
										filter: (tag, attribute, attributes, resourcePath) => {
											// The `tag` argument contains a name of the HTML tag.
											// The `attribute` argument contains a name of the HTML attribute.
											// The `attributes` argument contains all attributes of the tag.
											// The `resourcePath` argument contains a path to the loaded HTML file.

											try {
												let obj = Object.fromEntries(
													attributes.map((item) => [item.name, item.value])
												);

												// 不处理 <link rel='import' href='include/point.html?__inline'>
												if (obj.rel === "import") {
													return false;
												}
											} catch (err) {
												console.log(err);
												return false;
											}

											//console.log(attributes.value);

											//console.log(obj, JSON.stringify(attributes));
											return true;

											// if (/my-html\.html$/.test(resourcePath)) {
											//   return false;
											// }

											if (!/stylesheet/i.test(attributes.rel)) {
												console.log(attributes.rel);
												return false;
											}

											if (
												attributes.type &&
												attributes.type.trim().toLowerCase() !== "text/css"
											) {
												console.log(attributes.href);
												return false;
											}

											return true;
										},
									},
								],
							},
							postprocessor: (content, loaderContext) => {
								// When you environment supports template literals (using browserslist or options) we will generate code using them
								const isTemplateLiteralSupported = content[0] === "`";

								return content;

								// return content
								//   .replace(/<%=/g, isTemplateLiteralSupported ? `\${` : '' +')
								//   .replace(/%>/g, isTemplateLiteralSupported ? '}' : '+ '');
							},
							preprocessor: (content, loaderContext) => {
								// console.log(11111111111111111, loaderContext);
								let sourceHtmlPath = loaderContext.resource;
								let sourceDir = path.dirname(sourceHtmlPath);

								let result = content.replace(
									/\${ *require\([''](.*?)['']\) *}/g,
									(match, _path) => {
										let fullPath = path.resolve(sourceDir, _path);
										return fs.readFileSync(fullPath, "utf8");
									}
								);

								return result.replace(
									/<link\s+rel='import'\s+href='([^']+)'\s*\/?>/g,
									(match, _path) => {
										let fullPath = path.resolve(sourceDir, _path);
										return fs.readFileSync(fullPath, "utf8");
									}
								);
							},
						},
					},
				],
			},
			{
				test: /\.css$/,
				exclude: [
					/node_modules/,
					/[\\/]vendor[\\/]/, // 匹配任何层级的 `vendor` 目录
				],
				use: [
					cssLoader,
					{
						loader: "css-loader",
						options: {
							url: true, // 启用 url() 处理
							esModule: false,
							//import: false,  // 禁用 @import 解析
							//modules: false  // 禁用 CSS Modules
						},
					},
				],
			},
			{
				// ###  通过 import 方式引入的css， 必须通过MiniCssExtractPlugin方式才会注入到html， 使用file-loader,则需自己通过link的方式写入html   #####
				test: /[\\/]vendor[\\/].+\.css$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "./css",
							publicPath: publicPath + "css/",
							esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
						},
					},
					{ loader: "extract-loader" },
					{
						loader: "css-loader",
						options: {
							//import: false, // 禁用 @import 解析
							modules: false, // 禁用 CSS Modules
							url: true, // 启用 url() 处理
							esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
						},
					},
				],
			},
			{
				test: [/[\\/]node_modules[\\/].+\.css$/],
				use: [
					// {
					// 	loader: 'file-loader',
					// 	options: {
					// 		name: '[name]_[contenthash].[ext]',
					// 		outputPath: './css',
					// 		publicPath: publicPath + 'css/',
					// 		esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
					// 	},
					// },
					// { loader: 'extract-loader' },
					// ###  通过 import 方式引入的css， 必须通过MiniCssExtractPlugin方式才会注入到html， 使用file-loader,则需自己通过link的方式写入html   #####
					cssLoader,
					{
						loader: "css-loader",
						options: {
							url: true,
							modules: false,
							esModule: false, // 禁用 ES Module，改用 CommonJS
						},
					},
				],
			},
			{
				test: [/\.s[ac]ss$/],
				include: path.resolve(__dirname, "../../src/renderer"),
				use: [
					cssLoader,
					{
						loader: "css-loader",
						options: {
							url: true,
							modules: false,
							esModule: false, // 禁用 ES Module，改用 CommonJS
						},
					},
					{
						loader: "sass-loader",
						options: {
							sassOptions: {
								includePaths: nodeSassIncludePaths || [""],
								quietDeps: true, // 静默弃用警告
							},
						},
					},
				],
			},
			{
				test: /\.(png|jpg|gif|ico)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[hash].[ext]",
							outputPath: "./img",
							publicPath: publicPath + "img/",
							esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
						},
					},
				],
			},
			{
				test: /\.(m4a|mp3)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name].[ext]",
							outputPath: "./media",
							publicPath: publicPath + "media/",
							esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
						},
					},
				],
			},
			{
				test: /\.(svg|woff2?|eot|ttf)$/,
				// type: 'asset/resource',
				// generator: {
				//   filename: 'fonts/[hash][ext][query]',
				// },
				use: [
					{
						loader: "file-loader",
						options: {
							name: "[name]_[contenthash].[ext]",
							outputPath: "./fonts",
							publicPath: publicPath + "/fonts/",
							esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
						},
					},
				],
				// use: [
				//   {
				//       loader: 'url-loader',
				//       options: {
				//           limit: 1024,
				//           name: '[name].[ext]',
				//           outputPath: './fonts',
				//           publicPath: publicPath + '/fonts/'
				//       }
				//   }
				// ],
			},
		],
	},
	optimization: {
		//splitChunks: false, // 禁用默认的代码拆分（防止公共依赖合并）
		runtimeChunk: "single",
		splitChunks: {
			// name: (module, chunk) => {
			// 	console.log(3333333, module, chunk);
			// 	return +new Date()+'';
			// },
			chunks: "all", // async initial all
			maxSize: 244 * 1024, // 超过 244KB 自动拆分
			minSize: 30 * 1024, // 30k  规定 新拆出的 chunk 的最小体积，小于此值的模块不会被拆分。
			minChunks: 2, // 最少有两次重复引用, 才会被提取到公共 chunk
			maxAsyncRequests: 6, // 每个异步加载模块最多能被拆分的数量
			maxInitialRequests: 25,
			maxInitialRequests: 6, // 每个入口和它的同步依赖最多能被拆分的数量
			enforceSizeThreshold: 50000, // 强制执行拆分的体积阈值并忽略其他限制
			automaticNameDelimiter: "~",

			cacheGroups: {
				// styles: {
				// 	name: "vendor",
				// 	test: /[\\/]node_modules[\\/].+\.css$/,
				// 	chunks: "all",
				// 	enforce: true,
				// 	priority: 70,
				// 	filename: "css/vendors/[name].css", // ← 单独指定路径
				// },
				jquery: {
					test: /[\\/]node_modules[\\/](jquery)[\\/]/,
					name: "jquery",
					enforce: true, // 忽略其他限制强制拆分
					chunks: "all",
					priority: 50,
					filename: "js/vendors/jquery.js", // ← 单独指定路径
				},
				lodash: {
					test: /[\\/]node_modules[\\/](lodash)[\\/]/,
					name: "lodash",
					enforce: true, // 忽略其他限制强制拆分
					chunks: "all",
					priority: 48,
					filename: "js/vendors/lodash.js", // ← 单独指定路径
				},
				vue: {
					test: /[\\/]node_modules[\\/](@?vue)[\\/]/,
					name: "vue",
					enforce: true, // 忽略其他限制强制拆分
					chunks: "all",
					priority: 45,
					filename: "js/vendors/[name].[contenthash:8].js", // ← 单独指定路径
				},
				brick: {
					test: /[\\/]node_modules[\\/](@julienedies)[\\/].+\.(js)$/,
					name: "brick",
					enforce: true, // 忽略其他限制强制拆分
					chunks: "all",
					priority: 42,
					filename: "js/vendors/[name].[contenthash:8].js", // ← 单独指定路径
				},
				echarts: {
					test: /[\\/]node_modules[\\/](echarts)[\\/]/,
					name: "echarts",
					enforce: true, // 忽略其他限制强制拆分
					chunks: "all",
					priority: 9,
					filename: "js/vendors/[name].[contenthash:8].js", // ← 单独指定路径
				},
				moment: {
					test: /[\\/]node_modules[\\/](moment)[\\/]/,
					name: "moment",
					enforce: true, // 忽略其他限制强制拆分
					chunks: "all",
					priority: 7,
					filename: "js/vendors/[name].[contenthash:8].js", // ← 单独指定路径
				},
				common: {
					name: "common",
					minChunks: 2,
					chunks: "all",
					priority: 10,
					minSize: 3 * 1024,
					reuseExistingChunk: true, // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
				},
			},
		},
	},
};



module.exports = config;
