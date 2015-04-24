var Bcrypt = require('bcrypt');
var Joi = require('joi');
var Auth = require('./auth');


exports.register = function(server, options, next) {

server.route([
  {
  	method:'POST',
  	path: '/sessions',
  		handler: function (request, reply) {
  			//PAYLOAD SHOULD BE NOW user
	  		var user = request.payload.user;
	  		var db = request.server.plugins['hapi-mongodb'].db;

				db.collection('users').findOne({"username" : user.username}, function(err, userMongo) {
					if (err) {
						return reply('Internal MongoDV error', err);
					}

					if (userMongo === null) {
						return reply({"message": "User does not Exist"});
					}

					Bcrypt.compare(user.password, userMongo.password, function(err, matched) {
						if (err) {
							return reply('Error!', err);
						} 
						if (matched) {
							//Authenticate the usergit 
							function randomKeyGenerator() {
					    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
					    }  
					  // Generate a random key
						  var randomKey = (randomKeyGenerator() + randomKeyGenerator() + "-" + randomKeyGenerator() + "-4" + randomKeyGenerator().substr(0,3) + "-" + randomKeyGenerator() + "-" + randomKeyGenerator() + randomKeyGenerator() + randomKeyGenerator()).toLowerCase();

						  var newSession = {
						  	"session_id": randomKey,
						  	"user_id": userMongo._id
						  };

						  db.collection('sessions').insert(newSession, function(err, writeResult) {
						  	if (err) { return reply ('Internal MongoDB Error', err); }

						  	//Store the Session information in the browser Cookie
						  	//Yar

						  	request.session.set('my_journeys_session', {
						  		"session_id": randomKey,
						  		"user_id": userMongo._id
						  	});

						  	return reply(writeResult);
						  });

						} else {
							reply({'message' : 'Not authorized'})
						}


					})


				});
  	}
	},
	{
		method: 'GET',
		path: '/authenticated',
		handler: function(request, reply) {
			// retreieve the session information form the browser
			Auth.authenticated(request, function(result){
				reply(result);
			});
		}
	},
	{
		method: 'DELETE',
		path: '/sessions',
		handler: function(request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
			var session = request.session.get('my_journeys_session');

			if (!session) {
			return reply({"message" : "Already Logged Out"})
			}
		
			db.collection('sessions').remove({"session_id": session.session_id },
				function (err, writeResult){
					if (err) { return reply('Internal MongoDV error', err); }
					reply(writeResult);
				});
		}
	}
]);

next();

}
exports.register.attributes = { 
  name: 'sessions-routes',
  version: '0.0.1'
}