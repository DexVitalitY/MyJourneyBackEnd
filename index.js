var Hapi = require('hapi');
var server = new Hapi.Server();
var fs = require('fs');

server.connection({
	host: '0.0.0.0',
	port: process.env.PORT || 3000,
  routes: {
  	cors: {
  		headers: ['Access-Control-Allow-Credentials'],
  		credentials: true
  	}
  }
});


var plugins = [
  { register: require('./routes/user.js') },
  { register: require('./routes/sessions.js')},
  { register: require('./routes/journeys.js')},
  { 
  	register: require('hapi-mongodb'),
    options: {
    	"url" : "mongodb://127.0.0.1:27017/MyJourneys",
    	"settings" : { db: {
    									"native_parser": false
  	  								}
    							 }
    					}
  },
  {
  	register: require('yar'),
		options: {
			cookieOptions: {
				password: 'password',
				isSecure: false //you can use it without HTTPs
			}
		}
  }
];

server.register(plugins, function (err) {
  if (err) { throw err; }
  	server.start(function () {
    	console.log('info', 'Server running at: ' + server.info.uri);
  	});
});


server.start();