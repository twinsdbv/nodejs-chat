var express = require('express')
  , router = express.Router();

router.get('/:id', function (req, res) {
  res.render('chat/index');
});

module.exports = router;