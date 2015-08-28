var gravatar = require('gravatar');

module.exports = function (app, io) {
    // Initialize a new socket.io application, named 'chat'
    var chat = io.on('connection', function (socket) {

        // When the client emits the 'load' event, reply with the
        // number of people in this chat room
        socket.on('load', function (data) {
            var room = findClientsSocket(io, data.id);
            // Only two people per room are allowed

                // Use the socket object to store data. Each client gets
                // their own unique socket object
                socket.username = data.email;
                socket.room = data.id;
                socket.avatar = gravatar.url(data.email, {s: '140', r: 'x', d: 'mm'});

                // Tell the person what he should use for an avatar

                socket.emit('img', socket.avatar);

                // Add the client to the room
                socket.join(data.id);
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
            // When the server receives a message, it sends it to the other person in the room.
            socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
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