var Helper = {

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

    initChatForm: function () {
        Helper.showElement('footer');
        var $chatForm = $('#chatform');

        $('body').unbind('keyup').keyup(function (event) {
            event.stopPropagation();
            if (event.keyCode == 13) {
                var content = $('#chatform').find('textarea').val(),
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
    },

    initEmoticons: function(data) {
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
        $('body, .container, footer, .chatscreen').off('click').on('click', function (e) {
            e.stopPropagation();
            $emoticoBox.addClass('hidden');
        });



        //handlers for emoticons
        $emoticoBox.find('img').on('click', function () {
            var iconName = $(this).data('name'),
                content = $chatTextarea.val(),
                caret = Helper.getTextareaCaret();

            $chatTextarea.val( content.substring(0, caret - 1) + iconName + content.substring(caret, content.length) );
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

    initMask: function () {
        var mask = '<div id="mask"></div>';
        $('body').append( mask );
    },
    
    waitError: function (status) {
        if(status == 'on') {
            var msg = '<span class="wait">Connection <br>error</span>';
            Helper.initMask();

            $('#mask').append( msg );
            Helper.initSpinner('mask');

        } else if(status == 'off') {
            $('#mask').remove();
            if(Helper.spinner) Helper.spinner.stop();
        }
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