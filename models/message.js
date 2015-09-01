var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    room_id: String,
    user_email: String,
    user_avatar: String,
    message_origin: String,
    message_html: String,
    created: {'type': Date, 'default': new Date()}
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = {
    schema: MessageSchema,
    model: Message
};