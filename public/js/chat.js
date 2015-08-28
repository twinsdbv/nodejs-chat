$(function () {

  // getting the id of the room from the url
  var data = {};
  data.id = String(window.location.pathname.match(/\/chat\/([A-Za-z0-9]*)$/)[1]);

    // connect to the socket

    var socket = io(),
        img = '';

    // on connection to server get the id of person's room
    socket.on('connect', function () {
        data.email = getCookie('email');
        socket.emit('load', data);
    });

    // save the gravatar url
    socket.on('img', function (data) {
        img = data;
    });

    socket.on('leave', function (data) {

        if (data.boolean && id == data.room) {

        }

    });

    //receive message
    socket.on('receive', function (data) {
        console.log('receive');

        if (data.msg.trim().length) {
            $('.chatsWindow').append('<div style="text-align: right">' + data.msg + '</div>');
        }
    });

    $('#chatform').on('submit', function (e) {
        e.preventDefault();
        var textarea = $('#chatform').find('textarea');

        if (textarea.val().trim().length) {
            $('.chatsWindow').append( '<div>' + textarea.val() + '</div>');


            // Send the message to the other person in the chat
            console.log(textarea.val());
            socket.emit('msg', {msg: textarea.val()});

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

});