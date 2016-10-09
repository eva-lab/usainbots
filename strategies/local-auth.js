var LocalStrategy = require('passport-local').Strategy;
var Usuario = require('../models/Usuario.js');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    Usuario.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-cadastro', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'senha',
    passReqToCallback: true,
  },
  function(req, email, password, done) {

    process.nextTick(function() {

      Usuario.pegarPeloEmail({ 'email':  email }, function(err, user) {

        if (err) return done(err);

        if (user) {
          return done(null, false);
        } else {
          var hash = Usuario.generateHash(password);
          var token = Usuario.gerarToken(req.body.nome, email);
          var dados = {
            nome: req.body.nome,
            email: email,
            senha: hash,
            token: token
          };
          Usuario.criarUsuario(dados, function(err, usuario){
            if (err){
              throw err;
            }
            return done(null, usuario);
          });
        }
      });
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'senha',
    passReqToCallback: true,
  },
  function(req, email, password, done) {
    Usuario.pegarPeloEmail({ 'email':  email }, function(err, user) {
      if (err)
          return done(err);
      if (!user)
          return done(null, false, {});
      if (!user.validPassword(password))
          return done(null, false, {});
      return done(null, user);
    });
  }));
};
