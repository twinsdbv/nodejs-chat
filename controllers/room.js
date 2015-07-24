var express = require('express')
  , router = express.Router()
  , models = require('../models');

router.post('/create', function (req, res) {
    var name = req.body.name;
    var description = req.body.description;

    var RoomObj = new models.Room.model({
        'name': name,
        'description': description
    });
    RoomObj.save();

    res.redirect('/chat/' + RoomObj.id);
});

module.exports = router;