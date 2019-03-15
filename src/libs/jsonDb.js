/*!
 * Created by j on 2019-03-15.
 */
import path from 'path'

import config from './config'
import jo from './jsono'

export default function (name) {

    switch (name) {
        case 'temp':
            return (name, initData) => {
                return jo(path.resolve(config.USER_DIR, `./temp/${ name }.json`), initData)
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