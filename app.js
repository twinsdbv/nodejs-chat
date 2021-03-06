var Twig = require("twig")
  , express = require('express')
  , mongoose = require('mongoose')
  , app = express()
  , bodyParser = require('body-parser')
  , port = process.env.PORT || 3000;

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
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(require('./controllers'));

        require('./helpers/chat-sockets')(app, io);
    }));
});