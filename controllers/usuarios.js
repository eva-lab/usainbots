var express     = require('express'),
    router      = express.Router(),
    Usuario     = require('../models/Usuario'),
    auth        = require('../strategies/auth'),
    Bot         = require('../models/Bot');

// rotas

// TODO: ARRUMAR NO CREATOR
router.post('/usuario/cadastrar',     auth.signup);
router.put('/usuario/:id/atualizar',  auth.isAuthenticated, atualizarUsuario);
router.post('/usuario/login',         auth.signin);
router.get('/usuario/:id/bots/',      auth.isAuthenticated, pegarBotsUsuarioPeloId);

// funcoes

function atualizarUsuario (req, res, next) {

  if(req.body.dados) {

    var data = {
      idUsuario : req.params.id,
      dados: req.body.dados
    };

    Usuario.atualizar(data.dados, function(err, dados){

      if(err) {
        res.status(400).json({
          erro: 'bad_request',
          mensagem: 'Erro de parâmetro(s)'
        });
      }

      if(!dados) {
        return res.status(404).json({
          erro: 'not_found',
          mensagem: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        mensagem: 'Usuário atualizado com sucesso',
        dados: dados
      });

    });

  } else {

    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function pegarBotsUsuarioPeloId (req, res, next) {

  if(req.params.id) {

    Bot.pegarPeloIdUsuario(req.params.id, function(err, dadosBot){

      if(err) return res.status(500).json({
        erro: 'internal_server_error',
        mensagem: 'Erro Interno'
      });

      res.status(200).json({
        dados: dadosBot
      });

    });

  } else {

    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

// exports
module.exports = router;
