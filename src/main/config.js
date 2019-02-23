/*!
 * Created by j on 2019-02-11.
 */

import path from 'path'

const SERVER_PORT = 3000
//const LOAD_PROTOCOL =  'file:///'
const LOAD_PROTOCOL = `http://localhost:${SERVER_PORT}`

const ROOT_DIR = path.resolve(__dirname, '../../')
const DATA_DIR = path.join(ROOT_DIR, './data/')
const CSD_DIR = path.join(DATA_DIR, './csd/')
const STATIC_DIR = path.join(ROOT_DIR, './static/')

const HTML_DIR = path.resolve(__dirname, './')

export default {
    ROOT_DIR,
    DATA_DIR,
    CSD_DIR,
    STATIC_DIR,
    HTML_DIR,
    LOAD_PROTOCOL,
    SERVER_PORT
}