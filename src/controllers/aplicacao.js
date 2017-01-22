var express     = require('express'),
    router      = express.Router(),
    Applicacao  = require('../models/Aplicacao'),
    Bot         = require('../models/Bot'),
    auth        = require('../../middlewares/auth');

router.post('/app/cadastrar',           auth.signup);
router.put('/app/:id/atualizar/token',  auth.refreshToken);
router.get('/app/:id/bots/',            auth.isAuthenticated, pegarBot);

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
