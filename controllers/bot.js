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

// Rotas
router.post('/bot/cadastrar',                 cadastrar);
router.put('/bot/:id/atualizar',              atualizar);
router.get('/bot/:id/consulta',               consultar);
router.delete('/bot/:id/remover',             auth.isAuthenticated, remover);
router.post('/bot/:id/documento/cadastrar',   cadastrarDocumento);

// Callbacks
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
    var dados = { idBot : req.params.id, query : null };

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

      console.log(dados.query);

      console.log(classify);

      if (classify == 'apresentacao') {


        random      = rn({ min: 0, max: botSentences.abertura.length-1, integer: true });
        resposta    = botSentences.abertura[random];

        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'questionamento'){

        dados.query = pln.processQuery(sentenceOriginal, { characters: true, stopwords: true, tokenizer: true, stemmering: true });

        Documento.consultarPeloIdBot(dados, function(err, documents) {

          if (err) {
            return res.status(500).json({
              erro: 'internal_server_error',
              mensagem: 'Erro Interno'
            });
          } else if(!documents || documents == "") {

            // sem resposta
            quantidade    = botSentences.semResposta.length-1;
            random        = rn({ min: 0, max: quantidade, integer: true });
            resposta      = botSentences.semResposta[random];

            // sem resposta  -> engajamento
            quantidade    = botSentences.engajamento.length-1;
            random        = rn({ min: 0, max: quantidade, integer: true });
            resposta      = resposta + "\n" + botSentences.engajamento[random];

            return res.status(200).json({ resposta: resposta });

          }

          // com resposta
          var documentContent = pln.weightReply({ documents: documents, query: dados.query });

          return res.status(200).json({ resposta: documentContent });

        });

      } else if (classify == 'agradecimento'){

        random      = rn({ min: 0, max: botSentences.agradecimento.length-1, integer: true });
        resposta    = botSentences.agradecimento[random];

        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'encerramento'){

        random      = rn({ min: 0, max: botSentences.encerramento.length-1, integer: true });
        resposta    = botSentences.encerramento[random];

        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'abertura') {

        random      = rn({ min: 0, max: botSentences.engajamento.length-1, integer: true });
        resposta    = botSentences.engajamento[random];

        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'noticias') {
        Noticia.pegar(function(err, noticias){

          if (err || !noticias) {
            return res.status(404).json({
              erro: 'not_found',
              mensagem: 'Não foi encontrada nenhuma noticia'
            });
          }

          return res.status(200).json({ tipo:'noticias', dados: noticias });

        });
      } else if (classify == 'eventos') {
        Evento.pegar(function(err, eventos){

          if (err || !eventos) {
            return res.status(404).json({
              erro: 'not_found',
              mensagem: 'Não foi encontrado nenhum evento'
            });
          }

          return res.status(200).json({ tipo:'eventos', dados: eventos });

        });
      } else {

        console.log('caiu aqui');

        // sem resposta
        quantidade    = botSentences.semResposta.length-1;
        random        = rn({ min: 0, max: quantidade, integer: true });
        resposta      = botSentences.semResposta[random];

        // sem resposta  -> engajamento
        quantidade    = botSentences.engajamento.length-1;
        random        = rn({ min: 0, max: quantidade, integer: true });
        resposta      = resposta + "\n" + botSentences.engajamento[random];

        return res.status(200).json({ resposta: resposta });

      }

    });

  } else {
    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro(s) de parâmetro(s)'
    });
  }

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
    var idBot       = req.params.id;
    var data        = moment().format();

    if(!dados.tipo){
      return res.status(400).json({
        erro: 'bad_request',
        mensagem: 'Erro de parâmetro(s)'
      });
    }

    dados.dataCriacao  = data;
    dados.ultimaColeta = data;

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