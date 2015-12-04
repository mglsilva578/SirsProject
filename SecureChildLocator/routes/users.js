var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Cipher = require('./../CryptoAux/CryptoFunctions');
var TMClient = require('textmagic-rest-client');
var shortid = require('shortid');
var crypto = require('crypto');



var RegisterSchema = mongoose.Schema({
  username: String,
  password: String,
  relation: String,
  linkNumber: String,
  latitude: String,
  longitude: String,
  tokenValor: String,
  tokenDate: String,
  sharedKey: String
});



//MONGOOSE
var RegisterModel = mongoose.model('users' , RegisterSchema);
//var TokenModel = mongoose.model('tokens' , TokenSchema);


/*
get DEVOLVE A LOCALIZACAO DA CRIANCA (VERIFICAR TOKEN)
*/
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
                  var latitude = foundUser.latitude;
                  var longitude = foundUser.longitude;
                  var Dlat = Cipher.decifraServerInfo(latitude);
                  var Dlong = Cipher.decifraServerInfo(longitude);

                  return res.status(200).send("{latitude:" + Dlat + "," + "longitude:" + Dlong + "}");
                }
              });
            }
            }
          });
        });

/*
  post Update child location on the server
  */
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

        var latitude = req.body.latitude;
        var longitude = req.body.longitude;
        var Clat = Cipher.cifraServerInfo(latitude);
        var Clong = Cipher.cifraServerInfo(longitude);
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

/* post
    REGISTER USER (PAI E CRIANÇA ADICIONADOS DE MANEIRA DIFERENTE / SPLIT NA PARTE DE ADICIONAR , NECESSARIO REPLICAR CODIGO)
    */
router.post('/addUser' , function (req , res) {
  var newRegister = new RegisterModel();

  var username = req.body.username;
  var password = req.body.password;
  var relation = req.body.relation;
  var latitude = req.body.latitude;
  var longitude = req.body.longitude;
  var token = req.body.token;
  var number = req.body.linkNumber;

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
            newRegister.latitude = latitude;
            newRegister.longitude = longitude;
            newRegister.token = token;

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
    newRegister.latitude = latitude;
    newRegister.longitude = longitude;
    newRegister.token = token;

    newRegister.save(function (err , savedObject) {
      if(err) {
        res.status(500).send();
      } else {
        res.status(200).send("{linkNumber:" + number + "}");
      }
    });
  }
});


/*
login (VERIFICAR VALIDADE DO TOKEN E ENVIAR PARA UTILIZADOR)
*/
router.post('/login', function(req , res) {
  var username = req.body.username;
  var password = req.body.password;
  var hashedPass = Cipher.hashPassword(password);
  var publicKeyClient = req.body.PublicKey;

//GERAR CHAVE PUBLICA PARA ENVIAR AO UTILIZADOR APOS O LOGIN
  //var myKeys = crypto.createDiffieHellman(128);
 //var myKeys = crypto.createDiffieHellman(Cipher.sharePrime());
  //myKeys.generateKeys('base64');
//  var myPublicKey = myKeys.getPublicKey('base64');
//  console.log(typeof publicKeyClient);
//  console.log(publicKeyClient);
//  console.log(typeof myPublicKey);
//  console.log(myPublicKey);


  //GERAR SHAREDSECRET COM O CLIENT
 //var clientServerKey = myKeys.computeSecret(publicKeyClient, 'base64' , 'base64');
//  console.log(myPublicKey);

  RegisterModel.findOne({username: username , password: hashedPass} , function(err , user) {
    if(err) {
      console.log(err);
      return res.status(500).send();
    }

    if(!user) {
      return res.status(401).send("username or password incorrect");
    } else {

    var tokenValor = Cipher.gerarTokenValor();
    user.tokenValor = tokenValor;
    //GUARDAR A KEY NA BASE DE DADOS
  //  user.sharedKey = clientServerKey;

     if (user.relation == "pai") {
       user.tokenDate = Cipher.gerarValidadeTokenPai();
     } else {
       user.tokenDate = Cipher.gerarValidadeTokenFilho();
     }


    user.save(function (err, updateUser) {
      if (err) {
        res.status(500).send();
      } else {
    return res.status(200).send("{relation:" + updateUser.relation + ", token:" + user.tokenValor + "}");
  }
});
}
  });
});

