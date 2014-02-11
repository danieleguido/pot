'use strict';

var express = require('express'),
    hbs     = require('express-hbs'),

    request = require('request'),
    colors  = require('colors'), // awesome colorful log
    crypto  = require('crypto'), // MD5 for google id
    cheerio = require('cheerio'), // fast HTML parser based on jquery

    sqlite3 = require('sqlite3').verbose(), // local LIGHT storage of results
    
    config = {
      port: 3000,
      GS:{ // googgle scholar
        url: "http://localhost:3000/gs",// "http://scholar.google.fr/scholar",
        reference_format: 4
      },
      theme: __dirname + "/contents/themes/milk",
      dbpath: __dirname + '/sqlite/pot.db'
    },

    db = new sqlite3.Database(config.dbpath),

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

app.get('/gs', function(req, res) {
  console.log('    /gs');
  res.render('gs', {

  });
});

app.get('/search/:query', function(req, res) {
  var googleid = crypto.createHash('md5').update(''+Math.random()).digest('hex').substring(16),
      qs = {
        q: req.params.query,
        start: 0,
        num: 20,
        hl: 'fr',
        as_sdt: '0,5',
      },
      output = {
        meta: {
          qs: qs,
          id: crypto.createHash('md5').update(JSON.stringify(qs)).digest('hex')
        },
        objects: []
      };

  console.log('    /search/', req.params.query);
  console.log('...'.grey, 'google scholar url', config.GS.url);

  request({
      url: config.GS.url,
      qs: qs,
      headers:{
        'User-Agent' : 'Mozilla/5.0',
        'Cookie' : 'GSP=ID=' + googleid + ':CF=' + config.GS.reference_format
      }
    }, function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        var g = cheerio.load(body);

        g('.gs_r').each(function(){
          var gs_r = g(this),
              title = g('.gs_ri h3', gs_r).text(),
              citation = g('.gs_fl a[href*="cites="]', gs_r),
              abstract = g('.gs_rs', gs_r).html(),
              metadata = g('.gs_a', gs_r),
              matches = {
                id: citation.attr('href').match(/\=(\d+)\&/),
                year: metadata.text().match(/, (\d+)/),
                cited_by: citation.text().match(/\d+/),
                authors: metadata.text().split(/ - /).shift().match(/([^\s,]{1,3}\s[^\s,…]+)/g) || []
              };

          output.objects.push({
            id: matches.id? matches.id.pop(): 'untitled',
            year: matches.year? matches.year.pop(): '',
            title: title,
            authors: matches.authors,
            abstract: abstract,
            cited_by: matches.cited_by? matches.cited_by.pop(): 0,
            cited_by_url: citation.attr('href')
          });
        });

        output.meta.length = output.objects.length;

        console.log('...'.grey, 'google scholar result: ', output.objects.length);
        
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.end(JSON.stringify(output, null, 2));
        
      } else{
        console.log(error)
      }
  });

  // generate hash google id
  
  console.log('generated', (googleid).green)
  //res.render('index', {});
});


/*
  
  Start your engines
  ===

*/
app.listen(config.port);
console.log('[o] Listening on port', (config.port + '').green);