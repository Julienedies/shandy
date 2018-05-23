/**
 * Created by j on 18/5/22.
 */

const electron = require('electron')

const desktopCapturer = electron.desktopCapturer
const electronScreen = electron.screen
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer

const fs = require('fs')
const os = require('os')
const path = require('path')
var https = require('https')
var qs = require('querystring')

const stocks = require('../stocks.json')
const config = require('../config.json')

let {sw, sh} = electronScreen.getPrimaryDisplay().workAreaSize

// 实际是 1480 * 820
let win = new BrowserWindow({ width: 1340, height:820, x: 100, y:0 })
win.on('close', function () { win = null })
win.loadURL('http://basic.10jqka.com.cn/000001/');
win.show()

//let dom_message = document.querySelector('#message');
let dom_canvas = document.getElementById('canvas');

function drawImage(dataUrl){
    var ctx = dom_canvas.getContext("2d");
    var image = new Image();
    image.onload = function() {
        ctx.drawImage(image, 0, 0);
    };
    image.src = dataUrl;
}

function determineScreenShotSize() {
    const screenSize = electronScreen.getPrimaryDisplay().workAreaSize
    const maxDimension = Math.max(screenSize.width, screenSize.height)
    return {
        width: maxDimension * window.devicePixelRatio,
        height: maxDimension * window.devicePixelRatio
    }
}

// 截图
function screenshot() {
    const thumbSize = determineScreenShotSize()
    let options = {types: ['screen'], thumbnailSize: thumbSize}

    console.log(thumbSize)

    desktopCapturer.getSources(options, function (error, sources) {

        if (error) return console.log(error)

        sources.forEach(function (source) {

            console.log(source);

            if (source.name === 'Entire screen' || source.name === 'Screen 2') {

                const screenshotPath = path.join(os.tmpdir(), source.name + '.png')

                let dataUrl = source.thumbnail.crop({x: 2372,y: 88, width: 200,height: 42}).toDataURL()
                let base64 = dataUrl.replace('data:image/png;base64,','')
                //let image = fs.readFileSync(screenshotPath).toString('base64');

                drawImage(dataUrl);

                (function(){

                    let param = qs.stringify({
                        'access_token': config.api.baidu.ocr.access_token
                    })

                    let postData = qs.stringify({
                        image : base64
                    })

                    let options = {
                        hostname: 'aip.baidubce.com',
                        //path: '/rest/2.0/ocr/v1/general_basic?' + param,
                        path: '/rest/2.0/ocr/v1/webimage?'+ param,
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
                    }

                    let req = https.request(options, function (res) {
                            //res.pipe(process.stdout);
                            let str = ''
                            res.on('data', function (chunk) {
                                str += chunk
                            })

                            res.on('end', function () {
                                console.log(str)
                                let obj = JSON.parse(str)
                                str = obj.words_result[0].words
                                let matchs = str.match(/[\u4e00-\u9fa5]+[A]?(\d{6})/) || ['', '']
                                console.log(matchs)
                                let code = matchs[1]
                                win.loadURL('http://basic.10jqka.com.cn/*/'.replace('*', code ))
                                //win.focus()
                            })

                        }
                    )
                    // 携带数据发送https请求
                    req.write(postData);
                    req.end();

                })()

              /*  fs.writeFile(screenshotPath, source.thumbnail.crop({x: 2350,y: 88, width: 260,height: 42}).toPNG(), function (error) {
                    if (error) return console.log(error)
                    console.log(screenshotPath);
                })*/

            }
        })
    })

}

// 接收主进程发来的按下截图快捷键消息
ipc.on('screenshot', function (event, arg) {
    console.log(arg)
    const message = `异步消息回复: ${arg}`
    screenshot()
})




