/*!
 * 封装electron环境api给browser window环境调用
 * webpack构建: renderer环境指定 resolve.alias
 * web环境指定 externals
 * Created by j on 2019-04-04.
 */

// common-stock里使用了electron环境里才能使用的代码，混乱了。@bug:2020-01-27
// @bug:2020-01-27 注意: 当前编译web环境时注释掉 utils.js引用，编译electron环境恢复utils.js 引用

import utils from './utils.js'

export default {
    ...utils,
}
