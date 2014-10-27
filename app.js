var express = require('express');
var app = express();
var querystring = require("querystring");
var http = require('http');

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.bodyParser({ keepExtensions:true, uploadDir: __dirname + '/public/downloads' }));
app.use(app.router);
app.use(express.static(__dirname + '/public'));

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.get('/index', function(req, res) {
  res.render("index");
});

app.get('/', function(req, res) {
  res.render("index");
  
});
app.post('/checkUser', function(req, res) {
  phone = req.body.phone;
  var options = {
    host:'localhost',
    port: 8080,
    path: '/blazecast/api/contact/consent/?addr='+phone,
    method: 'GET',
    auth: 'smsuser:Aw3ed~'
  };
  var req2 = http.request(options, function(res2) {
      res2.on('data', function(d) {
      console.log("OPTIN RESULT: "+d);
        res.render("index",{d:d});
      });
      res2.on('end', function(){res.render("index",{code:200})});
      
  });
  req2.end("addr="+phone+"\n\n");
   
  req2.on('error', function(e) {
    console.log('ERROR BELOW');
    console.error(e);
  });

});

app.get('/ping', function(req, res) {
  var options = {
    host: '134.117.4.8',  
    port: 80,
    path: '/blazecast/api/system/ping',
    method: 'GET',
    auth: 'admin:bcCarleton01'
    };

    var options2 = {
    host: '134.117.242.245',  
    port: 80,
    path: '/blazecast/api/system/ping',
    method: 'GET',
    auth: 'admin:bcCarleton01'
  };

  var numResults = 0;
  var serverDown = 'unknown';
  var serverIP = 'unknown';
  var stuff = 'unknown';

  var finish = function() {
    console.log("The server that is down is: " + serverDown);
    var sms = {
        "smsFrom": "6134023356",
        "operation":"OPT_IN_CONFIRMATION",
        "message":"JOIN CUTXT",
        "route":"Carleton",
        "network":"Carleton",
        "smsId":"46324554436",
        "smsTo":"30000035",
        "sendSmsResponse":"true"
    };

    smsString = JSON.stringify(sms);

    var headers = {
      'Content-Type': 'application/json',
      'Content-Length': smsString.length
    };
    
    var options = {
      hostname: serverIP,
      port: 80,
      path: '/blazecast/api/inbound/sms/',
      method: 'POST',
      headers: headers,
      auth: 'admin:bcCarleton01'
    };
    var req = http.request(options, function(res4) {
      res4.on('data', function(d) {
        console.log("OPTIN RESULT: "+d+" STATUS CODE: "+res4.statusCode);
        stuff = d;
      });
      res4.on('end', function(){
        console.log("Ended Blazecast post with statuscode:" + res4.statusCode);
        console.log("res HEADERS: "+ JSON.stringify(res4.headers));
      });
      res.render("index",{stuff:res4.statusCode});
      
    });
    req.write(smsString);
    req.end();
     
    req.on('error', function(e) {
      console.log('ERROR BELOW');
      console.error(e);
    });
  };

  // first server
  var serverReq = http.request(options, function(res) {
    console.log('got res for server1');
    res.on('data', function(d) {
      serverDown = 'server1'
      serverIP = '134.117.242.245';
      console.log("FIRST SERVER: "+res.statusCode);
    });
    res.on('end', function(d) {
      numResults++;
      if (numResults === 2) finish();
    })
  });
  // second server
  var serverReq2 = http.request(options2, function(res) {
    console.log('got res for server2');
    res.on('data', function(d) {
      serverDown = 'server2'
      serverIP = '134.117.4.8';
      console.log("SECOND SERVER: "+res.statusCode);
    });
    res.on('end', function(d) {
      numResults++;
      if (numResults === 2) finish();
    })
  });

  serverReq.end();
  serverReq2.end();

 });  

app.post('/registerUser', function(req, res) {
	pNumber = req.body.phone;
  console.log("PHONE: "+req.body.phone);
	var options = {
	  host: 'localhost',  
	  port: 8080,
	  path: '/blazecast/api/message/sms/invite/?addr='+pNumber,
	  method: 'POST',
	  auth: 'smsuser:T3xt1ng'
	  };
	console.log('NUMBER: '+pNumber+' OPTIONS: '+JSON.stringify(options));

	var req2 = http.request(options, function(res2) {
      res2.on('data', function(d) {
   		  console.log("OPTIN RESULT: "+d);
        res.render("index",{d:d});
 	    });
   	  res2.on('end', function(){res.render("index",{code:200})});
   		
  });
  req2.end("addr="+pNumber+"\n\n");
   
  req2.on('error', function(e) {
  	console.log('ERROR BELOW');
  	console.error(e);
	});
  	
 });


app.listen(3000);
