'use strict';

var MMreceiver = (function () {

    var Msg = {},
        config = {
          iframe: {
              width: "390",
              height: '280'
          }
        },
        marker = {
            php: {
                start: '[php]',
                end: '[/php]'
             },
            js: {
                start: '[js]',
                end: '[/js]'
            }
        },
        langs = [],
        regExp = {
          url: /(?:^|[^"'])((ftp|http|https|file):\/\/[\S]+(\b|$))/gim,
          imageLink: /(http:\/\/[\w\-\.]+\.[a-zA-Z]{2,3}(?:\/\S*)?(?:[\w])+\.(?:jpg|png|gif|jpeg|bmp))/gim,
          video: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$|^(?:https?:\/\/)?(?:www\.)?dailymotion.com\/(video|hub)+(\/([^_]+))?[^#]*(‪#‎video‬=([^_&]+))?$|^(?:https?:\/\/)?(?:www\.)?vimeo.com\/([0-9]+)$/gim,
          youtubeLink: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/gim,
          vimeoLink: /vimeo.*\/(\d+)/i,
          smiles: /(\:\w+\:|\<[\/\\]?3|[\(\)\\\D|\*\$][\-\^]?[\:\;\=]|[\:\;\=B8][\-\^]?[3DOPp\@\$\*\\\)\(\/\|])(?=\s|[\!\.\?]|$)/g
        },
        InitCallBack = false,



        init = function (message, callback) {
            Msg.text = message;
            marker.currentLang = 0;

            for(var key in marker) {
                langs.push(key);
            }

            if(callback && typeof(callback) === "function") {
                InitCallBack = function() {
                    callback(Msg.text);
                }
            }

            Check.forCode(langs);
        },

        Check = {

            forCode: function () {
                if (marker.currentLang >= langs.length) {
                    Check.forLinks();
                    return;
                }

                Msg.startPos = Msg.text.indexOf( marker[langs[marker.currentLang]].start );

                if ( Msg.startPos != -1) {
                    Search.code(langs[marker.currentLang]);
                } else {
                    marker.currentLang++;
                    Check.forCode();
                }
            },

            forLinks: function () {

                Search.images( function() {
                    Search.video( function() {
                        Search.url();
                    })
                });
            },

            forSmiles: function () {
                Search.smiles( function (result) {
                    Message.set(result);
                    InitCallBack();
                });
            }

        },

        Search = {

            code: function (lang) {
                Msg.endPos = Message.get().indexOf(marker[lang].end, Msg.startPos) + marker[lang].end.length;
                var msg = Message.get().slice(Msg.startPos, Msg.endPos);
                Msg.phpMessage = msg.slice(marker[lang].start.length, msg.length - marker[lang].end.length);

                Prepare.toHighlights(Msg.phpMessage, lang, function() {
                    Check.forCode();
                });
            },

            images: function (callback) {
                var result = Message.get().replace(regExp.imageLink, function (link) {
                    link = Prepare.encodeURI(link);

                    return Prepare.image(link);
                });

                Message.set(result);

                callback();
            },

            video: function (callback) {
                var result = Message.get().replace(regExp.video, function (link) {

                    return ( link.indexOf('youtu')+1 )? Prepare.youtubeIframe(link) : Prepare.vimeoIframe(link);
                });


                Message.set(result);
                //
                callback();
            },

            url: function () {
                var result = Message.get().replace(regExp.url, function( url ) {
                    url = Prepare.encodeURI( url.trim() );

                    return Prepare.url( url );
                });

                Message.set(result);
                Check.forSmiles();
            },

            smiles: function (callback) {
                var result = Message.get().replace(regExp.smiles, function(emoticons) {

                    return Prepare.forSmilePack(emoticons);
                });

                callback(result);
            }

        },

        Prepare = {

            toHighlights: function (msg, lang, callback) {
                msg = Prepare.escapeHtml(msg);
                msg = '<pre><code class="' + lang + '">' + msg + '</code></pre>';

                Message.setForPos(Msg.startPos, Msg.endPos, msg);

                callback();
            },

            image: function (link) {
                return '<a href="' + link + '" target="_blank"> <img class="chat-img" src="' + link + '" alt="" /> </a>'
            },

            url: function (url) {
                return '<a href="' + url + '" target="_blank" class="chat-link">' + url + '</a>'
            },

            getYoutubeId: function (url) {
                var id = '';
                url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                if(url[2] !== undefined) {
                    id = url[2].split(/[^0-9a-z_\-]/i);
                    id = id[0];
                }
                else {
                    id = false;
                }
                return id;
            },

            getVimeoId: function (url) {
                var match = regExp.vimeoLink.exec( url );

                return ( match ) ? match[1] : false;
            },

            youtubeIframe: function (link) {
                var id = Prepare.getYoutubeId(link);

                return (id) ?
                          '<div class="chat-video"><iframe width="' + config.iframe.width + '" height="'
                          + config.iframe.height + '" src="//www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe></div>'
                        : link;
            },

            vimeoIframe: function (link) {
                var id = Prepare.getVimeoId(link);

                return (id) ?
                        '<div class="chat-video"><iframe width="' + config.iframe.width + '" height="'
                        + config.iframe.height + '" src="//player.vimeo.com/video/' + id + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>'
                        : link;
            },

            forSmilePack: function (emoticon) {
                return SmileyPack.getImage(emoticon);
            },

            encodeURI: function (msg) {
                return encodeURI( msg );
            },

            escapeHtml: function (msg) {
                return msg
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            },

            unicode: function (string) {
                var result = "";
                for(var i = 0; i < string.length; i++){
                    result += "\\u" + ("000" + string[i].charCodeAt(0).toString(16)).substr(-4);
                }
                return result;
            }
        },

        Message = {

            get: function () {
              return Msg.text;
            },

            set: function (data) {
                Msg.text = data;

            },

            setForPos: function (startPos, endPos, data) {
                var firstSlice = Msg.text.slice(0, startPos),
                    secondSlice = Msg.text.slice(endPos);

                Msg.text = firstSlice + data + secondSlice;
            }
        };

    return {
        init: init
    }

}(SmileyPack));

var Helper = {

    initHighLight: function () {
        $('pre code').each(function(i, block) {
            hljs.highlightBlock(block);
        });
    }

};