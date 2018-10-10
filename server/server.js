/**
 * Created by j on 18/6/17.
 */

const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    pingInterval: 1000 * 1000,
    pingTimeout: 1500 * 1000
});

const EventEmitter = require('events').EventEmitter;
const events = new EventEmitter();

const config = require('../config.json');

const channel = 'jhandy';

//////////////////////////////////////////////////////////////////////////////////////////////
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/news', function (req, res) {
    res.sendFile(__dirname + '/news.html');
});

app.use('/', express.static(__dirname));
app.use('/js', express.static(path.join(config.dir.root, '/js')));
app.use('/css', express.static(path.join(config.dir.root, '/css')));

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

http.listen(3000, function () {
    console.log('listening on *:3000');
});

//////////////////////////////////////////////////////////////////////////////////////////////

function F() {
    this.http = http;
    this.io = io;
    this.close = function () {
        http.close();
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

module.exports = new F();


