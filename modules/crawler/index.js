var express     = require('express'),
    General     = require('./general');
    exports     = module.exports;

exports.process = function(data, done) {

  if(data.tipo == 'simple-post') {

    General.getContentSimplePost(data, done);

  } else if(data.tipo == 'wiki') {

    General.getContentWiki(data, done);

  }

}
