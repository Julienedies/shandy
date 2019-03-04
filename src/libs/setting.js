/*!
 * Created by j on 2019-03-02.
 */

import path from 'path'

import config from './config'
import jo from './jsono'

export default function () {
    return jo(path.resolve(config.USER_DIR, './setting.json'))
}