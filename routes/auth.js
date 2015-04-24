module.exports = {};

module.exports.authenticated = function(request, callback) {

	var session = request.session.get('my_journeys_session');

	if (!session) {
		return callback({"message" : "Already Logged Out",
			"authenticated": false
		})
	}

	var db = request.server.plugins['hapi-mongodb'].db;

	db.collection('sessions').findOne({"session_id": session.session_id}, function(err, result){
		if (result === null) {
			return callback({
				"message": "Logged Out",
				"authenticated": false
				});
		} else {
			return callback({
				"message": "Logged In",
				"authenticated": true
			});
		}
	});
};