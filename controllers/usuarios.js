var express     = require('express'),
    router      = express.Router(),
    Usuario     = require('../models/Usuario'),
    Entidade    = require('../models/Entidade'),
    auth        = require('../strategies/auth');

// routes

router.post('/usuario/cadastrar',     auth.signup);
router.put('/usuario/editar/:id',     auth.isAuthenticated, atualizarUsuario);
router.get('/usuario/:id/entidades',  auth.isAuthenticated, pegarEntidadesUsuario);
router.post('/usuario/login',         auth.signin);

// callback`s

function atualizarUsuario (req, res, next) {

  try {

    if(req.body) {

      var data = {
        idUsuario : req.params.id,
        dados: req.body
      };

      Usuario.atualizar(data.dados, function(err, dados){

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

function pegarEntidadesUsuario (req, res, next) {

  try {

    Entidade.pegarPeloIdUsuario(req.params.id, function(err, dados) {

      if(err) {
        res.status(400).json({
          status: 400,
          tipo: 'bad_request',
          mensagem: 'Erro de requisição'
        });
      } else {

        if(dados){

          res.status(200).json({
            status: 200,
            dados: dados
          });

        } else {

          res.status(400).json({
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
