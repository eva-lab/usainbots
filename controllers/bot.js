var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    moment      = require('moment'),
    pln         = require('../strategies/pln'),
    Bot         = require('../models/Bot'),
    Canal       = require('../models/Canal');

router.post('/bot/cadastrar',             auth.isAuthenticated, cadastrar);
router.put('/bot/:id/atualizar',          auth.isAuthenticated, atualizar);
router.get('/bot/:id/consulta',           consultar);
router.delete('/bot/:id/remover',         auth.isAuthenticated, remover);
router.post('/bot/:id/canal/cadastrar',   cadastrarCanal);
router.post('/canal/:id/feed/cadastrar',  cadastrarFeed); //TODO: Remover rota e adaptar funcao ao crawler

//TODO: REMOVER
router.post('/pln',                 pln.processar);
router.post('/pesar',               pln.pesar);

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

    var query = pln.processar(req.query.q);

    Canal.buscar(query, function(err, dados){

      if(err) return;

      console.log(dados[0].dados[0].tags);

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

    feeds = pln.processar(feeds, true);

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
