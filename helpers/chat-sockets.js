var gravatar = require('gravatar');
var models = require('../models');
var modules = require('../modules');

module.exports = function (app, io) {
    // Initialize a new socket.io application, named 'chat'
    var chat = io.on('connection', function (socket) {

        // When the client emits the 'load' event, reply with the
        // number of people in this chat room
        socket.on('load', function (data) {
            var room = findClientsSocket(io, data.id);

            // Use the socket object to store data. Each client gets
            // their own unique socket object
            socket.username = data.email;
            socket.room = data.id;
            socket.avatar = gravatar.url(data.email, {s: '140', r: 'x', d: 'mm'});

            // Tell the person what he should use for an avatar
            socket.emit('img', socket.avatar);

            // Add the client to the room
            socket.join(socket.room);

            //Get recent messages
            var Message = models.Message.model;

            Message.find().sort('-date').limit(50).exec(function(err, messages){
                socket.emit('recent-messages', messages)
            });
        });

        // Somebody left the chat
        socket.on('disconnect', function () {
            console.log('disconnect');
            // Notify the other person in the chat room
            // that his partner has left

            socket.broadcast.to(this.room).emit('leave', {
                boolean: true,
                room: this.room,
                user: this.username,
                avatar: this.avatar
            });

            // leave the room
            socket.leave(socket.room);
        });


        // Handle the sending of messages
        socket.on('msg', function (data) {
            modules.mmReceiver.init( data.msg, function (msgHtml) {

                var date = new Date(),
                    timestamp = Math.round(date.getTime() / 1000),
                    sendData = {msgOrigin: data.msg, msgHtml: msgHtml, user: data.email, img: data.img, timestamp: timestamp};

                // When the server receives a message, it sends it to the other person in the room.
                socket.broadcast.to(socket.room).emit('receive', sendData);

                socket.emit('own-msg', sendData);

                var MessageObj = new models.Message.model({
                    room_id: socket.room,
                    user_email: sendData.user,
                    user_avatar: sendData.img,
                    message_origin: sendData.msg,
                    message_html: sendData.msgHtml,
                    created: date
                });
                MessageObj.save();

            });
        });
    });
};


function findClientsSocket(io, roomId, namespace) {
    var res = [],
        ns = io.of(namespace || "/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if (roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId);
                if (index !== -1) {
                    res.push(ns.connected[id]);
                }
            }
            else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}