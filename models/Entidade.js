var mongoose = require('mongoose');
var exports  = module.exports;

var entidadeSchema = new mongoose.Schema({
  idUsuario:      { type: String },
  nome:           { type: String },
  url:            { type: String },
  script:         { type: String }
});

var Entidade =  mongoose.model('Entidade', entidadeSchema);

// Cadastrar uma Entidade
exports.cadastrar = function(dados, callback) {

  var entidade = new Entidade(dados);

  entidade.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, {
        idEntidade : dados._id,
        idUsuario: dados.idUsuario,
        nome: dados.nome,
        script: dados.script || null,
      });
    }

  });

};

// Cadastrar uma Entidade
exports.atualizar = function(dadosReq, callback) {

  Entidade.findById(dadosReq.idEntidade, function(err, dados){

      if(err){
        callback(true, err);
      } else {

        if (dadosReq.dados.nome) {
          dados.nome = dadosReq.dados.nome;
        }

        if (dadosReq.dados.script) {
          dados.script = dadosReq.dados.script;
        }

        dados.save(function(err){
          if(err){
            callback(true, err);
          } else {
            callback(false, dados);
          }
        });

      }

  });

};

// Pegar entidades de um cliente
exports.pegarPeloIdUsuario = function(id, callback) {

  Entidade.find({ 'idUsuario' : id }, function (err, dados) {

    if (err) {
      callback(true, dados);
    } else {

      var entidades = [];

      if(dados && dados.length == 0){

        callback(false, {});

      } else {

        for (var i = 0; i < dados.length; i++) {
          entidades.push({
            idEntidade: dados[i]._id,
            nome: dados[i].nome,
            script: dados[i].script || null
          })
        }

        callback(false, {
          idUsuario: dados[0].idUsuario,
          nome: dados[0].nome,
          entidades: entidades
        });

      }

    }

  });

};

// Pegar entidades de um cliente
exports.remover = function(id, callback) {

  Entidade.remove({ '_id' : id }, function (err, dados) {
    if (err) {
      callback(true);
    } else {
      callback(false);
    }
  });

};
