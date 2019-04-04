/*!
 * Created by j on 2019-02-28.
 */
import os from 'os'
import electron from 'electron'

const {remote, shell} = electron
const dialog = remote.dialog
import schedule from 'node-schedule'
import jhandy from 'jhandy'

import Win from './window'
import setting from './setting'
import tdx from './tdx'
import ac from './ac'
import stocksManager from './stocks-manager'


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
    timer(time = '8:55', f){
        let [h, m] = time.split(/\D/g).map((v) => v * 1)
        let rule = new schedule.RecurrenceRule()
        rule.dayOfWeek = [0, new schedule.Range(1, 6)]
        rule.hour = h
        rule.minute = m
        return schedule.scheduleJob(rule, function () {
            console.log('timer ', (new Date).toLocaleString())
            f()
        })
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
    activeTdx(){
        tdx.active()
    },
    activeFtnn(){
      ac.activeFtnn()
    },
    viewInFtnn(code){
        tdx.viewInFtnn(code)
    },
    addStock(stock){
        stocksManager.add(stock)
    }

}

