/*!
 * Created by j on 2019-02-28.
 */
import os from 'os'
import electron from 'electron'

const {remote, shell} = electron
const dialog = remote.dialog

import jhandy from 'jhandy'

import Win from './window'
import setting from './setting'
import tdx from './tdx'


export default {
    open (option) {
        return new Win(option)
    },
    openItem (file) {
        shell.openItem(file)
    },
    fetch (csdPath, index, watcher) {
        return jhandy.fetch(csdPath, null, index, null, watcher)
    },
    setting () {
        return setting()
    },
    select () {
        return dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']})
    },
    msg (msg, title = '') {
        dialog.showMessageBox({type: 'info', title, message: msg}, (res) => {
            console.log(res)
        })
    },
    err(msg, title = ''){
        dialog.showErrorBox(title, msg)
    },
    getIp(){
        let ip
        try {
            let networkInterfaces = os.networkInterfaces()
            ip = networkInterfaces.en0[0].address
        } catch (e) {
            console.log('ip address 获取失败. =>', e)
        }
        return ip
    },
    viewInFtnn(code){
        tdx.viewInFtnn(code)
    }
}

