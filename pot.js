'use strict';

var express = require('express'),
    hbs = require('express-hbs'),
    request = require('request'),
    colors = require('colors'),

    config = {
      port: 3000,
      theme: __dirname + "/contents/themes/milk",
    },



    app = express();



console.log('[o] starting', 'pot'.blue)
console.log('[o] theme:',(config.theme.split('/').pop() + '').green);

app.engine('hbs', hbs.express3({
  partialsDir: [config.theme + '/partials'],
  defaultLayout: config.theme + '/index.hbs'
}));
app.use(express.static(config.theme + '/assets'));
app.set('view engine', 'hbs');
app.set('views', config.theme);


/*
  
  Controllers
  ===

*/
app.get('/', function(req, res) {
  res.render('index', {
  });
});

app.get('/search/:query', function(req, res) {
  console.log('/query/',req.params.query)
  res.render('index', {
  });
});


/*
  
  Start your engines
  ===

*/
app.listen(config.port);
console.log('[o] Listening on port', (config.port + '').green);