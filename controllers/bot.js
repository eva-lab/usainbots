var express           = require('express'),
    router            = express.Router(),
    auth              = require('../strategies/auth'),
    moment            = require('moment'),
    pln               = require('../pln'),
    rn                = require('random-number'),
    frases            = require('../config/frases'),
    config            = require('../config/config'),
    webScrapping      = require('../webscrapping/'),
    natural           = require('natural'),
    treino            = require('../config/treino');

// Models
var Bot               = require('../models/Bot'),
    Documento         = require('../models/Documento'),
    Noticia           = require('../models/Noticia'),
    Evento            = require('../models/Evento');

router.post('/bot/cadastrar',                 auth.isAuthenticated, cadastrar);
router.put('/bot/:id/atualizar',              auth.isAuthenticated, atualizar);
router.get('/bot/:id/consulta',               auth.isAuthenticated, consultar);
router.delete('/bot/:id/remover',             auth.isAuthenticated, remover);
router.post('/bot/:id/documento/cadastrar',   auth.isAuthenticated, cadastrarDocumento);

function cadastrar (req, res, next) {

  if(req.body.dados) {

    var dadosReq = req.body.dados;
    dadosReq.dataCriacao = moment().format();

    Bot.cadastrar(dadosReq, function(err, dados){

      if(err || !dados) {
        res.status(404).json({
          erro: 'not_found',
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
      erro: 'bad_request',
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

      if(err || !dados) {
        res.status(404).json({
          erro: 'not_found',
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
            erro: 'not_found',
            mensagem: 'Bot não encontrado'
          });

        }

      }

    });

  } else {

    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro(s) de parâmetro(s)'
    });

  }

}

function consultar (req, res, next) {

  if (req.params.id && req.query.q) {

    var sentenceOriginal = req.query.q;
    var dados = { idBot : req.params.id, query : null, limite: 5};

    Bot.pegarPeloIdBot(dados.idBot, function(err, bot) {

      if (err) {
        return res.status(404).json({
          erro: 'not_found',
          mensagem: 'Bot não encontrado'
        });
      }

      var random          = null;
      var resposta        = null;
      var botSentences    = bot.frases;

      dados.query = pln.processQuery(sentenceOriginal, { stemmering: true, lowercase: true, accent: true });

      var classify = pln.classifier(dados.query);

      if(!botSentences.semResposta || botSentences.semResposta.length < 1){
        botSentences.semResposta = frases.semResposta
      }

      if(!botSentences.agradecimento || botSentences.agradecimento.length < 1){
        botSentences.agradecimento = frases.agradecimento
      }

      if(!botSentences.encerramento || botSentences.encerramento.length < 1){
        botSentences.encerramento = frases.encerramento
      }

      if(!botSentences.abertura || botSentences.abertura.length < 1){
        botSentences.abertura = frases.abertura
      }

      if(!botSentences.engajamento || botSentences.engajamento.length < 1){
        botSentences.engajamento = frases.engajamento
      }

      if (classify == 'apresentacao') {

        resposta = respostaRandom(botSentences.abertura);
        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'questionamento'){

        dados.query = pln.processQuery(sentenceOriginal, { characters: true, stopwords: true, tokenizer: true, stemmering: true });

        Documento.consultarPeloIdBot(dados, function(err, documentos) {

          if (err) {
            return res.status(500).json({
              erro: 'internal_server_error',
              mensagem: 'Erro Interno'
            });
          } else if(!documentos || documentos == "") {

            Documento.consultarRandom(dados, function(err, documentos) {

              resposta = respostaRandom(botSentences.semResposta);
              resposta = resposta + "\n" + respostaRandom(botSentences.engajamento);

              return res.status(200).json({ resposta: resposta, sugestoes: documentos || [] });

            });

          } else {

            // com resposta
            resposta = pln.weightReply({ documents: documentos, query: dados.query });

            Documento.consultarRandom(dados, function(err, documentos) {
              res.status(200).json({ resposta: resposta, sugestoes: documentos || [] });
            });

          }

        });

      } else if (classify == 'agradecimento'){

        resposta = respostaRandom(botSentences.agradecimento);
        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'encerramento'){

        resposta = respostaRandom(botSentences.encerramento);
        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'abertura') {

        resposta = respostaRandom(botSentences.engajamento);
        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'noticias') {
        Noticia.pegar(function(err, noticias){

          if (err || !noticias) {
            return res.status(404).json({
              erro: 'not_found',
              mensagem: 'Não foi encontrada nenhuma noticia'
            });
          }

          return res.status(200).json({ tipo:'noticias', noticias: noticias });

        });
      } else if (classify == 'eventos') {
        Evento.pegar(function(err, eventos){

          if (err || !eventos) {
            return res.status(404).json({
              erro: 'not_found',
              mensagem: 'Não foi encontrado nenhum evento'
            });
          }

          return res.status(200).json({ tipo:'eventos', eventos: eventos });

        });
      } else {

        Documento.consultarRandom(dados, function(err, documentos) {

          resposta = respostaRandom(botSentences.semResposta);
          resposta = resposta + "\n" + respostaRandom(botSentences.engajamento);

          res.status(200).json({ resposta: resposta, sugestoes: documentos || [] });

        });

      }

    });

  } else {
    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro(s) de parâmetro(s)'
    });
  }

}

function respostaRandom (sentenca) {

  var random = rn({ min: 0, max: sentenca.length-1, integer: true });

  return sentenca[random];

}

function remover (req, res, next) {

  if(req.params.id) {

    Bot.remover(req.params.id, function(err){

      if(err) {
        res.status(404).json({
          erro: 'not_found',
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
      erro: 'bad_request',
      mensagem: 'Erro(s) de parâmetro(s)'
    });

  }

}

function cadastrarDocumento (req, res, next) {

  if(req.params.id && req.body.dados) {

    var dados       = req.body.dados || [];
    var tipo        = req.body.tipo || req.body.dados.tipo;
    var idBot       = req.params.id;
    var data        = moment().format();

    if(!tipo){
      return res.status(400).json({
        mensagem: 'Erro de parâmetro(s)'
      });
    }

    dados.dataCriacao  = data;

    if(dados.uri) {

      webScrapping.process(dados, function(err, dados){

        if(err) {
          return res.status(404).json({
            erro: 'not_found',
            mensagem: 'Página não encontrada'
          });
        }

        inserirDocumento(dados, function(err, dados){

          if(err) {
            return res.status(404).json({
              erro: 'not_found',
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

      inserirDocumento(dados, function(err, dados){

        if(err) {
          return res.status(404).json({
            erro: 'not_found',
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
      erro: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function inserirDocumento (dados, callback) {

    if(!dados.length) {
      dados = [dados];
    }

    dados = pln.processData(dados, true);

    Documento.cadastrarDocumento(dados, function(err, documento){

      if(err) {
        callback(true);
      }

      callback(false, documento);

    });

}

module.exports = router;
