var express     = require('express'),
    router      = express.Router(),
    passport    = require('passport');

// Model

var Usuario     = require('../models/Usuario.js'),
    Entidade    = require('../models/Entidade.js');

// routes

router.post('/usuario/cadastrar',     cadastrarUsuario);
router.put('/usuario/editar/:id',     atualizarUsuario);
router.get('/usuario/:id/entidades',  pegarEntidadesUsuario);
router.post('/usuario/login',         loginUsuario);

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
      console.log('nao autorizado');
      return next();
    }

    res.sendStatus(401);
}

// callback`s

function atualizarUsuario (req, res, next) {

  try {

    if(req.body) {

      var dados = {
        idUsuario : req.params.id,
        dados: req.body
      };

      Usuario.atualizar(dados, function(err, dados){

        if(err) {
          res.status(400).json({
            status: 400,
            tipo: 'bad_request',
            mensagem: 'Erro de requisição'
          });
        }

        res.status(200).json({
          status: 200,
          mensagem: 'Usuario atualizada com sucesso',
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

function pegarEntidadesUsuario (req, res, next) {

  try {

    Entidade.pegarPeloId(req.params.id, function(err, dados) {

      if(err) {
        res.status(400).json({
          status: 400,
          tipo: 'bad_request',
          mensagem: 'Erro de requisição'
        });
      }else{

        if(dados.idUsuario){

          res.status(200).json({
            status: 200,
            dados: dados
          });

        } else {
          res.status(404).json({
            status: 400,
            tipo: 'not_found',
            mensagem: 'Usuário não encontrado'
          });
        }

      }

    });

  } catch (e) {

    res.status(500).json({
      status: 500,
      tipo: 'internal_server_error',
      mensagem: 'Erro Interno'
    });

  }

}

function loginUsuario (req, res, next) {

  // try {

    // if(req.body) {

      // req.body.senha = Usuario.hashSenha(req.body.senha);

    //   Usuario.pegarPeloEmail(req.body, function(err, dados) {
    //
    //     if(err || !dados) {
    //
    //       res.status(404).json({
    //         status: 400,
    //         tipo: 'not_found',
    //         mensagem: 'Credenciais de login incorretas'
    //       });
    //
    //     } else{
    //
    //       res.status(200).json({
    //         status: 200,
    //         dados: dados
    //       });
    //
    //     }
    //
    //   });
    //
    // } else {
    //   res.status(400).json({
    //     status: 400,
    //     tipo: 'bad_request',
    //     mensagem: 'Erro de requisição'
    //   });
    // }


  // } catch (e) {
  //
  //   res.status(500).json({
  //     status: 500,
  //     tipo: 'internal_server_error',
  //     mensagem: 'Erro Interno'
  //   });
  //
  // }

}

function cadastrarUsuario (req, res, next){

  passport.authenticate('local-cadastro', function(err, user) {

    if (err) {
      res.status(500).json({
        status: 500,
        tipo: 'internal_server_error',
        mensagem: 'Erro Interno'
      });
    } else if (!user) {
      res.status(401).json({
        status: 401,
        mensagem: 'Usuário não autorizado'
      });
    } else {
      res.status(200).json({
        status: 200,
        dados: user,
        mensagem: 'Cadastro realizado com sucesso'
      });
    }

  })(req, res, next);

}

// exports
module.exports = router;
