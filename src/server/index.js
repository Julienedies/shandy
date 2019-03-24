/**
 * Created by j on 18/6/17.
 */

import path from 'path'
import http from 'http'
import express from 'express'
import socket from 'socket.io'
import _events from 'events'
import bodyParser from 'body-parser'

import route from './routes/route'

import favicon from '../renderer/img/favicon.ico'

const app = express();
const httpServer = http.Server(app);
const io = socket(httpServer, {
    pingInterval: 1000 * 1000,
    pingTimeout: 1500 * 1000
});

const EventEmitter = _events.EventEmitter;
const events = new EventEmitter();

const staticDir = path.resolve(__dirname, './')
const webStaticDir = path.resolve(__dirname, '../web')

// 上行请求体解析
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//////////////////////////////////////////////////////////////////////////////////////////////

app.get('/set_node_modules_path.js', (req, res) => {
    res.send(`
        try{
            require('module').globalPaths.push('${ path.resolve(__dirname, '../../node_modules') }');
            require('debug-menu').install();
        }catch(err){
            console.log(err);
        }
    `)
})

app.get('/msg', (req, res) =>{
    let info = req.query.info
    console.log('@___________________-____________________@', req.query)
    res.send(`info: ${info}`)
    let msg = ``
    if(info === 'daban'){
        msg = `打板: ${msg} 龙头板吗?  计划内吗?  契合大盘吗? 支撑你的交易逻辑是什么? 打板风险最大, 标的要有最高的确定性! 龙头, 行情阶段, 风险收益比!`
    }
    else if(info === 'buy'){
        msg = `建仓: ${msg} 支撑你的交易逻辑是什么? 你要捕捉的行情是什么? 不要做无计划的交易!`
    }else if( info === 'sell'){
        msg = `平仓: ${msg} 错误的头寸止损越快越好! 正确的头寸不要轻易丧失!`
    }
    io.emit('msg', msg)
})

app.use('/web/', express.static(webStaticDir))
app.use(express.static(staticDir))
app.use(express.static(path.resolve(__dirname, '../z')))

route(app)
//////////////////////////////////////////////////////////////////////////////////////////////

io.on('connection', function (socket) {

    socket.on('disconnect', function () {

    });

    socket.on('cls_news', function (msg) {
        //socket.broadcast.emit('cls_news', msg);
        io.emit('msg', msg);
    });

    socket.on('shandy', function (msg) {
        console.log('socket:', msg);
        let event = msg.event || 'msg';
        events.emit(event, msg);
    });

});


//////////////////////////////////////////////////////////////////////////////////////////////

function F () {
    this.httpServer = httpServer;
    this.io = io;
    this.start = function (port) {
        port = port || 3300
        httpServer.listen(port, function () {
            console.log(`============== server start on port:${ port } ====================`);
        });
    }
    this.close = function () {
        httpServer.close();
    };
    this.push = function (msg) {
        try {
            io.emit('rts_push', msg);
        } catch (err) {
            console.error(err);
        }
    };
}

F.prototype = events;

export default new F()


