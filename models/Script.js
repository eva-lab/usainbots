var mongoose = require('mongoose');
var exports  = module.exports;

var entidadeSchema = new mongoose.Schema({
  idBot:    { type: String, require: true },
  nome:     { type: String, require: true },
  conteudo: { type: String, require: true }
});

var Script =  mongoose.model('Script', entidadeSchema);

// Cadastrar uma Script
exports.cadastrar = function(dados, callback) {

  var entidade = new Script(dados);

  entidade.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, {
        idScript : dados._id,
        idBot: dados.idBot,
        nome: dados.nome,
        conteudo: dados.conteudo || null,
      });
    }

  });

};

// Atualizar uma Script
exports.atualizar = function(dadosReq, callback) {

  Script.findById(dadosReq.idScript, function(err, dados){

      if(err){
        callback(true, err);
      } else {

        if (dadosReq.dados.nome) {
          dados.nome = dadosReq.dados.nome;
        }

        if (dadosReq.dados.conteudo) {
          dados.conteudo = dadosReq.dados.conteudo;
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

// Remover Script
exports.remover = function(id, callback) {

  console.log(id);

  Script.remove({ '_id' : id }, function (err, dados) {
    if (err) {
      callback(true);
    } else {
      callback(false);
    }
  });

};

// Pegar script pelo Id do Bot
  exports.pegarPeloIdBot = function(id, callback) {

  Script.find({ 'idBot' : id }, function (err, dadosScript) {

    if (err) {
      callback(true);
    } else {

      if(!dadosScript){
        callback(false);
      } else {
        var dados = [];
        for (var i = 0; i < dadosScript.length; i++) {
          dados.push({
            idScript: dadosScript[i]._id,
            idBot:    dadosScript[i].idBot,
            nome:     dadosScript[i].nome,
            conteudo: dadosScript[i].conteudo
          });
        }
        callback(false, dados);
      }

    }

  });

};
