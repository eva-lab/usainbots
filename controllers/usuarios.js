var express     = require('express'),
    router      = express.Router();

// Model
var Usuario     = require('../models/Usuario.js'),
    Entidade    = require('../models/Entidade.js');

// routes
router.post('/usuario/cadastrar', cadastrarUsuario);
router.put('/usuario/editar/:id', atualizarUsuario);
router.get('/usuario/:id/entidades', pegarUsuarios);

// callback`s

function cadastrarUsuario (req, res, next) {

  try {

    if(req.body) {

      Usuario.cadastrar(req.body, function(err, dados){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de parâmetro(s)'
          });
        }

        res.status(200).json({
          status: 200,
          mensagem: 'Usuário salvo com sucesso',
          dados: dados
        });

      });

    } else {

      res.status(400).json({
        status: 400,
        tipo: 'bad_request',
        mensagem: 'Erro de parâmetro(s)'
      });

    }

  } catch (e) {

    res.status(500).json({
      status: 500,
      ipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

function atualizarUsuario (req, res, next) {

  try {

    if(req.body) {

      var dados = {
        idUsuario : req.params.id,
        dados: req.body
      };

      Usuario.atualizar(dados, function(err, dados){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de requisição'
          });
        }

        res.status(200).json({
          status: 200,
          mensagem: 'Usuario atualizada com sucesso',
          dados: dados
        });

      });

    } else {

      res.status(400).json({
        status: 400,
        tipo: 'bad_request',
        mensagem: 'Erro de parâmetro(s)'
      });

    }

  } catch (e) {

    res.status(500).json({
      status: 500,
      tipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

function pegarUsuarios (req, res, next) {

  try {

    Entidade.pegarPeloIdUsuario(req.params.id, function(err, dados) {

      if(err) {
        res.status(400).json({
          status: 400,
          tipo: 'bad_request',
          mensagem: 'Erro de requisição'
        });
      }else{

        if(dados.idUsuario){

          res.status(200).json({
            status: 200,
            dados: dados
          });

        } else {
          res.status(404).json({
            status: 400,
            tipo: 'not_found',
            mensagem: 'Usuário não encontrado'
          });
        }

      }

    });

  } catch (e) {

    res.status(500).json({
      status: 500,
      tipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

// exports
module.exports = router;
