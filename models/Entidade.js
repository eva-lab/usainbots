var mongoose = require('mongoose');
var exports  = module.exports;

var entidadeSchema = new mongoose.Schema({
  idCliente:      { type: String },
  nome:           { type: String },
  url:            { type: String },
  textos:         { type: String },
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
        idCliente: dados.idCliente,
        nome: dados.nome,
        url: dados.url || null,
        textos: dados.textos || null,
        script: dados.script || null,
      });
    }

  });

};
