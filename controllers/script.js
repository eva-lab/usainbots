var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    Script      = require('../models/Script');

// routas
router.post('/script/cadastrar',      auth.isAuthenticated, cadastrar);
router.put('/script/:id/atualizar',   auth.isAuthenticated, atualizar);
router.delete('/script/:id/remover',  auth.isAuthenticated, remover);

// funcoes
function cadastrar (req, res, next) {

  try {

    if(req.body.dados) {

      Script.cadastrar(req.body.dados, function(err, dados){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de parâmetro(s)'
          });
        }

        res.status(200).json({
          status: 200,
          mensagem: 'Script salva com sucesso',
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

function atualizar (req, res, next) {

  try {

    if(req.body.dados) {

      var dados = {
        idScript : req.params.id,
        dados: req.body.dados
      };

      Script.atualizar(dados, function(err, dados){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de requisição'
          });
        } else {
          res.status(200).json({
            status: 200,
            mensagem: 'Script atualizada com sucesso',
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

  } catch (e) {

    res.status(500).json({
      status: 500,
      tipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

function remover (req, res, next) {

  try {

    if(req.params.id) {


      Script.remover(req.params.id, function(err){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de requisição'
          });
        } else {
          res.status(200).json({
            status: 200,
            mensagem: 'Script removida com sucesso',
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
