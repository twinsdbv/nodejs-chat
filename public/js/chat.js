var Chat = {

    data: {},

    load: function() {
        // getting the id of the room from the url
        Chat.data.id = String(window.location.pathname.match(/\/chat\/([A-Za-z0-9]*)$/)[1]);

        // connect to the socket
        Chat.socket = io();

        Chat.connectEvent();
        Chat.leaveEvent();
        Chat.disconnectEvent();
        Chat.gravatarEvent();
        Chat.messageEvents();
        Chat.getRecentMessages();
        Chat.getAllEmoticons();
    },

    connectEvent: function () {
        // on connection to server get the id of person's room
        Chat.socket.on('connect', function () {
            //App.disableSpinner();

            Chat.data.email = App.getCookie('email');
            Chat.socket.emit('load', Chat.data);

            App.initChatForm();
        });
    },

    disconnectEvent: function () {
        Chat.socket.on('disconnect', function () {
            App.connectErrorSpinner();
            setTimeout(function () {
                location.reload();
            }, 2000);
        });
    },

    leaveEvent: function () {
        Chat.socket.on('leave', function (data) {
            //if (data.boolean && id == data.room) {
            //
            //}
        });
    },

    gravatarEvent: function() {
        Chat.socket.on('img', function (img) {
            Chat.data.img = img;
        });
    },

    messageEvents: function(){

        //receive messages
        Chat.socket.on('own-msg', function (data) {
            ChatMessage.create(data);
        });

        Chat.socket.on('receive', function (data) {
            if (data.message_html.trim().length) {
                ChatMessage.create(data);
            }
        });

        //submit messages
        $('#chatform').on('submit', function (e) {
            e.preventDefault();
            var textarea = $('#chatform').find('textarea'),
                data = Chat.data;

            if (textarea.val().trim().length) {
                // Send the message to the other person in the chat
                Chat.socket.emit('msg', {msg: textarea.val(), email: data.email, img: data.img});
            }
            // Empty the textarea
            textarea.val("");
        });
    },

    getRecentMessages: function() {
        Chat.socket.on('recent-messages', function (data) {
            App.pleaseWaitSpinner();
            ChatMessage.addHistory(data);
        });
    },

    getAllEmoticons: function () {
        Chat.socket.on('get-emoticons', function (data) {
            App.initEmoticoTool(data);
        });
    },
    
    getHistory: function (period) {
        Chat.socket.emit('getHistory', period);
    }

};

