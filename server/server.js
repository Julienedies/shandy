/**
 * Created by j on 18/6/17.
 */

const path = require('path');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const config = require('../config.json');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.get('/favicon.ico', function(req, res){
    res.sendFile(__dirname + '/favicon.ico');
});

app.use('/js', express.static(path.join(config.dir.root, '/js')));
app.use('/css', express.static(path.join(config.dir.root, '/css')));

const clients = [];

io.on('connection', function(socket){
    //console.log('a user connected');
    clients.push(socket.id);
    socket.on('disconnect', function(){
        //console.log('user disconnected');
        let i = clients.indexOf(socket.id);
        clients.splice(i, 1);
    });

    socket.on('rts', function(msg){
        //io.emit('channel', msg);
        console.log('server:', msg);
        broadcast(msg.event, msg.code);
    });

});

const listener = {};
function broadcast(event, msg){
    let e;
    let f;
    for(e in listener){
        if(e == event){
            f = listener[e];
            f(event, msg);
        }
    }
}


http.listen(3000, function(){
    console.log('listening on *:3000');
});


module.exports = {
    http: http,
    close: () => http.close(),
    io:io,
    push: function(e, msg){
        try{
            io.emit(e, msg);
        }catch(err){
            console.log(err);
        }
    },
    on_msg : function(e, f){
        listener[e] = f;
    }
};


//http.close();
/*setTimeout(function(){
 clients.map(v => {
 if(io.sockets.connected[v]){
 io.sockets.connected[v].emit(e, msg);
 }
 });
 }, 5000);*/
