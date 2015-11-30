var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Cipher = require('./../CryptoAux/CryptoFunctions');


//DATABASE INFO
var RegisterSchema = mongoose.Schema({
  name: String,
  password: String,
});

var RegisterModel = mongoose.model('users' , RegisterSchema);

//teste de crypto module
var teste = Cipher.ola();


//PEDIDOS
router.get('/', function(req, res) {
  var responseObject = teste;
  res.send(responseObject);
});

module.exports = router;
