/*!
 * Created by j on 2019-02-11.
 */

import path from 'path'

const port = 3000

export default {
    HTML_DIR: path.resolve(__dirname, '../renderer/'),
    //LOAD_PROTOCOL: 'file:///',
    LOAD_PROTOCOL: `http://localhost:3000`,
    SERVER_PORT: port
}