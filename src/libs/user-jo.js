/*!
 * 包装jsono, 添加user目录前缀
 * Created by j on 2019-03-04.
 */

import path from 'path'

import cfg from './config'
import jo from './jsono'


export default function (name, initData = {}) {

    return jo(path.resolve(cfg.USER_DIR, `./${ name }.json`), initData);

}
