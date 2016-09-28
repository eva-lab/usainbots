var express     = require('express'),
    router      = express.Router(),
    RiveScript  = require('rivescript');

router.get('/pesquisa', function(req, res, next) {

  var rive = new RiveScript();

  rive.loadFile([
    "files/teste.rive",
    "files/teste2.rive"
  ], done, erro);

  function done (batch_num) {
      rive.sortReplies();
      res.json({  dados: rive.reply("local-user", req.query.q)  });
  }

  function erro (err) {
    res.send('Erro ocorreu' + err);
  }

});

module.exports = router;
