
var jwt       = require('jsonwebtoken'),
    config    = require('../config/config'),
    Usuario   = require('../models/Usuario'),
    exports   = module.exports;

// Verificar validade do Token
exports.isAuthenticated = function(req, res, next) {

  var headers  = req.headers.authorization;
  var token    = null;

  if(!headers){
    return res.status(400).json({
      status: 400,
      erro: 'bad_request',
      mensagem: 'Erro de requisição'
    });
  }

  var bearer = headers.split(' ')[0].toLowerCase().trim();

  if(bearer != "bearer") {
    return res.status(400).json({
      status: 400,
      erro: 'bad_request',
      mensagem: 'Erro de requisição'
    });
  }

  token = headers.split('Bearer').pop().trim();
  Usuario.verifyToken(token, config.secret.tokenSecret, function(err, decoded){

    if (err) {

      if (err.name == 'TokenExpiredError') {
        return res.status(401).json({
          erro:     'unauthorized',
          mensagem: 'Token expirado'
        });
      } else {
        return res.status(401).json({
          erro:     'unauthorized',
          mensagem: 'Usuário não autorizado'
        });
      }

    } else {
      next();
    }

  });

}

// TODO: Inserir dados na aplicacao
// Cadastro
exports.signup =  function (req, res, next) {

  if(req.body.dados && req.body.dados.nome && req.body.dados.email && req.body.dados.senha) {

    var dados = req.body.dados;
    dados.token = Usuario.generateToken(dados.email, config.secret.tokenSecret);
    dados.senha = Usuario.generatePassword(dados.senha);

    Usuario.criarUsuario(dados, function(err, dadosUsuario) {

      if (err) {
        return res.status(202).json({
          erro: 'invalid_credentials',
          mensagem: 'Credenciais inválidas'
        });
      } else {
        return res.status(200).json({
          mensagem: 'Usuário cadastrado com sucesso',
          dados: dadosUsuario
        });
      }

    });

  } else {
    return res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro de requisição'
    });
  }

}

// Login
exports.signin =  function (req, res, next) {

  if(req.body.dados && req.body.dados.email && req.body.dados.senha) {

      Usuario.pegarPeloEmail(req.body.dados.email, function(err, dados){

        if(err || !dados) {
          return res.status(404).json({
            erro:     'not_found',
            mensagem: 'Usuário não encontrado'
          });
        } else {

          var confirmaSenha = Usuario.comparePassword(req.body.dados.senha, dados.senha);

          if(!confirmaSenha) {
            return res.status(202).json({
              erro:     'invalid_credentials',
              mensagem: 'Credenciais inválidas'
            });
          }

          dados.token = Usuario.generateToken(req.body.dados.email, config.secret.tokenSecret);

          Usuario.atualizar({ idUsuario: dados._id ,token: dados.token }, function(err, dadosUsuario){

            if (err) {
              return res.status(500).json({
                erro: 'internal_server_error',
                mensagem: 'Erro Interno'
              });
            } else {

              return res.status(200).json({
                dados: {
                  idUsuario: dadosUsuario.idUsuario,
                  nome: dadosUsuario.nome,
                  email: dadosUsuario.email,
                  token: dadosUsuario.token,
                }
              });

            }

          });

        }

      });

  } else {
    res.status(400).json({
      status: 400,
      erro: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });
  }

}
