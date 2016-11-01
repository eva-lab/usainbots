var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    moment      = require('moment'),
    RiveScript  = require('rivescript'),
    Bot         = require('../models/Bot'),
    Script      = require('../models/Script');

router.post('/bot/cadastrar',       auth.isAuthenticated, cadastrar);
router.put('/bot/:id/atualizar',    auth.isAuthenticated, atualizar);
router.get('/bot/:id/consulta',     auth.isAuthenticated, consultar);
router.delete('/bot/:id/remover',   auth.isAuthenticated, remover);
router.get('/bot/:id/scripts',      auth.isAuthenticated, pegarScripts);

function cadastrar (req, res, next) {

  if(req.body.dados) {

    var dadosReq = req.body.dados;
    dadosReq.dataCriacao = moment().format();

    Bot.cadastrar(dadosReq, function(err, dados){

      if(err) {
        res.status(404).json({
          status: 404,
          tipo: 'not_found',
          mensagem: 'Bot não encontrado'
        });
      } else {
        res.status(200).json({
          status: 200,
          mensagem: 'Bot salvo com sucesso',
          dados: dados
        });
      }

    });

  } else {

    res.status(400).json({
      status: 400,
      tipo: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function atualizar (req, res, next) {

  if(req.params.id){

    var dadosReq = {
      id: req.params.id,
      dados: req.body.dados
    }

    Bot.atualizar(dadosReq, function(err, dados) {

      if(err) {
        res.status(404).json({
          status: 404,
          tipo: 'not_found',
          mensagem: 'Bot não encontrado'
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

  } else {

    res.status(400).json({
      status: 400,
      tipo: 'bad_request',
      mensagem: 'Erro de requisição'
    });

  }

}

function consultar (req, res, next) {

  Script.pegarArquivosPeloIdBot(req.params.id, function(err, dados) {

    if(err) {
      res.status(404).json({
        status: 404,
        tipo: 'not_found',
        mensagem: 'Bot não encontrado'
      });
    } else {
      
      var rive = new RiveScript();

      rive.loadFile(dados, done, error);

      function done (batch_num) {

          rive.sortReplies();
          var reply = rive.reply("local-user", req.query.q);

          res.statusCode = 200;
          res.json({  dados: { statusCode: res.statusCode, mensagem: reply }});

      }

      function error (error) {

        res.statusCode = 500;
        res.json({ dados : { statusCode: res.statusCode, mensagem: 'Erro interno' } });

      }
    }

  });

}

function remover (req, res, next) {

  if(req.params.id) {

    Bot.remover(req.params.id, function(err){

      if(err) {
        res.status(400).json({
          status: 400,
          tipo: 'bad_request',
          mensagem: 'Erro de requisição'
        });
      } else {
        res.status(200).json({
          status: 200,
          mensagem: 'Bot removido com sucesso',
        });
      }

    });

  } else {

    res.status(400).json({
      status: 400,
      tipo: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function pegarScripts (req, res, next) {

  if(req.params.id) {

    Script.pegarPeloIdBot(req.params.id, function(err, dados){

      if(err) {
        res.status(404).json({
          status: 404,
          tipo: 'not_found',
          mensagem: 'Bot não encontrado'
        });
      } else {
        res.status(200).json({
          status: 200,
          dados: dados
        });
      }

    });
  }
}

module.exports = router;
