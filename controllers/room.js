var express = require('express')
  , router = express.Router();

router.get('/create', function (req, res) {
  // Generate unique id for the room
  var id = Math.round((Math.random() * 1000000));

  // Redirect to the random room
  res.redirect('/chat/' + id);
});

module.exports = router;