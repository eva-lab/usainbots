var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    moment      = require('moment'),
    pln         = require('../strategies/pln'),
    rn          = require('random-number'),
    Bot         = require('../models/Bot'),
    Canal       = require('../models/Canal'),
    frases      = require('../config/frases');

router.post('/bot/cadastrar',             cadastrar);
router.put('/bot/:id/atualizar',          atualizar);
router.get('/bot/:id/consulta',           consultar);
router.delete('/bot/:id/remover',         auth.isAuthenticated, remover);
router.post('/bot/:id/canal/cadastrar',   cadastrarCanal);
router.post('/canal/:id/feed/cadastrar',  cadastrarFeed); //TODO: Remover rota e adaptar funcao ao crawler

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

  if(req.params.id && req.query.q) {

    var frase = req.query.q;
    var dados = { idBot : req.params.id, query : null };

    Bot.pegarPeloIdBot(dados.idBot, function(err, bot) {

      if(err) {
        res.status(404).json({
          erro: 'not_found',
          mensagem: 'Bot não encontrado'
        });
      }

      // (1) tratamento
      dados.query = pln.processarQuery(frase, {
        acentos :   true,
        stemmering: true,
        conectivos: true
      });

      // (2) classificar
      var classifier = pln.classificar(dados.query);

      if(classifier.pergunta){

        dados.query = pln.processarQuery(frase, { all: true });

        Canal.consultarPeloIdBot(dados, function(err, feeds){

          if(err) {
            return res.status(500).json({
              erro: 'internal_server_error',
              mensagem: 'Erro Interno'
            });
          } else if(!feeds || feeds == "") {

            if(bot.frases.semResposta.length < 1){
              bot.frases.semResposta = frases.semResposta;
            }

            if(bot.frases.agradecimento.length < 1){
              bot.frases.agradecimento = frases.agradecimento;
            }

            var quantidade    = bot.frases.semResposta.length -1;
            var indice        = rn({ min: 0, max: quantidade, integer: true });
            var resposta      = bot.frases.semResposta[indice];

            quantidade    = bot.frases.engajamento.length -1;
            indice        = rn({ min: 0, max: quantidade, integer: true });
            resposta      = resposta + "\n" + bot.frases.engajamento[indice];

            return res.status(200).json({
              resposta: resposta
            });
          }

          var feed = pln.pesarDados({ feeds: feeds, query: frase });

          var quantidadeRespostas = bot.frases.introducaoRespostas.length -1;
          var indice = rn({ min: 0, max: quantidadeRespostas, integer: true });
          feed.conteudo = bot.frases.introducaoRespostas[indice] + "\n" + feed.conteudo;

          return res.status(200).json({
            resposta: feed.conteudo
          });

        });

      } else if(classifier.agradecimento){

        if(bot.frases.agradecimento.length < 1){
          bot.frases.agradecimento = frases.agradecimento;
        }

        var quantidade  = bot.frases.agradecimento.length -1;
        var indice      = rn({ min: 0, max: quantidade, integer: true });
        var resposta    = bot.frases.agradecimento[indice];

        if(!classifier.encerramento){

          if(bot.frases.engajamento.length < 1){
            bot.frases.engajamento = frases.engajamento;
          }

          quantidade    = bot.frases.engajamento.length -1;
          indice        = rn({ min: 0, max: quantidade, integer: true });
          resposta      = resposta + "\n" + bot.frases.engajamento[indice];

        }

        return res.status(200).json({
          resposta: resposta
        });

      } else if(classifier.encerramento){

        if(bot.frases.encerramento.length < 1){
          bot.frases.encerramento = frases.encerramento;
        }

        var quantidade  = bot.frases.encerramento.length -1;
        var indice      = rn({ min: 0, max: quantidade, integer: true });
        var resposta    = bot.frases.encerramento[indice];

        return res.status(200).json({
          resposta: resposta
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

    if(dados && dados.length > 0) {

      for (var i = 0; i < dados.length; i++) {
        canais.push({
          idBot:        idBot,
          nome:         dados[i].nome,
          tipo:         dados[i].tipo,
          endereco:     dados[i].endereco,
          dataCriacao:  data,
          ultimaColeta: data
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

function cadastrarFeed (req, res, next) {

  if(req.params.id && req.body.dados) {

    var dados   = req.body.dados || [];
    var feeds   = [];
    var idCanal = req.params.id;

    for (var i = 0; i < dados.length; i++) {
      feeds.push({
        idCanal:  idCanal,
        titulo:   dados[i].titulo,
        conteudo: dados[i].conteudo
      });
    }

    feeds = pln.processarDados(feeds, true);

    Canal.cadastrarFeeds(feeds, function(err, feeds){

      if(err) {
        return res.status(500).json({
          erro: 'internal_server_error',
          mensagem: 'Erro interno'
        });
      }

      res.status(200).json({
        dados: feeds,
        mensagem: 'Feed(s) inserido(s) com sucesso!'
      });

    });

  }
}

module.exports = router;
