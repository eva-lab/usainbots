var express     = require('express'),
    router      = express.Router(),
    Applicacao  = require('../models/Aplicacao'),
    Bot         = require('../models/Bot'),
    auth        = require('../../middlewares/auth');

router.post('/v1.0/app/cadastrar',           auth.signup);
router.put('/v1.0/app/:id/atualizar/token',  auth.refreshToken);
router.get('/v1.0/app/:id/bots/',            auth.isAuthenticated, pegarBot);
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
