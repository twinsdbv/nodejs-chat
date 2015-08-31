$(function () {

  // getting the id of the room from the url
  var data = {};
  data.id = String(window.location.pathname.match(/\/chat\/([A-Za-z0-9]*)$/)[1]);

    // connect to the socket
    var socket = io();

    // on connection to server get the id of person's room
    socket.on('connect', function () {
        data.email = getCookie('email');
        socket.emit('load', data);
    });

    // save the gravatar url
    socket.on('img', function (img) {
        data.img = img;
    });

    socket.on('leave', function (data) {

        if (data.boolean && id == data.room) {

        }

    });

    //receive message
    socket.on('own-msg', function (data) {
        appendMessage(data);
    });

    socket.on('receive', function (data) {
        if (data.msg.trim().length) {
            appendMessage(data, 'receive');
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



    function getCookie(name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function timeConverter(UNIX_timestamp){
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
    }

    function appendMessage (data, receive) {
        var receiveClass = receive ? receive : '';

        var message = '<div class="message ' + receiveClass + '">'+
            '<div class="avatar"><img alt="avatar" src="' + data.img + '"></div>'+
            '<div class="username">' + data.user + '</div>' +
            '<div class="text">' +
            '<span class="time">' + timeConverter(data.timestamp) + '</span>' +
            data.msg +
            '</div>' +
            '</div>';

        var $chatsWindow = $('.chatsWindow');
        $chatsWindow.append( message );
        $chatsWindow[0].scrollTop = $chatsWindow[0].scrollHeight;
    }



});