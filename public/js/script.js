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
            //h = hh,
            min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
            sec = ('0' + d.getSeconds()).slice(-2),		// Add leading 0.
            //ampm = 'AM',
            time;

        //if (hh > 12) {
        //    h = hh - 12;
        //    ampm = 'PM';
        //} else if (hh === 12) {
        //    h = 12;
        //    ampm = 'PM';
        //} else if (hh == 0) {
        //    h = 12;
        //}

        // ie: 2013-02-18, 8:35 AM
        time = hh + ':' + min + ':' + sec;

        return time;
    },

    getTimestamp: function (dateString) {
        return Math.round(Date.parse(dateString) / 1000);
    },

    getCaret: function (element) {
        if (element.selectionStart) {
            return element.selectionStart;
        } else if (document.selection) {
            element.focus();
            var r = document.selection.createRange();
            if (r == null) return 0;

            var re = element.createTextRange(), rc = re.duplicate();
            re.moveToBookmark(r.getBookmark());
            rc.setEndPoint('EndToStart', re);
            return rc.text.length;
        }
        return 0;
    },

    initHighLight: function () {
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    },

    showElement: function (element) {
        $(element).removeClass('hidden');
    },

    scrollToBottom: function () {
        $("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, 300);
    },

    initChatForm: function () {
        Helper.showElement('footer');
        var $chatForm = $('#chatform');

        $chatForm.find('textarea').keyup(function (event) {
            if (event.keyCode == 13) {
                var content = this.value,
                    caret = Helper.getCaret(this);
                if(event.shiftKey){
                    this.value = content.substring(0, caret - 1) + "\n" + content.substring(caret, content.length);
                    event.stopPropagation();
                } else {
                    this.value = content.substring(0, caret - 1) + content.substring(caret, content.length);
                    $chatForm.submit();
                }
            }
        });
    }
};


var ChatMessage = (function () {

    var settings = {
            container: '#messageWindow'
    },

    postProcess = function (time) {
        var delay = time || 300;
        setTimeout(function () {
            Helper.initHighLight();
            Helper.scrollToBottom();
        }, delay);
    },

    create = function(data) {
        Set.message( Get.template(data), function () {
            postProcess();
        })
    },

    addHistory = function (dataArray) {
        var content = '';

        for(var i=0; i < dataArray.length; i++) {
            content += Get.template( dataArray[i] )
        }

        Set.history(content, function () {
            postProcess(700);
        })
    },

    Get = {

        template: function(data){
            return '<li class= "clearfix" >\
                        <div class="info">\
                            <img class="avatar" src="' + data.user_avatar + '" />\
                            <span class="timesent" data-time="' + Helper.getTimestamp( data.created ) + '" >[' + Helper.getTime( Helper.getTimestamp( data.created ) ) + ']</span>\
                            <span class="name">' + data.user_email + '</span>\
                        </div>\
                        <div class="message">' + data.message_html + '</div>\
                    </li>'
        }

    },

    Set = {

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