var models = require('../models');

module.exports = {
    index: function (req, res) {
        var name = req.body.name;
        var description = req.body.description;

        var RoomObj = new models.Room.model({
            'name': name,
            'description': description
        });
        RoomObj.save();

        res.redirect('/chat/' + RoomObj.id);
    }
};