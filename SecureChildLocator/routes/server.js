var express = require('express');
var router = express.Router();
var mongoose = require ("mongoose");


//PARA TESTES INTERNOS AO SERVER


//PEDIDOS HTTP
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WELCOME TO SERVER' });
});


module.exports = router;
