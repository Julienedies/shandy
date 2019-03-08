/*!
 * Created by j on 2019-03-04.
 */

import path from 'path'

import config from './config'
import jo from './jsono'

export default function (name, initData) {

    return jo(path.resolve(config.USER_DIR, `./${ name }.json`), initData)

}