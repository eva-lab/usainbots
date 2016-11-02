var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    Script      = require('../models/Script'),
    fs          = require('fs'),
    moment      = require('moment'),
    Usuario     = require('../models/Usuario');

// routas
router.post('/script/cadastrar',      auth.isAuthenticated, cadastrar);
router.put('/script/:id/atualizar',   auth.isAuthenticated, atualizar);
router.delete('/script/:id/remover',  auth.isAuthenticated, remover);

// funcoes
function cadastrar (req, res, next) {

  if(req.body.dados) {

    var dados = req.body.dados;
    dados.nomeArquivo = moment().valueOf() + '' + dados.idBot + '.rive';

    Script.cadastrar(dados, function(err, dadosScript){

      if(err || !dadosScript) {
        return res.status(404).json({
          erro: 'not_found',
          mensagem: 'Script não encontrado'
        });
      }

      fs.writeFile('./files/' + dados.nomeArquivo, dados.conteudo, function(err){

        if(err) return res.status(500).json({
          erro: 'internal_server_error',
          mensagem: 'Erro Interno'
        });

        res.status(200).json({
          mensagem: 'Script salvo com sucesso',
          dados: dadosScript
        });

      });

    });

  } else {

    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro(s) de parâmetro(s)'
    });

  }

}

function atualizar (req, res, next) {

  if(req.body.dados) {

    var dados = {
      idScript : req.params.id,
      dados: req.body.dados
    };

    Script.atualizar(dados, function(err, dadosScript){

      if(err || !dadosScript) {
        return res.status(404).json({
          erro: 'not_found',
          mensagem: 'Script não encontrado'
        });
      }

      fs.writeFile('./files/' + dadosScript.nomeArquivo, dadosScript.conteudo , 'utf-8', function (err) {

        if(err) return res.status(500).json({
          erro: 'internal_server_error',
          mensagem: 'Erro Interno'
        });

        res.status(200).json({
          mensagem: 'Script atualizado com sucesso',
          dados: dadosScript
        });

      });

    });

  } else {

    res.status(400).json({
      erro: 'bad_request',
      mensagem: 'Erro de parâmetro(s)'
    });

  }

}

function remover (req, res, next) {

  if(req.params.id) {

    Script.remover(req.params.id, function(err){

      if(err ) {
        res.status(404).json({
          erro: 'not_found',
          mensagem: 'Script não encontrado'
        });
      } else {

        fs.unlink('./files/' + req.body.dados.nomeArquivo, function (err) {

          if(err) return res.status(500).json({
            erro: 'internal_server_error',
            mensagem: 'Erro Interno'
          });

          res.status(200).json({
            mensagem: 'Script removido com sucesso',
          });

        });

      }

    });

  } else {

    res.status(400).json({
      status: 400,
      erro: 'bad_request',
      mensagem: 'Erro(s) de parâmetro(s)'
    });

  }

}

// exports
module.exports = router;
