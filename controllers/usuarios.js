var express     = require('express'),
    router      = express.Router(),
    Usuario     = require('../models/Usuario'),
    Script    = require('../models/Script'),
    auth        = require('../strategies/auth'),
    Bot       = require('../models/Bot');

// rotas

router.post('/usuario/cadastrar',     auth.signup);
router.put('/usuario/editar/:id',     auth.isAuthenticated, atualizarUsuario);
router.post('/usuario/login',         auth.signin);
router.get('/usuario/:id/bots/',       auth.isAuthenticated, pegarBotsUsuarioPeloId);

// funcoes

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

function pegarBotsUsuarioPeloId (req, res, next) {

  Bot.pegarPeloIdUsuario(req.params.id, function(err, dadosBot){

    if(err) return res.status(500).json({
      status: 500,
      tipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

    res.status(200).json({
      status: 200,
      dados: dadosBot
    });

  });

}

// exports
module.exports = router;
