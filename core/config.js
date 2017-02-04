var env_dev  = require('../env/development.json'),
    env_prod   = require('../env/production.json'),
    exports   = module.exports;

exports.env = function(){

  switch(process.env.NODE_ENV) {

    case 'development':
      return env_dev;

    case 'production':
      return env_prod;

    default:
      return {};

  }

};
