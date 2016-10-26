var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    Entidade = require('../models/Entidade.js');

// routes

router.post('/entidade/cadastrar',      auth.isAuthenticated, cadastrarEntidade);
router.put('/entidade/editar/:id',      auth.isAuthenticated, atualizarEntidade);
router.delete('/entidade/remover/:id',  auth.isAuthenticated, removerEntidade);


// callback`s

function cadastrarEntidade (req, res, next) {

  try {

    if(req.body.dados) {

      Entidade.cadastrar(req.body.dados, function(err, dados){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de parâmetro(s)'
          });
        }

        res.status(200).json({
          status: 200,
          mensagem: 'Entidade salva com sucesso',
          dados: dados
        });

      });

    } else {

      res.status(400).json({
        status: 400,
        tipo: 'bad_request',
        mensagem: 'Erro de parâmetro(s)'
      });

    }

  } catch (e) {

    res.status(500).json({
      status: 500,
      ipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

function atualizarEntidade (req, res, next) {

  try {

    if(req.body.dados) {

      var dados = {
        idEntidade : req.params.id,
        dados: req.body.dados
      };

      Entidade.atualizar(dados, function(err, dados){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de requisição'
          });
        }

        res.status(200).json({
          status: 200,
          mensagem: 'Entidade atualizada com sucesso',
          dados: dados
        });

      });

    } else {

      res.status(400).json({
        status: 400,
        tipo: 'bad_request',
        mensagem: 'Erro de parâmetro(s)'
      });

    }

  } catch (e) {

    res.status(500).json({
      status: 500,
      tipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

function removerEntidade (req, res, next) {

  try {

    if(req.body) {

      Entidade.remover(req.params.id, function(err){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de requisição'
          });
        }

        res.status(200).json({
          status: 200,
          mensagem: 'Entidade atualizada com sucesso',
        });

      });

    } else {

      res.status(400).json({
        status: 400,
        tipo: 'bad_request',
        mensagem: 'Erro de parâmetro(s)'
      });

    }

  } catch (e) {

    res.status(500).json({
      status: 500,
      tipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

// exports
module.exports = router;
