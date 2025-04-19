/*!
 * Created by j on 2019-03-15.
 */
import path from 'path'

import config from './config'
import jo from './jsono'

/**
 *
 * @param name {String}  json文件名称
 * @returns {Function || Jo}
 */
export default function (name) {

    switch (name) {
        case 'viewer':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./viewer/${ name }.json`), initData)
            }
        case 'viewerMap':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./viewerMap/${ name }.json`), initData)
            }
        case 'images':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./images/${ name }.json`), initData)
            }
        case 'temp':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./temp/${ name }.json`), initData)
            }
        case 'reader':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./reader/${ name }.json`), initData)
            }
        case 'setting':
                return jo(path.resolve(config.USER_DIR, './setting.json'))
        default:
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./${ name }.json`), initData)
            }
    }

}
