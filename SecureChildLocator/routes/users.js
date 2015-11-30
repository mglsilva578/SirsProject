var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Cipher = require('./../CryptoAux/CryptoFunctions');


//DATABASE INFO
var RegisterSchema = mongoose.Schema({
  username: String,
  password: String,
});

var RegisterModel = mongoose.model('users' , RegisterSchema);

//teste de crypto module
var teste = Cipher.ola();


//PEDIDOS
/* PEDIDO BASE EXPRESS NAO INTERESSA*/
router.get('/', function(req, res) {
  var responseObject = teste;
  res.send(responseObject);
});

/* post
    REGISTER USER
    */
router.post('/addUser' , function (req , res) {
  var newRegister = new RegisterModel();

  var username = req.body.username;
  var password = req.body.password;

  newRegister.username = username;
  newRegister.password = password;

  newRegister.save(function (err, savedObject){
    if(err){
      console.log(err);
      res.status(500).send();
    } else {
      res.send(savedObject);
    }

  });
});

/* put
    UPDATE USER (change password)
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





module.exports = router;
