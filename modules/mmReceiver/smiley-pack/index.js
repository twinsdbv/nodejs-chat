var fs = require('fs');
var smileyData = require("./data");

module.exports = (function () {
    var settings = {
            path: {
                toPack: '/img/smiley-pack/skype-smiley-pack/',
                //toData: './data.json'
            },
            imgExtension: '.gif'
        },
        //smileyData = {},
        smileyExpand = {},
        result,



        //init = function (callback) {
        //    Get.dataJSON(function () {
        //        if(callback && typeof(callback) === "function") {
        //            callback();
        //        }
        //    });
        //},

        getImage = function (emoticon) {
            Get.dataJSON(function () {
                var emoticonName = (smileyExpand[emoticon]) ? (smileyExpand[emoticon]) : emoticon;
                result = (smileyData[emoticonName]) ? Get.image(emoticonName) :  emoticon;
            });

            return result;
        },

        getAllImages = function () {
            return Get.allImages();
        },

        Get = {

            dataJSON: function (callback) {
                for (var key in smileyData) {
                    for(var i=0; i < smileyData[key].length; i++) {
                        smileyExpand[smileyData[key][i]] = key;
                    }
                }

                callback();
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
        //init: init,
        getImage: getImage,
        getAllImages: getAllImages
    }
})();
