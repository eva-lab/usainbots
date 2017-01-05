var exports   = module.exports,
    fs = require('file-system');

function initLoader() {

  return loadControllers("src/controllers");

}

function loadControllers(dir) {

  var path = require("path").join(__dirname, "../" + dir);
  var files = [];

  require("fs").readdirSync(path).forEach(function(file) {
    files.push("./" + dir + "/" + file);
  });

  return files;

};

exports.init = initLoader;
