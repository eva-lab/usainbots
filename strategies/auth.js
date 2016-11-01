
var jwt       = require('jsonwebtoken'),
    exports   = module.exports,
    config    = require('../config/config'),
    Usuario   = require('../models/Usuario'),
    Script    = require('../models/Script');

// Verificar validade do Token
exports.isAuthenticated = function(req, res, next) {

  var headers  = req.headers.authorization;
  var token    = null;

  if(!headers){
    return res.status(400).json({
      status: 400,
      tipo: 'bad_request',
      mensagem: 'Erro de requisição'
    });
  }

  var bearer = headers.split(' ')[0].toLowerCase().trim();

  if(bearer != "bearer") {
    return res.status(400).json({
      status: 400,
      tipo: 'bad_request',
      mensagem: 'Erro de requisição'
    });
  }

  token = headers.split('Bearer').pop().trim();
  Usuario.verifyToken(token, config.secret.tokenSecret, function(err, decoded){

    if (err) {

      if (err.name == 'TokenExpiredError') {
        return res.status(401).json({
          status: 401,
          tipo: 'token_expired',
          mensagem: 'Token expirado'
        });
      } else {
        return res.status(401).json({
          status: 401,
          tipo: 'unauthorized',
          mensagem: 'Usuário não autorizado'
        });
      }

    } else {
      next();
    }

  });

}

// Cadastro
exports.signup =  function (req, res, next) {

  if(req.body && req.body.nome && req.body.email && req.body.senha) {

    var dados = req.body;
    dados.token = Usuario.generateToken(req.body.email, config.secret.tokenSecret);
    dados.senha = Usuario.generatePassword(req.body.senha);

    Usuario.criarUsuario(dados, function(err, dados) {

      if (err) {
        return res.status(200).json({
          status: 200,
          tipo: 'duplicated_email',
          mensagem: 'E-mail já cadastrado'
        });
      } else {
        return res.status(200).json({
          status: 200,
          mensagem: 'Usuário cadastrado com sucesso',
          dados: dados
        });
      }

    });

  } else {
    return res.status(400).json({
      status: 400,
      tipo: 'bad_request',
      mensagem: 'Erro de requisição'
    });
  }

}

// Login
exports.signin =  function (req, res, next) {

  Usuario.pegarPeloEmail(req.body.email, function(err, dados){

    if(err || !dados) {
      return res.status(200).json({
        status: 200,
        mensagem: 'Usuário não encontrado',
        dados: dados
      });
    } else {

      var confirmaSenha = Usuario.comparePassword(req.body.senha, dados.senha);

      if(!confirmaSenha) {
        return res.status(200).json({
          status: 200,
          mensagem: 'Autenticação inválida'
        });
      }

      dados.token = Usuario.generateToken(req.body.email, config.secret.tokenSecret);

      Usuario.atualizar({ idUsuario: dados._id ,token: dados.token }, function(err, dadosUsuario){

        if (err) {
          return res.status(500).json({
            status: 500,
            tipo: 'internal_server_error',
            mensagem: 'Erro Interno'
          });
        } else {

          return res.status(200).json({
            status: 200,
            dados: {
              id: dadosUsuario.idUsuario,
              nome: dadosUsuario.nome,
              email: dadosUsuario.email,
              token: dadosUsuario.token,
            }
          });

        }

      });

    }

  });

}
