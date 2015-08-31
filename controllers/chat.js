
module.exports = {
    index: function (req, res) {
        var sess = req.session;
        (!sess.email) ? res.redirect('/login') : res.render('chat/index');
    }
};