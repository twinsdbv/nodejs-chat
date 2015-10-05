var Helper = {

    amountMsg: 0,

    getCookie: function (name) {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },

    getTime: function (UNIX_timestamp) {
        var d = new Date(UNIX_timestamp * 1000),	// Convert the passed timestamp to milliseconds
            yy = (d.getFullYear() + '').slice(-2),
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
        time = dd + '-' + mm + '-' + yy + ' ' + hh + ':' + min + ':' + sec;

        return time;
    },

    getTimestamp: function (dateString) {
        return Math.round(Date.parse(dateString) / 1000);
    },

    getTextareaCaret: function () {
        var element = document.getElementById('message');

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

    hideElement: function (element) {
        $(element).addClass('hidden');
    },

    scrollToBottom: function () {
        $("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, 300);
    },

    updateScroll: function () {
        var scrollBottom = $(document).height() - $(window).scrollTop() - $(window).height();

        (scrollBottom < 400 ) ? Helper.scrollToBottom() : Helper.initMsgUpdates();
    },

    initChatForm: function () {
        Helper.showElement('footer');
        Helper.initCodeTool();

        var $chatForm = $('#chatform');

        $('body').unbind('keyup').keyup(function (event) {
            event.stopPropagation();
            if (event.keyCode == 13) {
                var content = $chatForm.find('textarea').val(),
                    caret = Helper.getTextareaCaret();
                if(event.shiftKey){
                    this.value = content.substring(0, caret - 1) + "\n" + content.substring(caret, content.length);
                    event.stopPropagation();
                } else {
                    this.value = content.substring(0, caret - 1) + content.substring(caret, content.length);
                    $chatForm.submit();
                }
            }
        });

        $('body, .container, footer, .chatscreen').off('click').on('click', function (e) {
            e.stopPropagation();
            $('#emoticons').find('.emotico-box').addClass('hidden');
            $('#code').find('.code-box').addClass('hidden');
        });
    },

    initEmoticoTool: function(data) {
        var $emoticons = $('#emoticons'),
            $emoticoBox = $emoticons.find('.emotico-box'),
            $chatTextarea = $('#chatform').find('textarea');

        //add all images of emoticons
        $emoticoBox.html( data );

        //handlers for emoticoBox
        $emoticons.off('click').on('click', function (e) {
            e.stopPropagation();
            $emoticoBox.toggleClass('hidden');
        });

        //handlers for emoticons
        $emoticoBox.find('img').on('click', function () {
            var iconName = $(this).data('name'),
                content = $chatTextarea.val(),
                caret = Helper.getTextareaCaret();

            $chatTextarea.val( content.substring(0, caret - 1) + iconName + content.substring(caret, content.length) );
        })
    },

    initCodeTool: function () {
        var $codeTool = $('#code'),
            $codeBox = $codeTool.find('.code-box'),
            $chatTextarea = $('#chatform').find('textarea'),
            $codeBoxTextarea = $codeBox.find('textarea'),
            $codeBoxBtn = $codeBox.find('[type="button"]');

        //handlers for codeBox
        $codeTool.off('click').on('click', function (e) {
            e.stopPropagation();
            $codeBox.toggleClass('hidden');
        });
        $codeBox.off('click').on('click', function (e) {
            e.stopPropagation();
        });
        $codeBoxBtn.off('click').on('click', function () {
            var content = $chatTextarea.val(),
                formArray = $codeBox.serializeArray(),
                lang = formArray[0].value,
                code = formArray[1].value,
                caret = Helper.getTextareaCaret(),
                lumpOfCode = '['+ lang +']' + code + '[/'+ lang +']';

            $chatTextarea.val( content.substring(0, caret) + lumpOfCode + content.substring(caret, content.length) );

            $codeBoxTextarea.val('');
            $codeBox.addClass('hidden');
        })
    },

    initHistoryTool: function () {
        var $historyTool = $('#history'),
            $historyBox = $historyTool.find('.time-box');

        //handlers for historyBox
        $historyTool.off('click').on('click', function (e) {
            e.stopPropagation();
            $historyBox.toggleClass('hidden');
        });

        $historyBox.find('li').on('click', function () {
            var period = $(this).data('history');

            Chat.getHistory( period );
        })
    },

    initSpinner: function (container) {
        var opts = {
            lines: 13 // The number of lines to draw
            , length: 28 // The length of each line
            , width: 14 // The line thickness
            , radius: 42 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 1 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '45%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        };
        var target = document.getElementById(container);
        Helper.spinner = new Spinner(opts).spin(target);
    },

    disableSpinner: function () {
        Helper.hideElement('#mask');
        if(Helper.spinner) Helper.spinner.stop();
    },

    initMaskMessage: function (message) {
        $('#mask').find('.message').html( message );
    },

    initMsgUpdates: function () {
        var $msgUpdates = $('#msgUpdates'),
            count = 0,
            text = 'new message';

        $msgUpdates.on('click', function () {
            Helper.scrollToBottom();
            $msgUpdates.removeClass('show');

            Helper.amountMsg = 0
        });

        Helper.amountMsg++;

        count = (Helper.amountMsg > 20) ? '20+' : Helper.amountMsg;
        text = (Helper.amountMsg > 1) ? text + 's' : text;

        $msgUpdates.find('.count').html( count );
        $msgUpdates.find('.text').html( text );
        $msgUpdates.addClass('show');
    },
    
    connectError: function (status) {
        Helper.initMaskMessage( 'Connection <br>error' );
        Helper.showElement('#mask');
        Helper.initSpinner('mask');
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
        }, delay);
    },

    create = function(data) {
        Set.message( Get.template(data), function () {
            postProcess();
            Helper.updateScroll();
        })
    },

    addHistory = function (dataArray) {
        var content = '';

        for(var i=0; i < dataArray.length; i++) {
            content += Get.template( dataArray[i] )
        }

        Set.history(content, function () {
            postProcess(700);
            Helper.scrollToBottom();
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