/*!
 * setting json read and write;
 * Created by j on 2019-03-02.
 */

import path from 'path'

import jo from './jsono'
import config from './config'

const setting = jo(path.resolve(config.USER_DIR, './setting.json'));

export default setting;
