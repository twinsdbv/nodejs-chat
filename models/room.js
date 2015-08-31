var mongoose = require('mongoose');

//mongoose.connect('mongodb://127.0.0.1:3000/mongoose', function (error) {
var RoomSchema = new mongoose.Schema({
    name: String,
    description: String,
    created: {'type': Date, 'default': new Date()},
    active: {'type': Boolean, 'default': true}
});

var Room = mongoose.model('Room', RoomSchema);

module.exports = {
    schema: RoomSchema,
    model: Room
};
//});