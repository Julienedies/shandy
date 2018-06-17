/**
 * Created by j on 18/6/17.
 */

var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var config = require('../config.json');

app.use('/js', express.static(path.join(config.dir.root, '/js')));
app.use('/css', express.static(path.join(config.dir.root, '/css')));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


let clients = [];
io.on('connection', function(socket){
    console.log('a user connected');
    clients.push(socket.id);
    socket.on('disconnect', function(){
        console.log('user disconnected');
        let i = clients.indexOf(socket.id);
        clients.splice(i, 1);
    });

    socket.broadcast.emit('message', 'xxxxxx');

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

//http.close();
/*setTimeout(function(){
    clients.map(v => {
        io.sockets.connected[v].emit('rts', [1,2]);
    });
}, 5000);*/

module.exports = {
    http: http,
    close: () => http.close(),
    io:io,
    push: function(e, msg){
        try{

            io.emit(e, msg);
            /*clients.map(v => {
                if(io.sockets.connected[v]){
                    io.sockets.connected[v].emit(e, msg);
                }
            });*/
        }catch(err){
            console.log(err);
        }
    }
};