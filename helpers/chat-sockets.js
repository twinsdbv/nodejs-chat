var gravatar = require('gravatar');
var models = require('../models');
var modules = require('../modules');

var Message = models.Message.model;

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
            Message.find({room_id: socket.room}).sort({created: -1}).limit(30).exec(function(err, messages){
                if(err) {
                    throw new Error('Get recent messages')
                } else {
                    socket.emit('recent-messages', messages.reverse())
                }
            });

            //Get emoticons kit
            var allEmoticons = modules.smileyPack.getAllImages();
            socket.emit('get-emoticons', allEmoticons);
        });

        // Somebody left the chat
        socket.on('disconnect', function () {
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
                    sendData = {room_id: socket.room, message_origin: data.msg, message_html: msgHtml, user_email: data.email, user_avatar: data.img, created: date};

                // When the server receives a message, it sends it to the other person in the room.
                socket.broadcast.to(socket.room).emit('receive', sendData);

                socket.emit('own-msg', sendData);

                var MessageObj = new models.Message.model( sendData );
                MessageObj.save();

            });
        });



        // Get message history
        socket.on('getHistory', function (period) {
            var query = {room_id: socket.room};

            if(period != 'all') {
                var currentDay = new Date(),
                    seekingDay = new Date( currentDay.setDate(currentDay.getDate() - period) );

                seekingDay.setHours(0);
                seekingDay.setMinutes(0);
                seekingDay.setSeconds(0);

                query = {room_id: socket.room, "created" : { $gte : new Date( seekingDay )}};
            }

            Message.find( query ).exec( function(err, messages){
                if(err) {
                    throw new Error('Get recent messages')
                } else {
                    socket.emit('recent-messages', messages)
                }
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