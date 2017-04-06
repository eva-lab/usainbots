const express           = require('express'),
    router            = express.Router(),
    moment            = require('moment'),
    rn                = require('random-number'),
    auth              = require('../../middlewares/auth'),
    webScrapping      = require('../../core/crawler/'),
    NLP               = require('../../core/natural_processing/'),
    classifier        = require('../../core/natural_processing/classifier'),
    extractor         = require('../../core/natural_processing/extractor'),
    weighter          = require('../../core/natural_processing/weight'),
    Bot               = require('../models/Bot'),
    Documento         = require('../models/Documento');

router.post('/v1.0/bot/cadastrar',                 auth.isAuthenticated, cadastrar);
router.put('/v1.0/bot/:id/atualizar',              auth.isAuthenticated, atualizar);
router.get('/v1.0/bot/:id/consultar',              auth.isAuthenticated, consultar);
router.delete('/v1.0/bot/:id/remover',             auth.isAuthenticated, remover);
router.post('/v1.0/bot/:id/documento/cadastrar',   auth.isAuthenticated, cadastrarDocumento);

function cadastrar (req, res, next) {

  let dadosReq = req.body.dados;

  if(dadosReq && dadosReq.idApp && dadosReq.nome) {

    dadosReq.dataCriacao = moment().format();

    Bot.cadastrar(dadosReq, function(err, dados){

      if(err || !dados) {
        res.status(404).json({
          mensagem: 'Bot não encontrado'
        });

      } else {
        res.status(200).json({
          dados: dados,
          mensagem: 'Bot salvo com sucesso'
        });
      }

    });

  } else {

    res.status(400).json({
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function atualizar (req, res, next) {

  if(req.params.id){

    let dadosReq = {
      id: req.params.id,
      dados: req.body.dados
    }

    Bot.atualizar(dadosReq, function(err, dados) {

      if(err || !dados) {
        res.status(404).json({
          mensagem: 'Bot não encontrado'
        });
      } else {

        if(dados){

          res.status(200).json({
            dados: dados,
            mensagem: 'Bot atualizado com sucesso'
          });

        } else {

          res.status(404).json({
            mensagem: 'Bot não encontrado'
          });

        }

      }

    });

  } else {

    res.status(400).json({
      mensagem: 'Erro(s) de parâmetro(s)'
    });

  }

}

function consultar (req, res, next) {

  if(!req.params.id || !req.query.q) {
    return res.status(400).json({
      mensagem: 'Erro(s) de parâmetro(s)'
    });
  }

  Bot.pegarPeloIdBot(req.params.id, function(err, bot) {

    if (err) {
      return res.status(404).json({
        mensagem: 'Bot não identificado'
      });
    }

    NLP.init({
      query: req.query.q.trim(),
      bot: bot
    }, function(err, data) {
      
      if(err) {
        return res.status(data.err || 500).json({
          mensagem: "Erro interno"
        });
      }

      res.status(200).json(data);
      
    });
    
  });

}

function remover (req, res, next) {

  if(req.params.id) {

    Bot.remover(req.params.id, function(err){

      if(err) {
        res.status(404).json({
          mensagem: 'Bot não encontrado'
        });
      } else {
        res.status(200).json({
          mensagem: 'Bot removido com sucesso',
        });
      }

    });

  } else {

    res.status(400).json({
      mensagem: 'Erro(s) de parâmetro(s)'
    });

  }

}

function cadastrarDocumento (req, res, next) {

  if(req.params.id && req.body.dados) {

    let dados       = req.body.dados || [];
    let tipo        = req.body.tipo || req.body.dados.tipo;
    let idBot       = req.params.id;
    let data        = moment().format();

    if(!tipo){
      return res.status(400).json({
        mensagem: 'Erro de parâmetro(s)'
      });
    }

    dados.dataCriacao  = data;

    if(dados.url) {

      webScrapping.process(dados, function(err, dados) {

        if(err) {
          return res.status(404).json({
            mensagem: 'Página não encontrada'
          });
        }

        inserirDocumento(dados, idBot, function(err, dados) {

          if(err) {
            return res.status(404).json({
              mensagem: 'Página não encontrada'
            });
          }

          res.status(200).json({
            dados: dados,
            mensagem: 'Documento inserido com sucesso!'
          });

        });

      });

    } else {

      inserirDocumento(dados, idBot, function(err, dados){

        if(err) {
          return res.status(404).json({
            mensagem: 'Página não encontrada'
          });
        }

        res.status(200).json({
          dados: dados,
          mensagem: 'Documento inserido com sucesso!'
        });

      });

    }

  } else {

    res.status(400).json({
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function inserirDocumento (data, idBot, callback) {

    if(!(data instanceof Array))  data = [data];

    let documents = [];

    for (let i = 0; i < data.length; i++) {
      documents.push({
        titulo: data[i].titulo,
        conteudo: data[i].conteudo,
        idBot: idBot,
        tags: {
          titulo:   extractor.extract([data[i].titulo])[0],
          conteudo: extractor.extract(data[i].conteudo)
        }
      });
    }

    Documento.cadastrarDocumento(documents, function(err, savedDocuments){

      if(err)  return callback(true);

      callback(false, savedDocuments);

    });

}

module.exports = router;
