var express       = require('express'),
    bodyParser    = require('body-parser'),
    app           = express(),
    loader        = require('./lib/loader'),
    cookieParser  = require('cookie-parser'),
    mongoose      = require('mongoose'),
    passport      = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    session       = require('express-session');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'j23ohjgxcdezw34H0i0f532zaqa2',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());

//
loader("controllers", function (files){
  for (var i = 0; i < files.length; i++) {
    app.use(require(files[i]));
  }
});

// Connect Mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/usainbot', function(err){
    if(err){
      console.log('Não foi possível conectar ao banco de dados');
      return;
    }
});

require('./strategies/local-auth')(passport);


// Start o Service
app.listen(8080, function () {
  console.log('Service ON');
});
