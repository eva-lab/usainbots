const express     = require('express'),
    webscrap    = require('./webscrap');

module.exports.process = function(data, done) {

  // if(data.tipo == 'commonPost') {

  //   webscrap.commonPost(data, done);

  // } else 
  if(data.tipo == 'wiki') {

    webscrap.wiki(data, done);

  }

}
