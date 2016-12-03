var request   = require('request'),
    cheerio   = require('cheerio'),
    iconv     = require('iconv-lite'),
    exports   = module.exports;

exports.getContentSimplePost = function (selector){

  if(selector.charset != 'utf8') {
    selector.encoding = null;
  }

  request(selector, function(err, res, body) {

    if(err) return;

    if(selector.charset != 'utf8') {
        body = iconv.decode(body, selector.charset);
    }

    if(res.statusCode === 200) {

      var $ = cheerio.load(body, { ignoreWhitespace: false });

      var data  = { title: null, content: [] };

      data.title = $(selector.container + ' ' + selector.title).children('h2').text().trim();

      $(selector.container + ' ' + selector.text).each(function(i, elem) {

        if($(this).text().trim() != ""){
          data.content.push($(this).text().trim());
        }

      });

      return data;

     }
  });

}
