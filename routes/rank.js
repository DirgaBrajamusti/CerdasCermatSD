var express = require('express');
var router = express.Router();

var app = require('../app');

//check hak akses dan role nya

var auth = function(req, res, next){
	if (! (req.isAuthenticated() && req.user.rol==="101"))  	
		res.sendStatus(401);		
	else
		next();
};

/* GET rank listing. */
router.get('/', function(req, res, next) {	
	/*
	res.send([ {
	    id: 'VoxLXxboOgjtQk6sAAAD',
	    name: 'M',
	    game: 'dsds6riCJ',
	    totalbenar: 2 },
	   {
	    id: 'ic_0sX11xWf1Ewl_AAAF',
	    name: 'Nurkamal',
	    game: 'dsds6riCJ',
	    totalbenar: 1 } ]);
	 */   
	
	//[{"id":"OIUdZcf3sTZrWmFZAAAB","name":"Nurkamal","game":"asasZ55zh","totalbenar":3}]
	res.send(app.gametransaction);
});

module.exports = router;