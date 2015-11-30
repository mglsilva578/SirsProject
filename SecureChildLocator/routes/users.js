var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


//DATABASE INFO
var RegisterSchema = mongoose.Schema({
  name: String,
  password: String,
});

var RegisterModel = mongoose.model('users' , RegisterSchema);



//PEDIDOS
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
