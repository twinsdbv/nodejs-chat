// Export some model methods

var express = require('express')
  , mongoose = require('mongoose')
  , bodyParser = require('bodyParser')
  , app = express();

mongoose.connect('mongodb://127.0.0.1:3000/mongoose', function (error) {
  if (error) {
    console.log(error);
    return;
  }

  var CustomerSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    phone: String,
    age: Number,
    blocked: Boolean
  });

  var Customer = mongoose.model('Customer', CustomerSchema);
});