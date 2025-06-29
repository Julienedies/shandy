/*!
 * Created by j on 2019-02-11.
 */

process.env.BABEL_ENV = "web";

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const webpack = require("webpack");
const HtmlPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanPlugin = require("clean-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");
const shellPlugin = require("webpack-shell-plugin");

const { VueLoaderPlugin } = require("vue-loader");

const { dependencies } = require("../../package.json");

const isPro = process.env.NODE_ENV === "production";

const nodeSassIncludePaths = [path.resolve(__dirname, "../../")];

const projectRoot = path.resolve(__dirname, "../../");
const context = path.resolve(__dirname, "../../src");
const outputPath = path.resolve(__dirname, "../../dist/web/");
const publicPath = "";

///////////////////////////////////////////////////////////////////////////////////////////////

const entry = {};

//const entryJs = glob.sync(path.join(context, 'renderer/pages/+(stock|monitor|note|rp|rp2|system2|tags2|_test)/**/main.js')) || []
const entryJs =
  glob.sync(
    path.join(
      context,
      "renderer/pages/+(stock|monitor|note|rp|rp2|system2|tags2|_test)/**/main.js"
    )
  ) || [];

let pages = entryJs.map((entryJsPath) => {
  let arr = entryJsPath.match(/pages\/(.+)\/main\.js$/i);
  let name = arr[1].replace(/\//g, "_");
  let htmlPath = entryJsPath.replace(/main\.js$/i, "index.html");

  entry[name] = [entryJsPath];

  return new HtmlPlugin({
    minify: false, // 禁用压缩
    template: htmlPath,
    filename: `${name}.html`,
    chunks: ["runtime", "vendors", "common", name],
  });
});

const plugins = [
  ...pages,
  new VueLoaderPlugin(),
  new webpack.DefinePlugin({
    "process.env.DEV": JSON.stringify(!isPro),
  }),
  new WebpackManifestPlugin(),

  new CleanPlugin([`dist/web`], {
    root: projectRoot,
  }),
];

const devServerPort = 8090;
let devServer = {};

let cssLoader;

if (isPro) {
  cssLoader = {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: publicPath,
    },
  };

  plugins.push(
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].css",
    })
  );
} else {
  cssLoader = {
    loader: "vue-style-loader",
  };

  // hmr
  Object.entries(entry).forEach(([k, v]) => {
    v = Array.isArray(v) ? v : [v];
    v.push(
      `webpack-hot-middleware/client?noInfo=true&reload=true&path=http://localhost:${devServerPort}/__webpack_hmr`
    );
    // v.unshift(`webpack-dev-server/client?http://localhost:${ devServerPort }/`)
    entry[k] = v;
  });
  plugins.push(new webpack.HotModuleReplacementPlugin());

  /*devServer = {
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
// 只有这些会被打包进vendors
let whiteListedModules = [
  "lodash",
  "jquery",
  "vue",
  "@julienedies/brick",
  "echarts",
  "moment",
];

// web客户端配置， 对应的还有web server 端配置在下面
const frontConfig = {
  name: "frontend",
  //context,  // 基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
  mode: isPro ? "production" : "development",
  devtool: isPro ? "source-map" : "inline-source-map", // 开发环境（可调试）: 生产环境（生成独立 .map 文件）
  target: "web",
  entry,
  output: {
    path: outputPath,
    publicPath: publicPath,
    filename: "[name].js",        // 用于指定入口 chunk（entry chunk）的输出文件名
    chunkFilename: "chunks/[name].js",   // 用于指定非入口 chunk（non-entry chunk）的输出文件名
    sourceMapFilename: "[file].map",
  },
  plugins,
  devServer,
  resolve: {
    alias: {
      "@fortawesome": path.resolve(projectRoot, "node_modules/@fortawesome"),
    },
    extensions: [".js", ".json", ".node", ".scss", ".css", "vue"],
  },
  // 定义外部类库，不参与打包
  externals: [
    ...Object.keys(dependencies || {}).filter(
      (d) => !whiteListedModules.includes(d)
    ),
    // 主要是为了解决web环境和renderer环境构建兼容性问题
    {
      "e-bridge": {
        root: "electronBridge",
      },
    },
  ],
  stats: {
    children: true, // 显示子编译的详细错误
  },
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "")], // 自定义loader解析目录，添加本地目录
  },
  module: {
    rules: [
      {
        test: /\.js$/,
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
          //"debug-loader",
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
                      // console.log(
                      //   "不处理：/set_node_modules_path.js",
                      //   attributes,
                      //   resourcePath
                      // );
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

                      let obj = Object.fromEntries(
                        attributes.map((item) => [item.name, item.value])
                      );

                      // 不处理 <link rel="import" href="include/point.html?__inline">
                      if (obj.rel === "import") {
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
                //   .replace(/<%=/g, isTemplateLiteralSupported ? `\${` : '" +')
                //   .replace(/%>/g, isTemplateLiteralSupported ? "}" : '+ "');
              },
              preprocessor: (content, loaderContext) => {
                // console.log(11111111111111111, loaderContext);
                let sourceHtmlPath = loaderContext.resource;
                let sourceDir = path.dirname(sourceHtmlPath);

                let result = content.replace(
                  /\${ *require\(['"](.*?)['"]\) *}/g,
                  (match, _path) => {
                    let fullPath = path.resolve(sourceDir, _path);
                    //console.log(2222222222222222222222222, fullPath);
                    return fs.readFileSync(fullPath, "utf8");
                  }
                );

                return result.replace(
                  /<link\s+rel="import"\s+href="([^"]+)"\s*\/?>/g,
                  (match, _path) => {
                    let fullPath = path.resolve(sourceDir, _path);
                    // console.log(2222222222222222222222222, fullPath);
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
              url: true,
              modules: false,
              esModule: false, // 禁用 ES Module，改用 CommonJS
            },
          },
        ],
      },
      {
        test: [/node_modules.+\.css$/],
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
        ],
      },
      {
        test: [/\.s[ac]ss$/],
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
                //quietDeps: true, // 静默弃用警告
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
        test: /\.(svg|woff2?|eot|ttf)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name]_[contenthash].[ext]",
              outputPath: "./fonts",
              publicPath: publicPath + "fonts/",
              esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
            },
          },
        ],
      },
      // {
      //   test: /\.(svg|woff2?|eot|ttf)$/,
      //   use: [
      //     {
      //       loader: "url-loader",
      //       options: {
      //         limit: 1024,
      //         name: "[name].[ext]",
      //         outputPath: "./fonts",
      //         publicPath: publicPath + "/fonts/",
      //         esModule: false, // 关键！禁用 ES 模块导出，避免 [object Module]
      //       },
      //     },
      //   ],
      // },
    ],
  },
  optimization: {
    runtimeChunk: "single",
    splitChunks: {
      chunks: "all", // async initial all
      maxSize: 244 * 1024, // 超过 244KB 自动拆分
      minSize: 30 * 1024, // 30k  chunk最小30k以上, 才会分离提取
      minChunks: 1, // 最少有两次重复引用, 才会分离提取
      maxAsyncRequests: 15,
      maxInitialRequests: 15,
      automaticNameDelimiter: "~",
      cacheGroups: {
        /*                styles: {
                                    name: 'styles',
                                    test: /\.css$/,
                                    chunks: 'all',
                                    enforce: true,
                                    priority: 20,
                                },
                                */
        // 默认node_modules处理 - 最低优先级
        // vendors: {
        //   test: /[\\/]node_modules[\\/]/,
        //   name: "vendors",
        //   priority: 0,
        // },
        // "lodash", "jquery", "vue", "@julienedies/brick","echarts", "moment",     
        jquery: {
          test: /[\\/]node_modules[\\/](jquery)[\\/]/,
          name: "jquery",
          enforce: true, // 忽略其他限制强制拆分
          chunks: "all",
          priority: 50,
          filename: 'js/vendors/jquery.js' // ← 单独指定路径
        },
        lodash: {
          test: /[\\/]node_modules[\\/](lodash)[\\/]/,
          name: "lodash",
          enforce: true, // 忽略其他限制强制拆分
          chunks: "all",
          priority: 48,
          filename: 'js/vendors/lodash.js' // ← 单独指定路径
        },
        vue: {
          test: /[\\/]node_modules[\\/](@?vue)[\\/]/,
          name: "vue",
          chunks: "all",
          priority: 45,
          filename: 'js/vendors/[name].[contenthash:8].js' // ← 单独指定路径
        },
        brick: {
          test: /[\\/]node_modules[\\/](@julienedies)[\\/]/,
          name: "brick",
          enforce: true, // 忽略其他限制强制拆分
          chunks: "all",
          priority: 42,
          filename: 'js/vendors/[name].js' // ← 单独指定路径
        },
        echarts: {
          test: /[\\/]node_modules[\\/](echarts)[\\/]/,
          name: "echarts",
          enforce: true, // 忽略其他限制强制拆分
          chunks: "all",
          priority: 9,
          filename: 'js/vendors/[name].[contenthash:8].js' // ← 单独指定路径
        },
        moment: {
          test: /[\\/]node_modules[\\/](moment)[\\/]/,
          name: "moment",
          enforce: true, // 忽略其他限制强制拆分
          chunks: "all",
          priority: 7,
          filename: 'js/vendors/[name].[contenthash:8].js' // ← 单独指定路径
        },

        xxx: {
          name: "all",
          test: /\.zzz/,
          minChunks: 2,
          chunks: "async",
          priority: 10,
          minSize: 30000,
          reuseExistingChunk: true, // 表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
        },
      },
    },
  },
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// 服务器端 配置
const serverConfig = {
  name: "server",
  mode: isPro ? "production" : "development",
  devtool: isPro ? "source-map" : "inline-source-map", // 开发环境（可调试）: 生产环境（生成独立 .map 文件）
  target: "node",
  entry: {
    server: [path.join(__dirname, "../../src/server/server.js")],
  },
  output: {
    path: outputPath,
    filename: "[name].js",
    libraryTarget: "commonjs2",
  },
  externals: [...Object.keys(dependencies || {})],
  plugins: [
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        enforce: "pre",
        exclude: /node_modules/,
        use: {
          // loader: "eslint-loader",
          // options: {
          //   // formatter: require('eslint-friendly-formatter')
          // },
        },
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: "node-loader",
      },
      {
        test: /\.(ico)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "./",
              publicPath: publicPath + "",
            },
          },
        ],
      },
    ],
  },
  node: false,
  resolve: {
    extensions: [".js", ".json", ".node"],
  },
};

////////////////////////////////////////////////////////////////////////////////////////////////////////
// 导出配置
module.exports = {
  frontConfig,
  serverConfig,
};
