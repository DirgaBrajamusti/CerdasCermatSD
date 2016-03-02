var express = require('express');
var router = express.Router();

var app = require('../app');

//check hak akses dan role nya
var auth = function(req, res, next){
	//if (! (req.isAuthenticated() && req.user.rol==="101"))
	if (false)
		res.sendStatus(401);
		//next();
	else
		next();
};

/* GET users listing. */
router.get('/', function(req, res, next) {	
	//res.send(req.user ); 
	res.send([{name: "Mohamad"}, {name: "Nurkamal"}]);  
});

//GET user list check role & login
router.get('/list', auth, function(req, res, next) {

	app.pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}  

		console.log('connected as id ' + connection.threadId);

		connection.query("select * from users",function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}          
		});

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});
	});

});

//GET user list check role & login
//per id
router.get('/listone/:id', auth, function(req, res, next) {
	var id = req.params.id;	
		
	    app.pool.getConnection(function(err,connection){
	        if (err) {
	          connection.release();
	          res.json({"code" : 100, "status" : "Error in connection database"});
	          return;
	        }  
	
	        console.log('connected as id ' + connection.threadId);
	       
	        connection.query("select * from users where id = ?",[id],function(err,rows){
	            connection.release();
	            if(!err) {
	                res.json(rows);
	            }          
	        });
	
	        connection.on('error', function(err) {      
	              res.json({"code" : 100, "status" : "Error in connection database"});
	              return;    
	        });
	  });	
});

router.delete('/delete/:id', auth, function(req, res, next) {
	var id = req.params.id;

	app.pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}  

		console.log('connected as id ' + connection.threadId);

		connection.query("delete from users where id = ?",[id],function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}          
		});

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});
	});
});

router.post('/add', auth, function(req, res, next) {	
	var input = JSON.parse(JSON.stringify(req.body));

	var data = {
			nim : input.nim,
			nama : input.nama
	};
	
	app.pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}  

		console.log('connected as id ' + connection.threadId);


		connection.query("insert into users set ?", data,function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}          
		});

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});

	});
});

//update
router.put('/update', auth, function(req, res, next) {	
	var input = JSON.parse(JSON.stringify(req.body));

	var data = {
			nim : input.nim,
			nama : input.nama
	};
	
	var id = input.id;
	//res.json('ini id=' + id);
	
	app.pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}  

		console.log('connected as id ' + connection.threadId);


		connection.query("update users set ? where id = ?", [data, id],function(err,rows){
			connection.release();
			if(!err) {
				res.json(rows);
			}          
		});

		connection.on('error', function(err) {      
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;    
		});

	});
});

module.exports = router;