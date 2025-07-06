/*!
 * setting json read and write;
 * Created by j on 2019-03-02.
 */

import path from 'path'

import jo from './jsono'
import config from './config'

let settingJsonPath = path.resolve(config.USER_DIR, './setting.json');

const setting = jo(settingJsonPath);

export default setting;
