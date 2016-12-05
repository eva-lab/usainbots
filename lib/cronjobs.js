var cron          = require('node-cron'),
    webscrapping  = require('../webscrapping'),
    Noticia       = require('../models/Noticia'),
    Evento        = require('../models/Evento'),
    exports       = module.exports;

exports.start =  function(){
  cron.schedule('0 11 * * *', function() {
    console.log('executando o cronjob');
    webscrapping.process({ tipo:  'cin-noticias'  }, function(err, dados){
      if(err) return;
      Noticia.cadastrar(dados, function(err, noticias){
        if(err) return;
      //  console.log(noticias);
      });
    });

    webscrapping.process({ tipo:  'cin-eventos'  }, function(err, dados){
      if(err) return;
      Evento.cadastrar(dados, function(err, eventos){
        if(err) return;
        // console.log(eventos);
      });
    });
  });
}
