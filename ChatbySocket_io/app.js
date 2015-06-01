var express = require('express');
var app = express();
// var app = require('express')();
var path = require('path');

var server = app.listen(5555,function(){
	console.log('Program running on port:5555');
});

//ทำการเพิ่ม module socket.io
var io = require('socket.io').listen(server);

// ตั้งค่า เพื่อให้ express ทำการ render view ที่โฟลเดอร์ views
// และใช้ template engine เป็น jade
app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');

//เพื่อให้ express ทำการลิงค์ไฟล์ public/css/main.css ได้
app.use(express.static('public'));

app.get('/',function(req,res){
	res.render('index');
});

// ทำการรับ event ที่ชื่อ connection
// ทำการรับ event ที่ชื่อ chatter ชื่อเดียวกันกับฝั่ง client
io.on('connection', function(socket) {
    socket.on('chatter', function(message) {
        console.log('message : ' + message);

        // server ก็จะส่งข้อความกลับไป ทุกๆ client โดยระบุชื่อ event ผ่านเมธอด
        io.emit('chatter',message);
    });
});