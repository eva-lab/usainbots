var express     = require('express'),
    router      = express.Router(),
    auth        = require('../strategies/auth'),
    moment      = require('moment'),
    RiveScript  = require('rivescript'),
    Bot         = require('../models/Bot'),
    Script      = require('../models/Script'),
    Wiki        = require('../strategies/crawler/wiki');

router.get('/crawler', crawler);

function crawler (req, res, next) {

  Wiki.getPage();

}



module.exports = router;
