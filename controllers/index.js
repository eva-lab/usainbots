var express     = require('express'),
    crawler     = require('../strategies/crawler'),
    router      = express.Router();

router.get('/', function(req, res, next) {
  res.send('Seja bem vindo(a) a API Usain Bot');
});

// router.get('/crawler', function(req, res, next) {
//   crawler();
//   res.send('Seja bem vindo(a) a API Usain Bot');
// });

module.exports = router;
