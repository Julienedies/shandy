/**
 * Created by j on 18/8/13.
 * 管理个股自定义数据
 */

import path from 'path'

import jo from './jsono'
import config from './config'

const basePath = path.resolve(config.DATA_DIR, './csd/s/');

export default function (code) {
    let jsonPath = path.join(basePath, `./${ code }.json`);
    return jo(jsonPath);
}