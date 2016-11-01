var mongoose = require('mongoose');
var exports  = module.exports;

var botSchema = new mongoose.Schema({
  idUsuario:      { type: String, require: true },
  nome:           { type: String, require: true },
  dataCriacao:    { type: Date }
});

var Bot =  mongoose.model('Bot', botSchema);

// Cadastrar um Bot
exports.cadastrar = function(dados, callback) {

  var bot = new Bot(dados);

  bot.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, {
        idBot:        dados._id,
        idUsuario:    dados.idUsuario,
        nome:         dados.nome,
        dataCriacao:  dados.dataCriacao
      });
    }

  });

};

// Atualizar um Bot
exports.atualizar = function(dadosReq, callback) {

  Bot.findById(dadosReq.id, function(err, dados){

    if (!dados) {
      callback(true, dados);
    } else if(err){
      callback(true, err);
    } else {

      if (dadosReq.dados.nome) {
        dados.nome = dadosReq.dados.nome;
      }

      dados.save(function(err){
        if(err){
          callback(true, err);
        } else {
          callback(false, {
            idBot:       dados._id,
            idUsuario:   dados.idUsuario,
            nome:        dados.nome,
            dataCriacao: dados.dataCriacao,
          });
        }
      });

    }

  });

};

// Remover um Bot
exports.remover = function(id, callback) {

  Bot.remove({ '_id' : id }, function (err, dados) {
    if (err) {
      callback(true);
    } else {
      callback(false);
    }
  });

};

// Pegar Bots pelo ID do Usuário
exports.pegarPeloIdUsuario = function(id, callback) {

  Bot.find({ 'idUsuario': id }, function(err, dados){

    if (!dados) {
      callback(true, dados);
    } else if(err){
      callback(true, err);
    } else {
      var dadosBot = [];
      for (var i = 0; i < dados.length; i++) {
        dadosBot.push({
          idBot: dados[i]._id,
          nome: dados[i].nome,
          dataCriacao: dados[i].dataCriacao,
        });
      }
      callback(false, dadosBot);
    }

  });

};
