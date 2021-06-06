/*!
 * Created by j on 2019-02-11.
 */

import path from 'path'
import electron from 'electron'

import jo from '../libs/jsono'

import config from './config.json'

// macOs: /Users/j/dev/shandy/config.json
//const co = jo('E:dev/shandy/config.json')

const SERVER_PORT = 3300
//const LOAD_PROTOCOL =  'file:///'
const LOAD_PROTOCOL = `http://localhost:${SERVER_PORT}`

const ROOT_DIR = path.resolve(__dirname, '../../')
const CSD_DIR = path.resolve(ROOT_DIR, '../csd/')
const DATA_DIR = path.join(ROOT_DIR, './data/')
const STATIC_DIR = path.join(ROOT_DIR, './static/')
const AC_DIR = path.join(ROOT_DIR, './applescript/')
const USER_DIR = path.join(ROOT_DIR, './.user/')
const TEMP_DIR = path.join(ROOT_DIR, './temp/')
const UPLOAD_DIR = path.join(DATA_DIR, './upload/')
const HTML_DIR = path.resolve(ROOT_DIR, './dist/electron/')
const STOCK_IMG_DIR = path.resolve(ROOT_DIR, '../simg/')

let cfg = {
    ...config,
    ROOT_DIR,
    DATA_DIR,
    CSD_DIR,
    STATIC_DIR,
    AC_DIR,
    USER_DIR,
    TEMP_DIR,
    UPLOAD_DIR,
    HTML_DIR,
    LOAD_PROTOCOL,
    SERVER_PORT,
    STOCK_IMG_DIR
}

// main process or render process
if(electron.remote){
    cfg = electron.remote.app.SHARED_CONFIG
}


export default cfg
