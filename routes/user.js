var Bcrypt = require('bcrypt');
var Joi = require('joi');


exports.register = function(server, options, next) {


  //routes HERE
  server.route([
  {
    method:'GET',
    path:'/',
    handler: function (request, reply) {
      reply('WDI Project 2 - My Journeys');
    }
  },
    {
    	method:'GET',
    	path: '/users',
    	handler: function (request, reply) { 
    		var db = request.server.plugins['hapi-mongodb'].db;

    		db.collection('users').find().toArray(function(err, users) {
    			if (err) {
    				return reply('Internal MongoDB error', err);
    			}
        
        reply(users);
    	});
    }
  },
  {
  	method:'POST',
  	path: '/users',
  	config: {
  		handler: function (request, reply) {
	  		var user = request.payload.user;
	  		var db = request.server.plugins['hapi-mongodb'].db;

				var uniqueUserQuery = {
					$or: [
						{ username: user.username},
						{ email: user.email }
					]};

				db.collection('users').count(uniqueUserQuery, function(err, userExist) {
					if (userExist) {
						return reply('User Already Exists', err);
					} 

				Bcrypt.genSalt(10, function(err, salt){
					Bcrypt.hash(user.password, salt, function(err, hash){
						user.password = hash;

					db.collection('users').insert(user, function(err, writeResult){
  					if (err) {
  						return reply(Hapi.error.internal('Internal MongoDB Error', err));
  					} else {
  						return reply(writeResult);
  					}
  				});
  			});
  		});
		})		
	},
	validate: {
			payload: {
				user: {
					username: Joi.string().min(4).max(20).required(),
					email: Joi.string().email().max(50).required(),
					password: Joi.string().min(4).max(20).required()
				}
			}
		}		
	}
}
  // {
  // 	method:'GET',
  // 	path:'/users/{username}',
  // 	handler: function (request, reply) {
  // 		var id = encodeURIComponent(request.params.username);
     
  //     var db = request.server.plugins['hapi-mongodb'].db;
  //     var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

  // 		db.collection('users').findOne({'_id' : ObjectID(id) }, function(err, writeResult) {
  //         if (err) throw err;
  //         reply(writeResult);
  //       })
  // 	}
  // }
//server.route END
 ]);

  next();
};

exports.register.attributes = { 
  name: 'users-route',
  version: '0.0.1'
}