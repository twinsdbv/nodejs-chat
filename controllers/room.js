var express = require('express')
  , router = express.Router()
  , models = require('../models');

router.get('/create', function (req, res) {
  // Generate unique id for the room
  var id = Math.round((Math.random() * 1000000));

    var RoomObj = new models.Room.model({
        'name': id,
        'description': 'test description if the room'
    });
    RoomObj.save();
  // Redirect to the random room
  res.redirect('/chat/' + id);
});

module.exports = router;