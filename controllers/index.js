var models = require('../models');
var async = require('async');
var chat = require('./chat');
var room = require('./room');
var login = require('./login');
var user = require('./user');

module.exports = function (app, io) {
    app.get('/', function(req, res) {
        var sess = req.session;
        if(!sess.email) {
            res.redirect('/login');
            return '';
        }

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

        res.cookie('email' , sess.email);
    });

    app.get('/chat/:id', chat.index);

    app.post('/room/create', room.index);

    app.get('/user/:id', user.index);

    app.post('/user/check', user.check);

    app.get('/login', login.index);
};