/* put
    UPDATE USER (change password) PODEMOS ALTERAR MAIS COISAS CASO NECESSARIO POR EXEMPLO TOKEN
    */
router.put('/updateUser' , function(req , res) {
  var username = req.body.username;

  RegisterModel.findOne({username: username} , (function (err , foundUser) {

    if(err) {
      console.log(err);
      res.status(500).send();
    } else {
      if(!foundUser) {
        res.status(404).send();
      } else {
        if(req.body.password) {
          foundUser.password = req.body.password;
        }

        foundUser.save(function(err , updateUser) {
          if(err) {
            console.log(err);
            res.status(500).send();
          }else {
            res.send(updateUser);
          }
        });
      }
    }
  }));
});

//
//FUNCOES PARA CONTROLO DE USERS (NAO ACONSELHAVEL UTILIZAR SEM CUIDADO , VALORES ESPECIFICOS)
//

/*get
  SHOW USER list
  */
  router.get('/allUsers' , function (req , res) {
    RegisterModel.find({} , function (err , Users) {
      if(err) {
        console.log(err);
        res.status(500).send();
      } else {
        if(Users.length == 0) {
          var responseObject = undefined;
          res.status(404).send(responseObject);
        } else {
          var responseObject = Users;
          res.status(200).send(responseObject);
        }
      }
    })
  });


  /*delete
  DELETE USER POR ID
    */
    router.delete('/deleteUserTable/:id' , function (req , res) {
      var id = req.params.id;

      RegisterModel.findOneAndRemove({_id :id} , function (err) {
        if(err) {
           console.log(err);
           return res.status(500).send();
        }

        return res.status(200).send();
      });
    });


    /* delete
      DELETE USER POR BODY MESSAGE
      */
      router.delete('/deleteUser' , function(req , res) {
        var username = req.body.username;


        RegisterModel.findOneAndRemove({username: username} , (function (err) {
          if(err) {
             console.log(err);
             return res.status(500).send();
          }

          return res.status(200).send(User);
        }));
      });


//tentativa de troca de prime e generator com o java
router.get('/shareModels' , function (req , res) {
    var prime = Cipher.sharePrime();
    var generator = Cipher.shareGenerator();
    console.log(prime);
    console.log(generator);
    return res.status(200).send("{prime:" + '"' + prime + '"' + ", generator:" + '"' + generator + '"' + "}");
  });
//
//
//
/*
  NAO CHAMAR ESTAS FUNCOES APENAS PARA TESTE
  */

  /*
 router.post ('/testarCipher' , function (req , res) {
   var latitude = "ola";
   var longitude = "adeus";

   RegisterModel.findOne({username : "rule"} , function (err , user) {
     if (err) {
       return res.status(500).send();
     }
     if(!user) {
       return res.status(404).send("user not found");
     } else {
       var Clat = Cipher.cifraServerInfo(latitude);
       var Clong = Cipher.cifraServerInfo(longitude);

       user.latitude = Clat;
       user.longitude = Clong;

       user.save(function(err , updateUser) {
         if(err) {
           console.log(err);
           res.status(500).send();
         }else {
           res.send(updateUser);
         }
       });
     }
   });
 });
 */
/*
router.get('/testarDecipher' , function (req , res) {
    RegisterModel.findOne({username : "rule"} , function (err , user) {
      if (err) {
        return res.status(500).send();
      }
      if(!user) {
        return res.status(404).send("user not found");
      } else {
        var latitude = user.latitude;
        var longitude = user.longitude;

        var Dlat = Cipher.decifraServerInfo(latitude);
        var Dlong = Cipher.decifraServerInfo(longitude);

        user.latitude = Dlat;
        user.longitude = Dlong;

        user.save(function (err , updateUser) {
          if (err) {
            console.log(err);
            res.status(500).send();
          } else {
            res.send(updateUser);
          }
        });
      }
    });
  });
*/

//TESTES DE CALLS EXTERIORES
/*
var numberTest = Cipher.generaterNumber('456');
var testarGenerator = shortid.generate();
*/
//PEDIDOS
/* PEDIDO BASE EXPRESS NAO INTERESSA*/
/*
router.get('/teste', function(req, res) {
  var responseObject = testarGenerator;
  res.send(responseObject);
});

*/

//teste data (nao interessa)
//var date = new Date();

module.exports = router;
