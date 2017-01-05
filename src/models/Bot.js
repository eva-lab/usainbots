var mongoose  = require('mongoose'),
    words     = require('../../words.json'),
    exports   = module.exports;

var botSchema = new mongoose.Schema({
  idApp:              { type: String, require: true },
  nome:               { type: String, require: true },
  dataCriacao:        { type: Date },
  frases: {
    abertura:               [ String ],
    agradecimento:          [ String ],
    encerramento:           [ String ],
    semResposta:            [ String ],
    engajamento:            [ String ]
  }
});

var Bot =  mongoose.model('Bot', botSchema);

exports.cadastrar = function(dados, callback) {

  if(!dados.frases) {
    dados.frases =  words;
  }

  for (var i = 0; i < dados.frases.abertura.length; i++) {
    dados.frases.abertura[i] = dados.frases.abertura[i].replace(/%s/gi, dados.nome);
  }

  var bot = new Bot(dados);

  bot.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, dados);
    }

  });

};

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

      if(dadosReq.dados.frases.encerramento){
        dados.frases.encerramento = dadosReq.dados.frases.encerramento;
      }

      if(dadosReq.dados.frases.semResposta){
        dados.frases.semResposta = dadosReq.dados.frases.semResposta;
      }

      if(dadosReq.dados.frases.agradecimento){
        dados.frases.agradecimento = dadosReq.dados.frases.agradecimento;
      }

      if(dadosReq.dados.frases.engajamento){
        dados.frases.engajamento = dadosReq.dados.frases.engajamento;
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

exports.remover = function(id, callback) {

  Bot.remove({ '_id' : id }, function (err, dados) {
    if (err) {
      callback(true);
    } else {
      callback(false);
    }
  });

};

exports.pegarPeloIdApp = function(id, callback) {

  Bot.find({ 'idApp': id }, function(err, dados){

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
