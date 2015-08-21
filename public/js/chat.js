$(function () {

  // getting the id of the room from the url
  var id = String(window.location.pathname.match(/\/chat\/([A-Za-z0-9]*)$/)[1]);

    // connect to the socket

    var socket = io(),
        img = '';

    // on connection to server get the iтщвуd of person's room
    socket.on('connect', function (data) {
        console.log('connect');
        socket.emit('load', id);
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

    function showMessage(status, data) {

    }

});