/*!
 * Created by j on 2019-02-28.
 */

import electron from 'electron'

const {remote, shell} = electron
const dialog = remote.dialog

import jhandy from 'jhandy'

import Win from './window'
import setting from './setting'

export default {
    open (url) {
        return new Win(url)
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
    }
}