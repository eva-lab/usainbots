var express     = require('express'),
    router      = express.Router(),
    RiveScript  = require('rivescript');

router.get('/pesquisa', function(req, res, next) {

  var rive = new RiveScript();

  rive.loadFile([
    "files/teste.rive",
    "files/teste2.rive"
  ], doneCallcack, erroCallback);

  function doneCallcack (batch_num) {

      rive.sortReplies();
      var reply = rive.reply("local-user", req.query.q);

      res.statusCode = 200;
      res.json({  dados: { statusCode: res.statusCode, mensagem: reply }});

  }

  function erroCallback (err) {

    res.statusCode = 500;
    res.json({ dados : { statusCode: res.statusCode, mensagem: 'Erro interno' } });

  }

});

module.exports = router;
