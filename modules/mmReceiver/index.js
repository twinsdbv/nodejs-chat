var smileyPack = require('./smiley-pack');


module.exports = (function () {

    var Msg = {},
        config = {
          iframe: {
              width: "390",
              height: '280'
          }
        },
        langs = ['html', 'php', 'js'],
        langMarker = {},
        regExp = {
          url: /(?:^|[^"'])((ftp|http|https|file):\/\/[\S]+(\b|$))/gim,
          imageLink: /(https?:\/\/[\w\-\.]+\.[a-zA-Z]{2,3}(?:\/\S*)?(?:[\w])+\.(?:jpg|png|gif|jpeg|bmp))/gim,
          video: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$|^(?:https?:\/\/)?(?:www\.)?dailymotion.com\/(video|hub)+(\/([^_]+))?[^#]*(‪#‎video‬=([^_&]+))?$|^(?:https?:\/\/)?(?:www\.)?vimeo.com\/([0-9]+)$/gim,
          youtubeLink: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/gim,
          vimeoLink: /vimeo.*\/(\d+)/i,
          smiles: /(\:\w+\:|\<[\/\\]?3|[\(\)\\\D|\*\$][\-\^]?[\:\;\=]|[\:\;\=B8][\-\^]?[3DOPp\@\$\*\\\)\(\/\|])(?=\s|[\!\.\?]|$)/g
        },
        InitCallBack = false,



        init = function (message, callback) {
            Msg.text = Prepare.escapeHtml( message );
            langMarker.currentLang = 0;

            initLangMarker();

            if(callback && typeof(callback) === "function") {
                InitCallBack = function() {
                    callback(Msg.text);
                }
            }

            Check.forCode();
        },

        initLangMarker = function () {
            for(var i=0; i < langs.length; i++) {
                langMarker[ langs[i] ] = {
                    start: '[' + langs[i] + ']',
                    end: '[/' + langs[i] + ']'
                };
            }
        },

        Check = {

            forCode: function () {
                if (langMarker.currentLang >= langs.length) {
                    Check.forLinks();
                    return;
                }

                Msg.startPos = Msg.text.indexOf( langMarker[ langs[ langMarker.currentLang ] ].start );

                if ( Msg.startPos != -1) {
                    Search.code(langs[ langMarker.currentLang ]);
                } else {
                    langMarker.currentLang++;
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
                Msg.endPos = Message.get().indexOf(langMarker[lang].end, Msg.startPos) + langMarker[lang].end.length;
                console.log(Msg.endPos);

                var msgWithMarkers = Message.get().slice(Msg.startPos, Msg.endPos),
                    msgWithoutMarkers = msgWithMarkers.slice(langMarker[lang].start.length, msgWithMarkers.length - langMarker[lang].end.length);

                Prepare.toHighlights(msgWithoutMarkers, lang, function() {
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
                msg = '<div class="chat-code"><pre><code class="' + lang + '">' + msg + '</code></pre></div>';

                Message.setForPos(Msg.startPos, Msg.endPos, msg);

                callback();
            },

            image: function (link) {
                return '<div class="chat-img"><a href="' + link + '" target="_blank"> <img src="' + link + '" alt="" /> </a></div>'
            },

            url: function (url) {
                return '<div class="chat-link"><a href="' + url + '" target="_blank">' + Prepare.shortText( url ) + '</a></div>'
            },

            shortText: function (text) {
                if (text.length > 50) {
                    var startString = text.substr(0, 30),
                        finishString = text.substr(-30);

                    text = startString + ' ... ' + finishString;
                }
                return text;
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
                return smileyPack.getImage(emoticon);
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

}(smileyPack));