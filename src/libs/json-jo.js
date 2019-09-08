/*!
 * Created by j on 2019-03-15.
 */
import path from 'path'

import config from './config'
import jo from './jsono'

/**
 *
 * @param name {String}  json文件名称
 * @returns {Function}
 */
export default function (name) {

    switch (name) {
        case 'temp':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./temp/${ name }.json`), initData)
            }
        case 'reader':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./reader/${ name }.json`), initData)
            }
        case 'setting':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, './setting.json'))
            }
        default:
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./${ name }.json`), initData)
            }
    }

}
