var express = require('express')
    , router = express.Router()
    , async = require('async')
    , models = require('../models');

router.use('/room', require('./room'));
router.use('/chat', require('./chat'));
router.use('/users', require('./users'));

router.get('/', function(req, res) {
    var Room = models.Room.model;

    async.parallel({
            // 1st parallel function
            getRooms: function (callback) {
                Room.find({}).exec(callback);
            },

            // 2nd parallel function
            getOneRoom: function (callback) {
                Room.findOne({'name': '210708'}).exec(callback);
            }
        }
        // process results
    , function (err, result) {
        res.render('index', {rooms: result.getRooms, oneRoom: result.getOneRoom});
    });
});

module.exports = router;