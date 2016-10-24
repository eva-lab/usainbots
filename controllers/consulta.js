var express     = require('express'),
    router      = express.Router(),
    RiveScript  = require('rivescript');

router.get('/consulta', function(req, res, next) {

  var rive = new RiveScript();

  rive.loadFile([
    "files/cin.rive"
  ], done, err);

  function done (batch_num) {

      rive.sortReplies();
      var reply = rive.reply("local-user", req.query.q);

      res.statusCode = 200;
      res.json({  dados: { statusCode: res.statusCode, mensagem: reply }});

  }

  function err (err) {

    res.statusCode = 500;
    res.json({ dados : { statusCode: res.statusCode, mensagem: 'Erro interno' } });

  }

});

module.exports = router;
