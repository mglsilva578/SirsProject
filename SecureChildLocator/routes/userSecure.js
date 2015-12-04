var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Cipher = require('./../CryptoAux/CryptoFunctions');
var TMClient = require('textmagic-rest-client');
var shortid = require('shortid');
var crypto = require('crypto');

//NOTA
//UTILIZAR USER.JS , NAO IMPLEMENTADO NA APP MOVEL


//message service
var c = new TMClient('andregoncalves', 'Rkkby2vtaAPZ8tYLz19YcZAi9OOVCO');


//mongoose Schema
var RegisterSchema = mongoose.Schema({
  username: String,
  password: String,
  relation: String,
  linkNumber: String,
  latitude: String,
  longitude: String,
  tokenValor: String,
  tokenDate: String,
  sharedKey: String,
  phoneNumber: String
});

//MONGOOSE model
var RegisterModel = mongoose.model('userSecure' , RegisterSchema);


//LOGIN
router.post('/login', function(req , res) {
  var username = req.body.username;
  var password = req.body.password;
  //DECIFRAR A PASSWORD COM SERVER PUBLIC KEY (NAO IMPLEMENTADO)
  var hashedPass = Cipher.hashPassword(password);
  var publicKeyClient = req.body.PublicKey;

//GERAR CHAVE PUBLICA PARA ENVIAR AO UTILIZADOR APOS O LOGIN
  var myKeys = crypto.createDiffieHellman(512);
  var myKeys = crypto.createDiffieHellman(Cipher.sharePrime());
  myKeys.generateKeys('base64');
  var myPublicKey = myKeys.getPublicKey('base64');


  //GERAR SHAREDSECRET COM O CLIENT
 var clientServerKey = myKeys.computeSecret(publicKeyClient, 'base64' , 'base64');


  RegisterModel.findOne({username: username , password: hashedPass} , function(err , user) {
    if(err) {
      console.log(err);
      return res.status(500).send();
    }

    if(!user) {
      return res.status(401).send("username or password incorrect");
    } else {

    var tokenValor = Cipher.gerarTokenValor();
    //var CtokenValor = Cipher.cifraServerInfo(tokenValor);
    user.tokenValor = tokenValor;
    //GUARDAR A KEY NA BASE DE DADOS
    user.sharedKey = clientServerKey;

     if (user.relation == "pai") {
       user.tokenDate = Cipher.gerarValidadeTokenPai();
     } else {
       user.tokenDate = Cipher.gerarValidadeTokenFilho();
     }


    user.save(function (err, updateUser) {
      if (err) {
        res.status(500).send();
      } else {
        var tokenValorF = user.tokenValor;
      //  var DtokenValorF = Cipher.decifraServerInfo(tokenValorF);
        var responseObject = "{relation:" + updateUser.relation + ",token:" + tokenValorF + "}"
        var cipheredObject = Cipher.cifraServerInfoKey(responseObject, clientServerKey);
        //CHALLENGE , O USER SO TEM ACESSO AO TOKEN CASO CONSIGA CRIAR A SHARED KEY PARA ABRIR A RESPOSTA
        var FinalObject = "{info:" + cipheredObject + ", PublicKey:" + myPublicKey + "}"
        return res.status(200).send(FinalObject);
  }
});
}
  });
});


