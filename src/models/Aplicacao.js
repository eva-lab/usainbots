var mongoose  = require('mongoose'),
    jwt       = require('jsonwebtoken'),
    exports   = module.exports;

var aplicacaoSchema = new mongoose.Schema({
  nome:           { type: String, require: true },
  secret:         { type: String, require: true, unique: true },
  token:          { type: String }
});

var Aplicacao =  mongoose.model('Aplicacao', aplicacaoSchema);

exports.gerarToken = function(dados, secret, callback) {

  var token = jwt.sign({ 'id': dados.id, 'secret': dados.secret }, secret, { expiresIn : '12h' });

  if(token) {
    callback(false,token);
  } else {
    true;
  }

};

exports.verificarToken = function(token, secret, callback) {
  jwt.verify(token, secret, function(err, decoded) {
    if(err) {
      callback(err);
    } else {
      callback(false, decoded);
    }
  });
};

exports.cadastrar = function(dados, callback) {

  var usuario = new Aplicacao(dados);

  usuario.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, dados);
    }

  });

};

exports.atualizar = function(dadosReq, callback) {

  Aplicacao.findById(dadosReq._id, function(err, dados){

      if(err || !dados){
        callback(true, err || dados);
      } else {

        if (dadosReq.nome) {
          dados.nome = dadosReq.nome;
        }

        if (dadosReq.token) {
          dados.token = dadosReq.token;
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

exports.pegar     = function(dados, callback) {

  Aplicacao.findOne({
    $and: [
      { 'secret' : dados.secret },
      { '_id' : dados._id }
    ]
  }, function (err, user) {

    if (err) {
      callback(true);
    } else {

      if(!user){
        callback(false);
      } else {
        callback(false, user);
      }

    }

  });

};
