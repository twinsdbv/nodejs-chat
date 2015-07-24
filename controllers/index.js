var express = require('express')
    , router = express.Router()
    , models = require('../models');

router.use('/room', require('./room'));
router.use('/chat', require('./chat'));
router.use('/users', require('./users'));

router.get('/', function(req, res) {

    var Room = models.Room.model;
    Room.find({}, function (err, rooms) {
        res.render('index', {rooms: rooms});
    });
});

module.exports = router;