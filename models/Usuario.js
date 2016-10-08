var mongoose = require('mongoose');
var exports  = module.exports;

var usuarioSchema = new mongoose.Schema({
  nome:           { type: String },
  email:          { type: String },
  senha:           { type: String }
});

var Usuario =  mongoose.model('Usuario', usuarioSchema);

// Cadastrar um novo Usuário
exports.cadastrar = function(dados, callback) {

  var usuario = new Usuario(dados);

  usuario.save(function(err, dados){

    if(err) {

      callback(true, err);

    }else {

      callback(false, {
        idUsuario: dados._id,
        nome: dados.nome,
        email: dados.email
      });

    }

  });

};

// Atualizar um Usuário
exports.atualizar = function(dadosReq, callback) {

  Usuario.findById(dadosReq.idUsuario, function(err, dados){

      if(err){
        callback(true, err);
      } else {

        if (dadosReq.dados.nome) {
          dados.nome = dadosReq.dados.nome;
        }

        if (dadosReq.dados.email) {
          dados.email = dadosReq.dados.email;
        }

        if (dadosReq.dados.senha) {
          dados.senha = dadosReq.dados.senha;
        }

        dados.save(function(err){
          if(err){
            callback(true, err);
          } else {
            dados = {
              idUsuario: dados._id,
              nome: dados.nome,
              email: dados.email
            };
            callback(false, dados);
          }
        });

      }

  });

};

// Pegar entidades de um cliente
exports.pegarPeloId = function(id, callback) {

  Entidade.find({ 'idUsuario' : id }, function (err, dados) {

    if (err) {
      callback(true, dados);
    } else {

      var entidades = [];

      if(!dados){

        callback(false, {});

      } else {

        callback(false, {
          idUsuario: dados.idUsuario,
          nome: dados.nome,
          email: dados.email
        });

      }

    }

  });

};
