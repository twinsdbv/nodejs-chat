
module.exports = {
  index: function (req, res) {

  },

  check: function (req, res) {
    var email = req.body.email;
    var sess = req.session;

    sess.email = email;

    res.redirect('/');
  }
};