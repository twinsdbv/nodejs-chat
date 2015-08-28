var Twig = require("twig");
var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;

app.set('view engine', 'twig');
app.set("twig options", {
  strict_variables: false
});
//app.set('views', __dirname + '/views')
//app.engine('jade', require('jade').__express)


mongoose.connect('mongodb://127.0.0.1:27017/chat_brainspark', function (error) {
    if (error) {
        console.log('Mongo connection error!');
        console.log(error);
        return;
    }

    // Initialize a new socket.io object. It is bound to
    // the express app, which allows them to coexist.
    var io = require('socket.io').listen(app.listen(port, function () {
        console.log('Listening on port ' + port);

        app.use(express.static(__dirname + '/public'));
        app.use(session({
            secret: 'ssshhhhh',
            resave: true,
            saveUninitialized: true
        }));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        require('./controllers')(app);

        require('./helpers/chat-sockets')(app, io);
    }));
});