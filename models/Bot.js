var mongoose  = require('mongoose'),
    frases    = require('../config/frases'),
    exports   = module.exports;

var botSchema = new mongoose.Schema({
  idUsuario:          { type: String, require: true },
  nome:               { type: String, require: true },
  dataCriacao:        { type: Date },
  frases: {
    abertura:             [ String ],
    introducaoRespostas:  [ String ],
    fechamento:           [ String ],
    semResposta:          [ String ],
  }
});

var Bot =  mongoose.model('Bot', botSchema);

// Cadastrar um Bot
exports.cadastrar = function(dados, callback) {

  if(!dados.frases) {
    dados.frases = frases;
  }

  var bot = new Bot(dados);

  bot.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, {
        idBot:        dados._id,
        idUsuario:    dados.idUsuario,
        nome:         dados.nome,
        dataCriacao:  dados.dataCriacao,
        frases:       dados.frases
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

      if(dadosReq.dados.frases.abertura){
        dados.frases.abertura = dadosReq.dados.frases.abertura;
      }

      if(dadosReq.dados.frases.introducaoRespostas){
        dados.frases.introducaoRespostas = dadosReq.dados.frases.introducaoRespostas;
      }

      if(dadosReq.dados.frases.fechamento){
        dados.frases.fechamento = dadosReq.dados.frases.fechamento;
      }

      if(dadosReq.dados.frases.semResposta){
        dados.frases.semResposta = dadosReq.dados.frases.semResposta;
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
            frases:      dados.frases
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
          idBot:        dados[i]._id,
          nome:         dados[i].nome,
          dataCriacao:  dados[i].dataCriacao,
          frases:       dados[i].frases
        });
      }
      callback(false, dadosBot);
    }

  });

};


exports.pegarPeloIdBot = function(id, callback) {

  Bot.findById(id, function(err, bot){

    if (!bot || err){
      callback(true);
    } else {
      callback(false, bot);
    }

  });

};
