
var jwt       = require('jsonwebtoken'),
    exports   = module.exports,
    Usuario   = require('../models/Usuario'),
    config    = require('../config/config');

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
  var tokenValido = Usuario.verifyToken(token, config.secret.tokenSecret);

  if(!tokenValido) {
    res.status(401).json({
      status: 401,
      tipo: 'unauthorized',
      mensagem: 'Usuário não autorizado'
    });
  } else {
    next();
  }

}

// Cadastro
exports.signup =  function (req, res, next) {

  if(req.body && req.body.nome && req.body.email && req.body.senha) {

    var dados = req.body;
    dados.token = Usuario.generateToken(req.body.email, config.secret.tokenSecret);
    dados.senha = Usuario.generatePassword(req.body.senha);

    Usuario.criarUsuario(dados, function(err, dados) {

      if (err) return res.status(200).json({
        status: 200,
        tipo: 'duplicated_email',
        mensagem: 'E-mail já cadastrado'
      });

      res.status(200).json({
        status: 200,
        mensagem: 'Usuário cadastrado com sucesso',
        dados: dados
      });

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

    if(err || !dados) return res.status(200).json({
      status: 200,
      mensagem: 'Usuário não encontrado',
      dados: dados
    });

    var confirmaSenha = Usuario.comparePassword(req.body.senha, dados.senha);

    if(!confirmaSenha) {
      return res.status(200).json({
        status: 200,
        mensagem: 'Autenticação inválida'
      });
    }

    dados.token = Usuario.generateToken(req.body.email, config.secret.tokenSecret);

    Usuario.atualizar({ idUsuario: dados._id ,token: dados.token }, function(err, dados){

      if (err) res.status(500).json({
        status: 500,
        tipo: 'internal_server_error',
        mensagem: 'Erro Interno'
      });

      return res.status(200).json({
        status: 200,
        mensagem: 'Login realizado',
        dados: {
          idUsuario: dados.idUsuario,
          nome: dados.nome,
          email: dados.email,
          token: dados.token
        }
      });

    });

  });

}
