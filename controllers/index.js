var express = require('express')
  , router = express.Router();

router.use('/room', require('./room'));
router.use('/chat', require('./chat'));
router.use('/users', require('./users'));

router.get('/', function(req, res) {
  res.render('index');
});

module.exports = router;