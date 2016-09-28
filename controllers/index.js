var express     = require('express'),
    router      = express.Router();

router.get('/', function(req, res, next) {
  res.send('Seja bem vindo(a) a API Usain Bot');
});

module.exports = router;
