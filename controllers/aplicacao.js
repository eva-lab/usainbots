var express     = require('express'),
    router      = express.Router(),
    Applicacao  = require('../models/Aplicacao'),
    auth        = require('../strategies/auth'),
    Bot         = require('../models/Bot');

router.post('/app/cadastrar',           auth.signup);
router.put('/app/:id/atualizar',        auth.isAuthenticated, atualizar);
router.put('/app/:id/atualizar/token',  auth.refreshToken);
router.get('/app/:id/bots/',            auth.isAuthenticated, pegarBot);

function atualizar (req, res, next) {

  if(req.body.dados) {

    var data = {
      idUsuario : req.params.id,
      dados: req.body.dados
    };

    Aplicacao.atualizar(data.dados, function(err, dados){

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

function pegarBot (req, res, next) {

  if(req.params.id) {

    Bot.pegarPeloIdApp(req.params.id, function(err, dadosBot){

      if(err) return res.status(500).json({
        mensagem: 'Erro Interno'
      });

      res.status(200).json({
        dados: dadosBot
      });

    });

  } else {

    res.status(400).json({
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

module.exports = router;
