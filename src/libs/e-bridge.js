/*!
 * 封装electron环境api给browser window环境调用
 * webpack构建: renderer环境指定 resolve.alias
 * web环境指定 externals
 * Created by j on 2019-04-04.
 */

import utils from './utils.js'

export default {
    ...utils,
}
