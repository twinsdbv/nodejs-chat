$(function () {

  // getting the id of the room from the url
  var data = {};
  data.id = String(window.location.pathname.match(/\/chat\/([A-Za-z0-9]*)$/)[1]);

    // connect to the socket
    var socket = io();

    // on connection to server get the id of person's room
    socket.on('connect', function () {
        data.email = Helper.getCookie('email');
        socket.emit('load', data);
    });

    // save the gravatar url
    socket.on('img', function (img) {
        data.img = img;
    });
    //Get recent messages
    socket.on('recent-messages', function (d) {
        for(var i=0; i < d.length; i++) {
            var timestamp = Helper.getTimeStamp( d[i].created );
            var msg = {
                user: d[i].user_email,
                msgHtml: d[i].message_html,
                img: d[i].user_avatar,
                timestamp: timestamp
            };
            var receive = (data.email != msg.user);

            Message.init(msg, receive);
        }
    });


    socket.on('leave', function (data) {

        if (data.boolean && id == data.room) {

        }
    });

    //receive message
    socket.on('own-msg', function (data) {
        Message.init(data);
    });

    socket.on('receive', function (data) {
        if (data.msg.trim().length) {
            Message.init(data);
        }
    });


    $('#chatform').on('submit', function (e) {
        e.preventDefault();
        var textarea = $('#chatform').find('textarea');

        if (textarea.val().trim().length) {
            // Send the message to the other person in the chat
            socket.emit('msg', {msg: textarea.val(), email: data.email, img: data.img});
        }
        // Empty the textarea
        textarea.val("");
    });
});


var Helper = {

    getCookie: function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    getTime: function (UNIX_timestamp) {
        var d = new Date(UNIX_timestamp * 1000),	// Convert the passed timestamp to milliseconds
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
            dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh == 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    },
    
    getTimeStamp: function (time) {
        return new Date( time ).getTime() / 1000;
    },

    initHighLight: function () {
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    }

};

var Message = {

    init: function (data, option) {
        Message.append(Message.create(data, option), function () {
            Helper.initHighLight();
        });
    },

    create: function (data, receive) {
        var receiveClass = receive ? 'received' : '';

        return '<div class="message ' + receiveClass + '">'+
            '<div class="avatar"><img alt="avatar" src="' + data.img + '"></div>'+
            '<div class="username">' + data.user + '</div>' +
            '<div class="text">' +
                '<span class="time">' + Helper.getTime(data.timestamp) + '</span>' +
                data.msgHtml +
            '</div>' +
            '</div>';
    },

    append: function (message, callback) {
        var $chatsWindow = $('.chatsWindow');
        $chatsWindow.append( message );
        $chatsWindow[0].scrollTop = $chatsWindow[0].scrollHeight;

        if (callback) callback();
    }
};