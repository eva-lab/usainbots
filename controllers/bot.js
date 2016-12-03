var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    moment      = require('moment'),
    pln         = require('../pln'),
    rn          = require('random-number'),
    Bot         = require('../models/Bot'),
    Canal       = require('../models/Canal'),
    frases      = require('../config/frases'),
    config      = require('../config/config');

router.post('/bot/cadastrar',                 cadastrar);
router.put('/bot/:id/atualizar',              atualizar);
router.get('/bot/:id/consulta',               consultar);
router.delete('/bot/:id/remover',             auth.isAuthenticated, remover);
router.post('/bot/:id/canal/cadastrar',       cadastrarCanal);
router.post('/canal/:id/document/cadastrar',  cadastrarDocument); //TODO: Remover rota e adaptar funcao ao crawler

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

      var botSentences    = bot.frases;
      var random          = null;
      var resposta        = null;

      // (1) tratamento
      dados.query = pln.processQuery(sentenceOriginal, { stemmering: true, lowercase: true });

      // (2) classificar
      var classify = pln.classifier(dados.query);

      // (3) sem respostas
      if (botSentences.semResposta.length < 1) {
        botSentences.semResposta = frases.semResposta;
      }

      if (botSentences.agradecimento.length < 1) {
        botSentences.agradecimento = frases.agradecimento;
      }

      if (botSentences.encerramento.length < 1) {
        botSentences.encerramento = frases.encerramento;
      }

      if (classify == 'questionamento'){

        dados.query = pln.processQuery(sentenceOriginal, { characters: true, stopwords: true, tokenizer: true, stemmering: true });

        Canal.consultarPeloIdBot(dados, function(err, documents){

          console.log(botSentences);

          if (err) {
            return res.status(500).json({
              erro: 'internal_server_error',
              mensagem: 'Erro Interno'
            });
          } else if(!documents || documents == "") {

            // sem resposta
            quantidade    = botSentences.semResposta.length -1;
            random        = rn({ min: 0, max: quantidade, integer: true });
            resposta      = botSentences.semResposta[random];

            // sem resposta  -> engajamento
            quantidade    = botSentences.engajamento.length -1;
            random        = rn({ min: 0, max: quantidade, integer: true });
            resposta      = resposta + "\n" + botSentences.engajamento[random];

            return res.status(200).json({ resposta: resposta });

          }

          // com resposta
          var documentContent = pln.weightReply({ documents: documents, query: dados.query });

          random = rn({ min: 0, max: botSentences.introducaoRespostas.length -1, integer: true });
          documentContent = botSentences.introducaoRespostas[random] + "\n" + documentContent;

          return res.status(200).json({ resposta: documentContent });

        });

      } else if (classify == 'agradecimento'){

        random      = rn({ min: 0, max: botSentences.agradecimento.length -1, integer: true });
        resposta    = botSentences.agradecimento[random];

        return res.status(200).json({ resposta: resposta });

      } else if (classify == 'encerramento'){

        random      = rn({ min: 0, max: botSentences.encerramento.length -1, integer: true });
        resposta    = botSentences.encerramento[random];

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

function cadastrarCanal (req, res, next) {

  if(req.params.id && req.body.dados) {

    var dados   = req.body.dados || [];
    var idBot   = req.params.id;
    var data    = moment().format();
    var canais  = [];
    var valido  = true;

    if(dados && dados.length > 0) {

      for (var i = 0; i < dados.length; i++) {

        if(dados[i].uri && dados[i].tipo) {
          dados[i].tipo = dados[i].tipo.toLowerCase();

          if(config.channels.tipos.indexOf(dados[i].tipo) < 0){
            valido = false;
            break;
          }
        } else {
          valido = false;
          break;
        }

        canais.push({
          idBot:        idBot,
          nome:         dados[i].nome,
          tipo:         dados[i].tipo,
          uri:          dados[i].uri,
          dataCriacao:  data,
          ultimaColeta: data
        });

      }

      if(!valido) {
        return res.status(400).json({
          erro: 'bad_request',
          mensagem: 'Erro de parâmetro(s)'
        });
      }

      Canal.cadastrarCanal(canais, function (err, canais) {

        if(err) {
          return res.status(500).json({
            erro: 'internal_server_error',
            mensagem: 'Erro interno'
          });
        }

        res.status(200).json({
          dados: canais,
          mensagem: 'Canal(s) inserido(s) com sucesso!'
        });

      });

    } else {
      res.status(400).json({
        erro: 'bad_request',
        mensagem: 'Erro de parâmetro(s)'
      });
    }

  } else {

    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function cadastrarDocument (req, res, next) {

  if(req.params.id && req.body.dados) {

    var dados       = req.body.dados || [];
    var idCanal     = req.params.id;
    var documents   = [];

    for (var i = 0; i < dados.length; i++) {

        documents.push({
          idCanal:  idCanal,
          titulo:   dados[i].titulo,
          conteudo: dados[i].conteudo,
        });

    }

    documents = pln.processData(documents, true);

    Canal.cadastrarDocuments(documents, function(err, documents){

      if(err) {
        return res.status(500).json({
          erro: 'internal_server_error',
          mensagem: 'Erro interno'
        });
      }

      res.status(200).json({
        dados: documents,
        mensagem: 'Document(s) inserido(s) com sucesso!'
      });

    });

  }
}

module.exports = router;
