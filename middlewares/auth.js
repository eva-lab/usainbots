
var jwt       = require('jsonwebtoken'),
    Aplicacao = require('../src/models/Aplicacao'),
    rn        = require('random-number'),
    hash      = require('hash-generator'),
    exports   = module.exports;

// Verificar validade do Token
exports.isAuthenticated = function(req, res, next) {

  var headers  = req.headers.authorization;
  var token    = null;

  if(!headers){
    return res.status(400).json({
      mensagem: 'Erro de requisição'
    });
  }

  var bearer = headers.split(' ')[0].toLowerCase().trim();

  if(bearer != "bearer") {
    return res.status(400).json({
      mensagem: 'Erro de requisição'
    });
  }

  token = headers.split('Bearer').pop().trim();
  Aplicacao.verificarToken(token, "cufFz2Y7q734w011c3fMgOmje2XN4SH6", function(err, decoded){

    if (err) {

      if (err.name == 'TokenExpiredError') {
        return res.status(401).json({
          mensagem: 'Token expirado'
        });
      } else {
        return res.status(401).json({
          mensagem: 'Usuário não autorizado'
        });
      }

    } else {
      next();
    }

  });

}

// Cadastro
exports.signup = function (req, res, next) {

  var dados = req.body.dados;

  if(dados && dados.nome) {

    var random    = rn({ min: 30, max: 35, integer: true });
    dados.secret  = hash(random).toUpperCase();

    Aplicacao.cadastrar(dados, function(err, dadosApp) {

      if (err) {
        return res.status(202).json({
          mensagem: 'Credenciais inválidas'
        });
      } else {

        dados._id = dadosApp._id;

        Aplicacao.gerarToken(dados, "cufFz2Y7q734w011c3fMgOmje2XN4SH6", function(err, token) {

          if (err) {
            return res.status(202).json({
              mensagem: 'Credenciais inválidas'
            });
          }

          var query   = dados;
          query.token = token;

          Aplicacao.atualizar(query, function (err, dadosApp) {

            if (err) {
              return res.status(500).json({
                mensagem: 'Erro Interno'
              });
            }

            return res.status(200).json({
              mensagem: 'Aplicação cadastrada com sucesso',
              dados: dadosApp
            });

          });

        });

      }

    });

  } else {
    return res.status(400).json({
      mensagem: 'Erro de parâmetro(s)'
    });
  }

}

// Atualizar token
exports.refreshToken = function (req, res, next) {

  var dados = req.body.dados;
  dados._id  = req.params.id;
  
  if(dados && dados.secret && dados._id) {

    Aplicacao.pegar(dados, function(err, dados) {

      if (!dados) {
        return res.status(404).json({
          mensagem: 'Aplicação não identificada'
        });
      }

      if (err) {
        return res.status(500).json({
          mensagem: 'Erro Interno'
        });
      }

      Aplicacao.gerarToken(dados, "cufFz2Y7q734w011c3fMgOmje2XN4SH6", function(err, token) {

        if (err) {
          return res.status(202).json({
            mensagem: 'Credenciais inválidas'
          });
        }

        Aplicacao.atualizar({ _id: dados._id, token: token }, function (err, dadosApp) {

          if (err) {
            return res.status(500).json({
              mensagem: 'Erro Interno'
            });
          }

          return res.status(200).json({
            mensagem: 'Token atualizado com sucesso',
            dados: dadosApp
          });

        });

      });

    });

  } else {
    res.status(400).json({
      mensagem: 'Erro de parâmetro(s)'
    });
  }

}
