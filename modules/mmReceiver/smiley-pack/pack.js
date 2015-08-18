var SmileyPack = (function () {
    var settings = {
            path: {
                toPack: './smiley-pack/skype-smiley-pack/',
                toData: './smiley-pack/data.json'
            },
            imgExtension: '.gif'
        },
        smileyData = {},
        smileyExpand = {},



        init = function (callback) {
            Get.dataJSON(function () {
                if(callback && typeof(callback) === "function") {
                    callback();
                }
            });
        },

        getImage = function (emoticon) {
            var emoticonName = (smileyExpand[emoticon]) ? (smileyExpand[emoticon]) : emoticon;
            return (smileyData[emoticonName]) ? Get.image(emoticonName) :  emoticon;
        },

        getAllImages = function () {
            return Get.allImages();
        },

        Get = {

            dataJSON: function (callback) {
                $.get(settings.path.toData, function (data) {
                    smileyData = data[0];
                    for (var key in smileyData) {
                        for(var i=0; i < smileyData[key].length; i++) {
                            smileyExpand[smileyData[key][i]] = key;
                        }
                    }

                    callback();
                });

            },

            image: function (emoticonName) {
                var mainSmileyInSeries = smileyData[emoticonName][0],
                    fileName = emoticonName.replace(/:/g, '');

                return '<img alt="' + mainSmileyInSeries + '" data-name=" ' + emoticonName + ' " src="' + settings.path.toPack + fileName + settings.imgExtension + '" />'
            },

            allImages: function () {
                var allImages = '';
                for (var key in smileyData) {
                    allImages += Get.image(key);
                }
                return allImages;
            }
        };

    return {
        init: init,
        getImage: getImage,
        getAllImages: getAllImages
    }
})();
