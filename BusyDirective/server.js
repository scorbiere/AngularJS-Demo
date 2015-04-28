// server.js (Express 4.0)
var express        = require('express');
var morgan         = require('morgan');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs 			   = require('fs');
var app            = express();

app.use(express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 					// log every request to the console
app.use(bodyParser()); 						// pull information from html in POST
app.use(methodOverride()); 					// simulate DELETE and PUT


var router = express.Router();

router.get('/delay', function(req, res) {
setTimeout(function() {res.send('delay');}, 3000);
});
app.use('/api', router);

router = express.Router();
router.get('/delayAction', function(req, res) {
setTimeout(function() {
	fs.readFile('./public/index.html', function (err, html) {
		if (err) {
			throw err; 
		}       
		res.writeHeader(200, {"Content-Type": "text/html"});  
		res.write(html);  
		res.end();
	});
}, 3000);
});
app.use('/', router);

app.listen(8000);
console.log('Open http://localhost:8000 to access the files now'); 			// shoutout to the user
