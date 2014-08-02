module.exports = function Route(app) {

	var existing_messages = [];

	app.get('/', function(req, res) {
		res.render('index', { session_data: req.session });
	})

	app.io.route('connect', function(req, res) {
		if(!req.session.name) {
			req.io.emit('new_name');
		} else {
			req.io.emit('welcome_back', { name: req.session.name, message: "You've visited before! Your name was, "+req.session.name+", last time! We'll keep using that name!" } );
			req.io.broadcast('new_user', req.session.name );
			existing_messages.push("<p><i><b>"+req.session.name+" has joined the Conversation Board.</b></i></p>");
		}
		req.io.emit('existing_messages', existing_messages);
	})

	app.io.route('typed_name', function(req, res) {
		req.session.name = req.data;
		req.session.save( function() {
			app.io.broadcast('new_user', req.session.name );
			existing_messages.push("<p><i><b>"+req.session.name+" has joined the Conversation Board.</b></i></p>");
		});

	})
	
	app.io.route('new_message', function(req, res) {
		existing_messages.push("<strong>"+req.session.name+'</strong>: '+req.data);
		app.io.broadcast('new_messages', { new_message: "<strong>"+req.session.name+'</strong>: '+req.data });
	})

}