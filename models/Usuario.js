var mongoose  = require('mongoose'),
    bcrypt    = require('bcrypt-nodejs'),
    jwt       = require('jsonwebtoken'),
    exports   = module.exports;

var usuarioSchema = new mongoose.Schema({
  nome:           { type: String },
  email:          { type: String },
  senha:          { type: String },
  token:          { type: String }
});

var Usuario =  mongoose.model('Usuario', usuarioSchema);

exports.gerarToken = function(nome, email) {
  return jwt.sign({'nome': nome, 'email': email}, 'segredo');
};

exports.generateHash = function(senha) {
  return bcrypt.hashSync(senha, bcrypt.genSaltSync(8), null);
};

exports.validPassword = function(senha) {
  return bcrypt.compareSync(senha, this.senha);
};

// Cadastrar um novo Usuário
exports.criarUsuario = function(dados, callback) {

  var usuario = new Usuario(dados);

  usuario.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, usuario);
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
              email: dados.email,
              token: dados.token
            };
            callback(false, dados);
          }
        });

      }

  });

};

exports.pegarPeloEmail = function(dadosUsuario, callback) {

  Usuario.findOne({ 'email' : dadosUsuario.email }, function (err, dados) {

    if (err) {
      callback(true);
    } else {

      if(!dados){
        callback(false);
      } else {
        callback(false, dados);
      }

    }

  });

};
