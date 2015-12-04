var fs = require ("fs");
var shortid = require("shortid");
var crypto = require('crypto');
var assert = require('assert');


//cifra Internar do servidor
var serverSecret = "password"; //poderia ser um file loaded localmente


//server diffiehellman
var server = crypto.createDiffieHellman(512);
var prime = server.getPrime('base64');
var generator = server.getGenerator('base64');

//console.log(prime)
//console.log(generator)

exports.sharePrime = function () {
  return prime;
}

exports.shareGenerator = function() {
  return generator;
}
//SERVER PUBLIC PRIVATE KEY
//var servidorKeys = crypto.createDiffieHellman(prime);
//servidorKeys.generateKeys('base64');
//var servidorPublicKey = servidorKeys.getPublicKey('base64');
//var servidorPrivateKey = servidorKeys.getPrivateKey('base64');


//var passwordTeste = "password";
//var buffer = new Buffer(passwordTeste , 'utf8');
//var encrypted = crypto.publicEncrypt({key: servidorPublicKey}  , buffer);
//console.log(encrypted.toString('base64'));




//DECIFRAR INFORMACAO DO login
  exports.decifrarLoginInfo = function (cipheredPassword) {
  var buffer = new buffer(cipheredPassword , 'base64');
  var decryptedPassword = crypto.privateDecrypt(servidorPrivateKey , buffer);
  return decryptedPassword.toString('utf8');
}






//ESPERA DO CLIENT PART

//CRIAR A SECRETSHARED KEY ATRAVES DA PUBLIC RECEBIDA PELO CLIENTE
exports.generateSharedDHKey = function (key) {
var secretSharedKey =  serverDH.computeSecret(key);
return secretSharedKey;
}


//gerar o conjunto de chaves diffiehellman para a sessao
exports.generatePublicDH = function () {
  var scKey = crypto.createDiffiehellman(prime);
  var publicSCKey = scKey.generateKeys();
  return publicSCKey;
}


// FUNCOES

//gerar hash para dar storage da password (done)
exports.hashPassword = function (password) {
  var hashing = crypto.createHash('sha256');
  var hashed = hashing.update(password).digest('hex');
  return hashed;
}

// gerar numero para registo (TESTE)
exports.generaterNumber = function (text) {
  return text ; }

//gerar valor do token de utilizadores (SIMPLIFICADO , Crypto + nested shcemas is weird)
exports.gerarTokenValor = function () {
  var token = shortid.generate();
//  var data = "bla bla agora"; // TESTE
//  var tokenToReturn = "{valor:" + token + "," +  "data:" +  data + "}";
//  var tokenStringJSON = JSON.stringify(tokenToReturn);
//  var tokenFinal = JSON.parse(tokenStringJSON);
  return token;
}

//gerar validade do token de utilizadores (ACHO QUE NAO È NECESSARIO , GERAMOS ON RUN SEM AUXILO) Manter por enquanto
exports.gerarTokenValidity = function() {
  var token = "olaTeste";
  return token;
}

//gerar ValidadeToken PAI
exports.gerarValidadeTokenPai = function () {
  var validade = Date.now();
  validade = validade + 3600000;
  return validade;
}

//gerar ValidadeToken filho
exports.gerarValidadeTokenFilho = function() {
  var validade = Date.now();
  validade = validade + 259200000;
  return validade;
}

//ADICIONAMOS MILISECS AO TOKEN DO TEMPO E DAMOS STORAGE DA DATA DE EXPIRAR , comparamos com actual
exports.VerificarTokenExpirado = function(dataToVerificar) {
  var actual = Date.now();

  if(actual > dataToVerificar) {
    return true
  } else {
      return false
    }
    }

  //CIFRAR INFORMACAO SENSIVEL SERVIDOR
  exports.cifraServerInfo = function (dataToCipher) {
    var serverCipher = crypto.createCipher('aes256' , serverSecret); //objecto para cifrar localmente informaçao
    serverCipher.setAutoPadding(auto_padding = true);
    var cipheredData = serverCipher.update(dataToCipher, 'utf8' , 'base64') + serverCipher.final('base64')
    return cipheredData;
  }

  //DECIFRAR INFORMACAO SENSIVEL SERVER
  exports.decifraServerInfo = function (cipheredData) {
    var serverDecipher = crypto.createDecipher('aes256' , serverSecret); //objecto para decifrar localmente informação
    serverDecipher.setAutoPadding(auto_padding = true);
    var decipheredData = serverDecipher.update(cipheredData, 'base64' , 'utf8') + serverDecipher.final('utf8')
    return decipheredData;
  }




//
  // TESTES AUXILIARES
//


  //criação do diffiehellman do server
  var serverDH = crypto.createDiffieHellman(prime);
  serverDH.generateKeys('base64');
  var serverPublicKey = serverDH.getPublicKey('base64');
//  console.log(serverPublicKey);

  //criação de diffiehelman simulado de cliente para TESTAR
  var clientDH = crypto.createDiffieHellman(prime);
  clientDH.generateKeys('base64');
  var clientPublicKey = clientDH.getPublicKey('base64');
//  console.log(clientPublicKey)

  //criação secret shared keys
  var clientServerDH = clientDH.computeSecret(serverPublicKey, 'base64' , 'base64');
  var serverClientDH = serverDH.computeSecret(clientPublicKey, 'base64' , 'base64');
//  console.log(clientServerDH)
//  console.log(serverClientDH)
  //verificacoes
  assert.notEqual(clientPublicKey , serverPublicKey);
  assert.equal(clientServerDH , serverClientDH);



  //CIPHER TESTS
  var textoParaEncriptar = "bla bla whiskas saquetas";
  var cifrar = crypto.createCipher('aes256' , clientServerDH);
  cifrar.setAutoPadding(auto_padding=true);
  var cifrado =  cifrar.update(textoParaEncriptar, 'utf8' , 'base64') + cifrar.final('base64')
  //console.log(cifrado);
  var decifrar = crypto.createDecipher('aes256' , clientServerDH);
  decifrar.setAutoPadding(auto_padding=true);
  var decifrado = decifrar.update(cifrado , 'base64' , 'utf8') + decifrar.final('utf8')
  //console.log(decifrado);


  //HASH TESTE (HASH DA PASSWORD NA DATABASE COMPLETE)
  var fileTesteHash = "password";
  var hashing = crypto.createHash('sha256');
  var hashed = hashing.update(fileTesteHash).digest('hex');
  //console.log(hashed);
  var fileTesteHash2 = "password";
  var hashing2 = crypto.createHash('sha256');
  var hashed2 = hashing2.update(fileTesteHash2).digest('hex');
  //console.log(hashed2);
  assert.equal(hashed , hashed2);

  var testeFilho = Date.now();
  //console.log(testeFilho);
  testeFilho = testeFilho + 259200000;
//  console.log(testeFilho);

  var testePai = Date.now();
//  console.log(testePai);
  testePai = testePai + 3600000;
//  console.log(testePai);
