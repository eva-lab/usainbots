var mongoose  = require('mongoose'),
    jwt       = require('jsonwebtoken'),
    bcrypt    = require('bcrypt-nodejs'),
    exports   = module.exports;

var usuarioSchema = new mongoose.Schema({
  nome:           { type: String, require: true },
  email:          { type: String, require: true, unique: true },
  senha:          { type: String, require: true },
  token:          { type: String, require: true }
});

var Usuario =  mongoose.model('Usuario', usuarioSchema);

exports.generateToken = function(email, secret, expiration) {
  return jwt.sign({ 'email': email }, secret, { expiresIn : '10h' });
};

exports.verifyToken = function(token, secret, callback) {
  jwt.verify(token, secret, function(err, decoded) {
    if(err) {
      callback(err);
    } else {
      callback(false, decoded);
    }
  });
};

exports.generatePassword = function(senha) {
  return bcrypt.hashSync(senha);
};

exports.comparePassword = function(senha, senhaBD) {
  return bcrypt.compareSync(senha, senhaBD);
};

// Cadastrar um novo Usuário
exports.criarUsuario = function(dados, callback) {

  var usuario = new Usuario(dados);

  usuario.save(function(err, dados){

    if(err) {
      callback(true, err);
    }else {
      callback(false, {
        idUsuario:  usuario._id,
        nome:  usuario.nome,
        email: usuario.email,
        token: usuario.token
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

        if (dadosReq.nome) {
          dados.nome = dadosReq.nome;
        }

        if (dadosReq.email) {
          dados.email = dadosReq.email;
        }

        if (dadosReq.senha) {
          dados.senha = dadosReq.senha;
        }

        if (dadosReq.token) {
          dados.token = dadosReq.token;
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

exports.pegarPeloEmail = function(email, callback) {

  Usuario.findOne({ 'email' : email }, function (err, user) {

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
