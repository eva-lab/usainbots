var express     = require('express'),
    CIn         = require('../webscrapping/cin'),
    General     = require('../webscrapping/general');
    exports     = module.exports;

exports.process = function(data, done) {

  if(data.tipo == 'simple-post') {

    General.getContentSimplePost(data, done);

  } else if(data.tipo == 'wiki') {

    General.getContentWiki(data, done);

  } else if(data.tipo == 'cin-noticias') {

    CIn.getNews(data, done);

  } else if(data.tipo == 'cin-eventos') {

    CIn.getEvents(data, done);

  }

}
