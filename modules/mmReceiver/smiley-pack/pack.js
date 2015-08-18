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



        init = function () {
            Get.dataJSON();
        },

        getImage = function (emoticon) {
            console.log(smileyExpand);
            console.log(smileyData);
            var emoticonName = (smileyExpand[emoticon]) ? (smileyExpand[emoticon]) : emoticon;
            return (smileyData[emoticonName]) ? Get.image(emoticonName) :  emoticon;
        },

        Get = {

            dataJSON: function () {
                $.get(settings.path.toData, function (data) {
                    smileyData = data[0];
                    for (var key in smileyData) {
                        for(var i=0; i < smileyData[key].length; i++) {
                            smileyExpand[smileyData[key][i]] = key;
                        }
                    }
                });

            },

            image: function (emoticonName) {
                var mainSmileyInSeries = smileyData[emoticonName][0],
                    fileName = emoticonName.replace(/:/g, '');

                return '<img alt="' + mainSmileyInSeries + '" src="' + settings.path.toPack + fileName + settings.imgExtension + '" />'
            }
        };

    return {
        init: init,
        getImage: getImage
    }
})();
