var express     = require('express'),
    router      = express.Router();

// Model
var Entidade = require('../models/Entidade.js');

router.post('/entidade/cadastrar', function(req, res, next) {

  try {

    if(req.body) {

      Entidade.cadastrar(req.body, function(err, dados){

        if(err) {
          res.status(500).json({
            status: 500,
            mensagem: 'Erro Interno'
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

    console.log(e);
    res.status(500).json({
      status: 500,
      mensagem: 'Erro Interno'
    });

  }

});

module.exports = router;
