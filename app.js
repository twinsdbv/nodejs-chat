//var Twig = require("twig");
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var app = express();
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var config = require('./config');

app.set('view engine', 'twig');
app.set("twig options", {
  strict_variables: false
});

mongoose.connect(config.get('db:connection') + config.get('db:name'), function (error) {
    if (error) {
        console.log('Mongo connection error!');
        console.log(error);
        return;
    } else {
        console.log('Mongo connect!');
    }

    // Initialize a new socket.io object. It is bound to
    // the express app, which allows them to coexist.
    var io = require('socket.io').listen(app.listen (config.get('port'), function () {
        console.log('Listening on port ' + config.get('port'));

        app.use(express.static(__dirname + '/public'));
        app.use(session({
            secret: config.get('session:secret'),
            cookie: config.get('session:cookie'),
            resave: true,
            saveUninitialized: true
        }));
        app.use(favicon(__dirname + '/public/favicon.ico'));
        app.use(cookieParser());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        require('./controllers')(app, io);
        require('./helpers/chat-sockets')(app, io);
    }));
});