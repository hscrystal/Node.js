var express = require('express');
var app = express();
//var app = require('express')();
var path = require('path');
// เตียมตัวแปร name สำหรับเก็บชื่อผู้เข้าห้องแชต
var name = {};
var server = app.listen(7777,function(){
	console.log('Program running on port:7777');
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
	res.render('index2');
});

// ทำการรับ event ที่ชื่อ connection
// ทำการรับ event ที่ชื่อ sendMsg ชื่อเดียวกันกับฝั่ง client
io.on('connection', function(socket) {
	var ipv4 = socket.request.socket.remoteAddress; // เก็บ ip address ของผู้เข้าห้องแชต
    socket.on('sendMsg', function(data) {
        if(data.message === '' || data.message === null) { // ถ้า message เป็นค่าว่าง หรือไม่มีค่า
        	return; // หยุดฟังชั่น
        }else if(data.message.indexOf('<')>=0){ // ถ้ามีการส่ง < มาด้วย (กรณีกัน การใส่ code เข้ามาในห้องแชต)
        	socket.disconnect(); // บังคับผู้ส่งให้ออกจากห้อง
            return; // หยุดฟังชั่น
        }
        if (name[socket.id] !== null) { // ถ้าชื่อผู้ใช้ของ socket คนนี้ไม่เป็นค่าว่าง
            var msg = name[socket.id] + "(" + ipv4 + ") : " + data.message.trim(); // ให้ส่งข้อมูลกลับไปในรูปแบบชื่อ (ไอพี) : ข้อความ
            console.log(msg); // log โชว์ข้อความ           
            io.sockets.emit('sendMsg', {message: msg}); // emit ไปหา client ทุกคนผ่านท่อ 'sendMsg' 
        }
    });
    socket.on('sendName', function(data) {// เมื่อมีการส่งข้อมูลจาก client ผ่านท่อ 'sendName'
        if (data.name === "" || data.name === null) {//ตรวจสอบข้อมูลว่าง
            socket.disconnect(); // ถ้าว่างให้ disconnect
        } else {
            console.log(data.name.trim() + "(" + ipv4 + ") 's connected");// ถ้าไม่ว่าง Log ชื่อกับ IP
            name[socket.id] = data.name; // นำชื่อมาเก็บไว้ใน name โดยมี คีย์ประจำตัวเป็น socket id
            io.sockets.emit('sendName', {name: data.name.trim() + "(" + ipv4 + ") 's connected"});
            // emit ข้อมูลผ่านท่อ 'sendName' โดยมีพารามีเตอร์เป็น array มีname เป็น key มีค่าเป็น ชื่อและ ip
        }
    });
    socket.on('disconnect', function() {// ถ้ามีการ Disconnect
        console.log(name[socket.id] + " was disconnected"); // Log ชื่อที่ทำการ disconnect
        io.sockets.emit('disconnected', {name: name[socket.id]}); // ส่งข้อมูลชื่อ disconnect ไปยัง client ทุกตัว
    });
});