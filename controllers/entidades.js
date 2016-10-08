var express     = require('express'),
    router      = express.Router();

// Model
var Entidade = require('../models/Entidade.js');

// routes

router.post('/entidade/cadastrar', cadastrarEntidade);
router.put('/entidade/editar/:id', atualizarEntidade);


// callback`s

function cadastrarEntidade (req, res, next) {

  try {

    if(req.body) {

      Entidade.cadastrar(req.body, function(err, dados){

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

    if(req.body) {

      var dados = {
        idEntidade : req.params.id,
        dados: req.body
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
