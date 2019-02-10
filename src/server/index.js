/**
 * Created by j on 18/6/17.
 */

import path from 'path'
import http from 'http'

import express from 'express'
import socket from 'socket.io'

import config from '../../config.json'

const app = express();
const httpServer = http.Server(app);
const io = socket(httpServer, {
    pingInterval: 1000 * 1000,
    pingTimeout: 1500 * 1000
});

const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();

const channel = 'jhandy';
const static_dir = path.resolve(__dirname, '../renderer')
//////////////////////////////////////////////////////////////////////////////////////////////
//app.get('/', function (req, res) {
    //res.send('hello world')
    //res.sendFile(__dirname + '/index.html');
//});

app.get('/news', function (req, res) {
    res.sendFile(__dirname + '/news.html');
});

app.use(express.static(static_dir))
app.use('/', express.static(static_dir));

//////////////////////////////////////////////////////////////////////////////////////////////

io.on('connection', function (socket) {

    socket.on('disconnect', function () {

    });

    socket.on('cls_news', function (msg) {
        //socket.broadcast.emit('cls_news', msg);
        io.emit('cls_news', msg);
    });

    socket.on(channel, function (msg) {
        console.log('socket:', msg);
        let event = msg.event || 'msg';
        events.emit(event, msg);
    });

});

//////////////////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////////

function F () {
    this.httpServer = httpServer;
    this.io = io;
    this.start = function (port) {
        port = port || 3000
        httpServer.listen(port, function () {
            console.log(`---server start on port:${ port }`);
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


