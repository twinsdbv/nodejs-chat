$(function () {

  // getting the id of the room from the url
  var data = {};
  data.id = String(window.location.pathname.match(/\/chat\/([A-Za-z0-9]*)$/)[1]);

    // connect to the socket
    var socket = io();

    // on connection to server get the id of person's room
    socket.on('connect', function () {
        Helper.disableSpinner();

        data.email = Helper.getCookie('email');
        socket.emit('load', data);

        Helper.initChatForm();
    });

    // save the gravatar url
    socket.on('img', function (img) {
        data.img = img;
    });

    //Get recent messages
    socket.on('recent-messages', function (data) {
        ChatMessage.addHistory(data);
    });

    //Get all emoticons
    socket.on('get-emoticons', function (data) {
        Helper.initEmoticoTool(data);
    });


    socket.on('leave', function (data) {

        //if (data.boolean && id == data.room) {
        //
        //}
    });

    socket.on('disconnect', function () {
        Helper.connectError();
    });

    //receive message
    socket.on('own-msg', function (data) {
        ChatMessage.create(data);
    });

    socket.on('receive', function (data) {
        if (data.message_html.trim().length) {
            ChatMessage.create(data);
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

    
    getHistory: function (period) {
        Chat.socket.emit('getHistory', period);
    }

