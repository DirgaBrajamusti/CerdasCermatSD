var express = require('express');
var session = require('express-session');
var mysql = require('mysql');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var socket_io = require("socket.io");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var rank = require('./routes/rank');

//custom
var player = require('./player');
var game = require('./game');

//tempat mencatat semua transaksi
var gametransaction = [];
exports.gametransaction = gametransaction;

var app = express();

//Socket.io
var io = socket_io();
app.io = io;

var _ = require('underscore');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//game room object
var gamerooms = {};

var players = {};
var maxplayer = 2;
var maxsoal = 3;
var timersoal = 10;

//db
var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : 'localhost',
    user     : 'polpos',
    password : 'polpos',
    database : 'nodekuis',
    debug    :  false
});
exports.pool = pool; 

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', routes);
app.use('/users', users);
app.use('/rank', rank);

//socket.io
io.on('connection', function(socket) {
	// send the clients id to the client itself. dan ditangkap oleh register message	
	// SOCKET ID
	socket.send(socket.id);
	
	
	//ADD PLAYER dari list
	function addplayer(playername) {
		//ubah nilai lock
		pool.getConnection(function(err,connection){
			if (err) {
				connection.release();				
				return;
			}  

			connection.query("update players set locked=1 where nama = ?", [playername],function(err,rows){
				connection.release();				          
			});

			connection.on('error', function(err) {
				return;    
			});
		});
		
		io.sockets.emit('refreshplayerlist', 'refresh');	
	}
	//ketika menerima message on addplayer maka lakukan add player callback
	socket.on('addplayer', addplayer);
	
	
	function usrjoingame(game_nm, nama){
				
		// player, store the playername in the socket session for this client
		socket.username = nama;
		
		//buat game room push
		players[socket.id] = new player(socket.id, nama, game_nm);
				
		// game room, store the room name in the socket session for this client
		socket.room = game_nm;

		// send client to room
		socket.join(game_nm);
		
		if(_.isEmpty(gamerooms[socket.room])){
			gamerooms[socket.room] = new game(socket.room);			
		} 
		
		gamerooms[socket.room].playerlist++;
		gamerooms[socket.room].player.push(nama);
		gamerooms[socket.room].ids.push(socket.id);
						
		if(gamerooms[socket.room].playerlist >= maxplayer){			
			//mulai game
			// START GAME pada ROOM yang sama
			gamerooms[socket.room].status = 'started';
			//started
			io.sockets['in'](socket.room).emit('gamestatus', 'started', maxsoal, timersoal);//maxweek
		} else {
			
			//kirim total playerlist
			io.sockets['in'](socket.room).emit('totpemain', 'total pemain ada: ' + gamerooms[socket.room].playerlist);
			
			io.sockets.emit('refreshgamelist', 'refresh');
		}
	}
	//Tangkap pemain gabung/buat room game
	socket.on('usrjoingame', usrjoingame);	
	
	
	function reqsoalawal(nama){
		//kehormatan yg pertama daftar mentriger soal		
		//if(gamerooms[socket.room].player[0] === nama){
			if(maxsoal >= gamerooms[socket.room].soalno){
				
				pool.getConnection(function(err,connection){
			        if (err) {
			          connection.release();
			          return;
			        }
			        // as desc tidak bisa
			        console.log("kena "+gamerooms[socket.room].soalno);
			        connection.query("SELECT no, soal, GROUP_CONCAT(pilihans.desc) AS desk  FROM soals, pilihans WHERE soals.no = pilihans.soal_id AND soals.no = ?",[gamerooms[socket.room].soalno],function(err,rows, fields){
			        	connection.release();
			        			        	
			        	var nomer = 0;
			        	rows.forEach(function(row) {
			        	    row.pilihan = row.desk.toString().split(',').map(function(value) {
			        	    	nomer++;
			        	    	return { id: nomer , desc : value };
			        	    });
			        	    delete row.desk;
			        	  });
			        	  // as an example, we'll print the object as JSON
			        	  //console.log(JSON.stringify(rows, null, 2));
			        	  io.sockets['in'](socket.room).emit('requestsoal',rows);			        	  
			        });
			  });
			}
		//}
	}
	socket.on('reqsoalawal',reqsoalawal);
	
	//namapemain, nosoal, nojawab
	function jawab(nama, nosoal, nojawab){
		
		console.log('nama: '+ nama +', nomersoal:' + nosoal + ", jawab:"+ nojawab);
		
		//catat jawaban benar, rangking, gametransaction
		//cek nojawab vs jawabBenar
		//catat di gametransaction: gameroom, nama, total benar
		
			pool.getConnection(function(err,connection){
		        if (err) {
		          connection.release();		          
		          return;
		        }       
		       
		        connection.query("select * from soals where no = ? and benar = ?",[nosoal, nojawab],function(err,rows){
		            connection.release();
		            if(!err) {
		            	if(rows.length > 0 && players[socket.id].name === nama){
		            		//benar tambah satu
		        			players[socket.id].totalbenar ++;
		        			
		        			//console.log("CEK", nama +" benar" + players[socket.id].totalbenar);
		            	} else {
		            		//console.log("CEK", nama + " salah" +", room:" + socket.room);
		            	}
		            }          
		        });		
		        
		  });
				
		
		if(maxsoal > gamerooms[socket.room].soalno){
			//soal baru
				pool.getConnection(function(err,connection){
			        if (err) {
			          connection.release();
			          return;
			        }
			        
			        //soal maju
		        	gamerooms[socket.room].soalno++;
			        // hati2 as desc tidak bisa
			        connection.query("SELECT no, soal, GROUP_CONCAT(pilihans.desc) AS desk  FROM soals, pilihans WHERE soals.no = pilihans.soal_id AND soals.no = ?",[gamerooms[socket.room].soalno],function(err,rows, fields){
			        	connection.release();
			        	  
			        	var nomer = 0;
			        	rows.forEach(function(row) {
			        	    row.pilihan = row.desk.toString().split(',').map(function(value) {
			        	    	nomer++;
			        	    	return { id: nomer , desc : value };
			        	    });
			        	    delete row.desk;
			        	  });
			        	  // as an example, we'll print the object as JSON
			        	  //console.log(JSON.stringify(rows, null, 2));
			        	  io.sockets['in'](socket.room).emit('requestsoal',rows);			        	  
			        });
			       
			  });
			
			
		} else {
			//soal habis, hasilnya
			//cek total banar dari memori
			//simpan di database
			io.sockets['in'](socket.room).emit('finishsoal','Permainan berakhir sampai di sini');
		
			//Total Nilai per room
			//TODO: insert transaction: gametransaction
			//List id dari gamerooms dulu 
			//gametransaction.push(players[socket.id]);	
			
			_.each(gamerooms[socket.room].ids, function(sockid){				
				gametransaction.push(players[sockid]);
			});
			
			
			//console.log(gametransaction);
			
			//lock dibuka lagi			
			_.each(gamerooms[socket.room].player, function(playername){
				//console.log('PLY', playername);				
				pool.getConnection(function(err,connection){
					if (err) {
						connection.release();				
						return;
					}  

					connection.query("update players set locked=0 where nama = ?", [playername],function(err,rows){
						connection.release();				          
					});

					connection.on('error', function(err) {
						return;    
					});
				});
			});			
		}
	}
	socket.on('jawab',jawab);
	
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function(data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		// io.sockets.in(socket.room).emit('updatechat', socket.playername, data);
		// in, itu keyword pada javascript, makanya in dianggap error
		io.sockets['in'](socket.room).emit('updatechat', socket.username, data);
	});
	
	
	socket.on('disconnect', function(){
		socket.leave(socket.room);
	});
	
});

app.get('/listplayer', function(req, res) {
	//filter pemain yg available saja	
	pool.getConnection(function(err,connection){
		if (err) {
			connection.release();
			res.json({"code" : 100, "status" : "Error in connection database"});
			return;
		}  

		connection.query("select nama from players where locked=0",function(err,rows){
			connection.release();
			if(!err) {				
				res.json(_.pluck(rows,'nama'));
			}          
		});		
	});
});

app.get('/listgame', function(req, res) {
	//filter pemain yg available saja	
	var availablegame = _.filter(gamerooms, function(x) {
		console.log(x.nama);
		return (x.playerlist < maxplayer) && (x.status === 'wait');
	});
	
	//res.json(_.pluck(availablegame,'nama'));
	res.json(availablegame);
});

app.get('/pus', function(req, res){
	res.json(gamerooms);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
