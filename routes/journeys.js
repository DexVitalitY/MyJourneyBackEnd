var Bcrypt = require('bcrypt');
var Joi = require('joi');
var Auth = require('./auth');

exports.register = function(server, options, next) {

server.route([
	{
		method: 'GET',
		path: '/journeys',
		handler: function(request,reply) {
			var db = request.server.plugins['hapi-mongodb'].db;

			db.collection('journeys').find().toArray(function(err, journeys) {
				if (err) { return reply('Internal MongoDB error', err); }
				reply(journeys);
			});
		}
	},
	{
		method: 'GET',
		path: '/user/{username}/journeys',
		handler: function(request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
			var username = encodeURIComponent(request.params.username);

			db.collection('users').findOne({"username" : username }, function (err, user){
				if (err) { return reply('Internal MongoDB error', err)}

				db.collection('journeys').find({"user_id": user._id }).toArray(function(err, journeys){
					if (err) { return reply('Internal MongoDB error', err)}
					reply(journeys);
				});

			})	
		}
	},
	{
		method: 'GET',
		path: '/journeys/{id}',
		handler: function(request, reply) {
			var db = request.server.plugins['hapi-mongodb'].db;
			var journey_id = encodeURIComponent(request.params.id);
			var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;

			db.collection('journeys').findOne({ "_id": ObjectId(journey_id)}, function (err, tweet) {
				if (err) {return reply('Internal MongoDB error', err); }

				reply(tweet);
			})
		} 		
	},
	{
  method: 'POST',
  path: '/journeys',
  config: {
    handler: function(request, reply) {
      Auth.authenticated(request, function(result) {
        if (result.authenticated) {
        	var db = request.server.plugins['hapi-mongodb'].db;
					var session = request.session.get('my_journeys_session');
					var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;

					var journey = { 
						"name": request.payload.journey.name,
					  "message": request.payload.journey.message,
						"journey": request.payload.journey.coordinates,
					  "user_id": ObjectId(session.user_id)
					};
					
					db.collection('journeys').insert(journey, function(err, writeResult) {
				  	if (err) { return reply('Internal MongoDB error', err); }

  					reply(writeResult);
					});
        } else {
          reply(result.message);
        }
      });
    },
    validate: {
      payload: {
        journey: {
        	name: Joi.string().max(20).required(),
          message: Joi.string().max(300).required(),
          coordinates: Joi.string().required()
        }
      }
    }
  }
},

	{
		method: 'DELETE',
		path: '/journeys/{id}',
		handler: function(request, reply) {
			Auth.authenticated(request, function(result) {

				if (result.authenticated) {	
					var db = request.server.plugins['hapi-mongodb'].db;
					var journey_id = encodeURIComponent(request.params.id);
					var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;

					db.collection('journeys').remove({"_id": ObjectId(journey_id) }, function(err, writeResult){
						if (err) {return reply('Internal MongoDB error', err); }

						reply(writeResult);
					});	
				} else {
					replay(result.message);
				}
			});
		}
	}
])

next();
};

exports.register.attributes = {
	name: 'journeys-route',
	version: '0.0.1'
};