//ADICIONAR USER
router.post('/addUser' , function (req , res) {
  var newRegister = new RegisterModel();

  var username = req.body.username;
  var password = req.body.password;
  //DECIFRAR PASSWORD COM CHAVE PUBLICA DO SERVIDOR (NAO IMPLEMENTADO)
  var relation = req.body.relation;
  var number = req.body.linkNumber;
  var phoneNumber = req.body.phoneNumber;

  if(!username || !password || !relation) {
    return res.status(422).send("fields missing");
  }

  if(relation == "filho") {
      if(!number) {
        return res.status(422).send("no son number");
      } else {
      RegisterModel.findOne({linkNumber: number} , function (err , foundUser){
          if(err) {
           return res.status(500).send();
          }
          if(!foundUser) {
            return res.status(422).send("link number not assigned");
          } else {


            //ADICIONAR filho
            newRegister.username = username;
            newRegister.password = Cipher.hashPassword(password);
            newRegister.relation = relation;
            newRegister.linkNumber = number;

            newRegister.save(function (err , savedObject) {
              if(err) {
                res.status(500).send();
              } else {
                res.status(200).send("{linkNumber:" + number + "}");
              }
            });
          }

        });
      }
    } else {

    //gerar chave para registo criança
    number = shortid.generate();

    //ADICIONAR PAI
    newRegister.username = username;
    newRegister.password = Cipher.hashPassword(password);
    newRegister.relation = relation;
    newRegister.linkNumber = number;
    newRegister.phoneNumber = phoneNumber;

    newRegister.save(function (err , savedObject) {
      if(err) {
        res.status(500).send();
      } else {
        //envio de codigo via SMS
          c.Messages.send({text: number , phones:phoneNumber} , function(err, res) {
          console.log('Messages.send()', err, res);
          res.status(200).send();
        });

      }
    });
  }
});


//UPDATE LOCATION
router.put('/updateLocation' , function(req , res) {
  var newRegister = new RegisterModel();

  var token = req.body.token;

  RegisterModel.findOne({tokenValor: token} , (function (err , foundUser) {
    if(err) {
    return res.status(500).send();
  } else {
      if(!foundUser) {
      return  res.status(401).send();
      } else {

        if (Cipher.VerificarTokenExpirado(foundUser.tokenDate)){
          return res.status(401).send("token expirado");
        } else {

          //cifradas por sharedkey
        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        //obter sharedkey
        var sharedKey = foundUser.sharedKey;
        //decifrar com shared key
        var Dlat = Cipher.decifraServerInfoKey (latitude , sharedKey);
        var Dlong = Cipher.decifraServerInfoKey (longitude , sharedKey);
        //coordenadas obtidas , agora cifrar com server key para manter confidencial na base de dados
        var Clat = Cipher.cifraServerInfo(latitude);
        var Clong = Cipher.cifraServerInfo(longitude);
        //update coordenadas no user
        foundUser.latitude = Clat;
        foundUser.longitude = Clong;
      }
    }
      foundUser.save(function(err , updateUser) {
        if(err) {
          console.log(err);
          res.status(500).send();
        }else {
          res.status(200).send();
        }
      });
    }
  }));
});

//childLocation
router.get('/childLocation' , function (req , res) {
  var token = req.header('token');

      RegisterModel.findOne({tokenValor: token} , function (err , foundUser) {
        if (err) {
          return res.status(500).send();
        }
        if(!foundUser) {
          return res.status(401).send();
        } else {

          if (Cipher.VerificarTokenExpirado(foundUser.tokenDate)){
            return res.status(401).send("token expirado");
          } else {

          var number = foundUser.linkNumber;
            RegisterModel.findOne({linkNumber: number , relation: "filho"} , function (err , foundUser) {
                if(err) {
                  return res.status(500).send();
                }
                if(!foundUser) {
                  return res.status(422).send("nao pode pedir localizacao se nao tiver filhos");
                } else {
                  //sharedKey com o user
                  var sharedKey = foundUser.sharedKey;
                  //obter coordenadas
                  var latitude = foundUser.latitude;
                  var longitude = foundUser.longitude;
                  //decifrar coordenadas com chave do server , aqui obtemos plain text para mandar po user
                  var Dlat = Cipher.decifraServerInfo(latitude);
                  var Dlong = Cipher.decifraServerInfo(longitude);
                  //cifrar coordenadas com sharedkey (mesmo que o token tenha sido roubado , a sharedkey é stored phisically portanto nao sera aberta as coordenadas)
                  var Clat = Cipher.cifraServerInfoKey(Dlat , sharedKey);
                  var Clong = Cipher.cifraServerInfoKey(Dlong , sharedKey);


                  return res.status(200).send("{latitude:" + Clat + "," + "longitude:" + Clong + "}");
                }
              });
            }
            }
          });
        });

module.exports = router;
