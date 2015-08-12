var SmileyPack = (function () {
    var settings = {
            path: {
                toPack: 'pidgin-smiley-pack',
                toImg: 'pidgin-smiley-pack/img',
                toData: './smiley-pack/data.json'
            }
        },
        smileyData = {},

        init = function () {

            Get.dataJSON();
        },

        getSmileyData = function () {
            return smileyData;
        },

        Get = {

            dataJSON: function () {
                $.get(settings.path.toData, function (data) {
                    data = data[0];
                    for (var key in data) {
                        for(var i=0; i < data[key].length; i++) {
                            smileyData[data[key][i]] = key;
                        }
                    }
                });

            }
        };

    return {
        init: init,
        getSmileyData: getSmileyData
    }
})();
