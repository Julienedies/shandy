/*!
 * Created by j on 2019-02-11.
 */

import path from 'path'
import electron from 'electron'

import jo from '../libs/jsono'

import config from '/Users/j/dev/shandy/config.json'

const co = jo('/Users/j/dev/shandy/config.json')

const SERVER_PORT = 3000
//const LOAD_PROTOCOL =  'file:///'
const LOAD_PROTOCOL = `http://localhost:${SERVER_PORT}`

const ROOT_DIR = path.resolve(__dirname, '/Users/j/dev/shandy/')
const DATA_DIR = path.join(ROOT_DIR, './data/')
const CSD_DIR = path.join(DATA_DIR, './csd/')
const STATIC_DIR = path.join(ROOT_DIR, './static/')
const AC_DIR = path.join(ROOT_DIR, './applescript/')
const TEMP_DIR = path.join(ROOT_DIR, './temp/')

const HTML_DIR = path.resolve(ROOT_DIR, './dist/electron/')

let cfg = {
    ...config,
    ROOT_DIR,
    DATA_DIR,
    CSD_DIR,
    STATIC_DIR,
    AC_DIR,
    TEMP_DIR,
    HTML_DIR,
    LOAD_PROTOCOL,
    SERVER_PORT
}

// main process or render process
if(electron.remote){
    cfg = electron.remote.app.SHARED_CONFIG
}


export default cfg