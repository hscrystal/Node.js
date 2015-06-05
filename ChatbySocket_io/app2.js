var express = require('express');
var app = express();
//var app = require('express')();
var path = require('path');
var name = {};
var server = app.listen(7777,function(){
	console.log('Program running on port:7777');
});
var io = require('socket.io').listen(server);

app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');
app.use(express.static('public'));
app.get('/',function(req,res){
	res.render('index2');
});

io.on('connection', function(socket) {
	var ipv4 = socket.request.socket.remoteAddress; 
    console.log('connected');
    socket.on('sendMsg', function(data) {
        console.log('sendMsg');
        if(data.message === '' || data.message === null) { 
        	return; 
        }else if(data.message.indexOf('<')>=0){ 
        	socket.disconnect(); 
            return; 
        }
        if (name[socket.id] !== null) { 
            var msg = name[socket.id] + "(" + ipv4 + ") : " + data.message.trim(); 
            console.log(msg);
            io.sockets.emit('sendMsg', {message: msg});
        }
    });
    socket.on('sendName', function(data) {
        console.log("sendName");
        if (data.name === "" || data.name === null) {
            socket.disconnect(); 
        } else {
            console.log(data.name.trim() + "(" + ipv4 + ") 's connected");
            name[socket.id] = data.name; 
            io.sockets.emit('sendName', {name: data.name.trim() + "(" + ipv4 + ") 's connected"});
        }
    });
    socket.on('disconnect', function() {
        console.log(socket.id);
        console.log(name[socket.id] + " was disconnected");
        io.sockets.emit('disconnected', {name: name[socket.id]});
    });
});