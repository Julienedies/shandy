/**
 * 包装jsono, 添加data目录前缀
 * Created by j on 2022/2/1.
 */

import path from 'path'

import cfg from './config'
import jo from './jsono'


export default function (name, initData = {}) {

    return jo(path.resolve(cfg.DATA_DIR, `./${ name }.json`), initData);

}
