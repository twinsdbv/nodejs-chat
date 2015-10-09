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
            ChatMessage.own = true;

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

var ChatMessage = (function () {

    var settings = {
            container: '#messageWindow'
        },

        postProcess = function (time) {
            var delay = time || 300;

            setTimeout(function () {
                App.initHighLight();
            }, delay);
        },

        create = function(data) {
            Insert.message( Get.template(data), function () {
                if(!ChatMessage.own) App.newMessage++;

                App.checkScroll();
                postProcess();
            });

            ChatMessage.own = false;
        },

        addHistory = function (dataArray) {
            var content = '';
            if (dataArray.length) {

                for(var i=0; i < dataArray.length; i++) {
                    content += Get.template( dataArray[i] )
                }
            } else {
                content = '<li>За последний период сообщений не было, воспользуйтесь историей <span class="icon history"></span> или напишите своё</li>';
            }

            Insert.history(content, function () {
                setTimeout(function () {
                    App.disableSpinner();
                }, 800);

                postProcess(700);
            })
        },

        Get = {

            template: function(data){
                return '<li class= "clearfix" >\
                        <div class="info">\
                            <img class="avatar" src="' + data.user_avatar + '" />\
                            <span class="timesent" data-time="' + App.getTimestamp( data.created ) + '" >[' + App.getTime( App.getTimestamp( data.created ) ) + ']</span>\
                            <span class="name">' + data.user_email + '</span>\
                        </div>\
                        <div class="message">' + data.message_html + '</div>\
                    </li>'
            }

        },

        Insert = {

            message: function(content, callback){
                $(settings.container).append( content );

                if(callback && typeof (callback) == 'function') callback();
            },

            history: function(content, callback){
                $(settings.container).html( content );

                if(callback && typeof (callback) == 'function') callback();
            }

        };

    return {
        create: create,
        addHistory: addHistory
    }
}());

