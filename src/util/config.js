/*!
 *  shared data between main and renderer process
 * Created by j on 2019-02-11.
 */

import electron from 'electron'

const config = electron.remote.app.shared_config

export default config