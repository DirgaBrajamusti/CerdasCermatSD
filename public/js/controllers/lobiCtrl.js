angular.module('app').
	controller('lobi', lobi)
;

function lobi($scope, $http, $location, mySocketService) {
	//tangkap pesan dari rootscope
	//jika diclick dari navbar kembali
	$scope.$on('parent', function (event, data) {
		$scope.boxnama = true;
		$scope.boxjoinroom = false;
		$scope.boxcreateroom = false;		
		$scope.boxstatus = false;
		$scope.namapemain = '';		
		
		$scope.fokusroom = false;
		$scope.aturaninfo = true;		
	  });
	
	$scope.gg = mySocketService.getmaker();
	
	// 1.0 socket.io version, force new connection
	var socket = io.connect({'forceNew':true });
	mySocketService.setSck(socket);
	
	
	//dapatkan id	
	socket.on('message', function (message) {
		mySocketService.setId(message);	
		//console.log(mySocketService.getSck());
	});
		
	
	mySocketService.setStatus('wait');
	
	$scope.lobiInput = false;	
	
	//awal koneksi, hardcode?
	socket.on('connect', function() {		
		//tampilkan room dan text input nama
		$scope.lobiInput = true;			
		$scope.$apply();		
	});	
	
		
	//refreshgamelist
	socket.on('refreshgamelist', function(data) {		
		getGames();		
		//$scope.apply();
	});
	
	//total pemain
	socket.on('totpemain', function(data) {
		$scope.info = data;		
	});
	
	//gamestatus
	socket.on('gamestatus', function(data, maxweektoplay, timer1week) {		
		mySocketService.setStatus(data);		
				
		//data=='started' redirect ke main page
		if(data === 'started')startmain();
	});
	
	//refreshplayerlist
	socket.on('refreshplayerlist', function(data) {
		//console.log('refresh', data);
		listPlayer();		
		//$scope.apply();
	});

	function makeid(){
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}
	
	
	function startmain(){
		$location.url("/main");
		$scope.$apply();
	}
	
		
	//new add
	function addplayer(nama){
		console.log('add player', nama);
		//nama harus diisi, regex/ angular 3rd modul
		if(nama === undefined){nama = socket.id}
		
		// call the server-side function 'addplayer'
		mySocketService.setName(nama);
		
		socket.emit('addplayer', nama);
		
		$scope.boxnama = false;
		
		//update fokus
		$scope.fokusnama = false;
		$scope.fokusroom = true;
		$scope.aturaninfo = false;
		
		//list game
		getGames();	
		
		$scope.boxcreateroom = true;
		$scope.boxjoinroom = true;
		//$scope.$apply();
	
	}
	//new list player locked = false	
	function listPlayer(){
		$http.get('/listplayer')
		.success(function(data) {			
			//if(!data===null){
			$scope.listplayer = data;
			//$scope.$apply();
			console.log(data);
			//}			
		});   
	}
	//new 
	function usrjoingame(game, tipe){
		if(tipe === 'new'){
			game = game + makeid();
		} 
		
		mySocketService.setGame(game);
		
		socket.emit('usrjoingame', game, mySocketService.getName());
		
		$scope.boxstatus = true;	
		$scope.boxcreateroom = false;
		$scope.boxjoinroom = false;
		$scope.info_g_room = mySocketService.getGame();
	}
	
	//new
	function getGames(){
		console.log('List game 0', 'get games fired');
		$http.get('/listgame')
		.success(function(data) {      	  
			$scope.rooms = data;
			console.log('List game', data);

			//jika kosong tampilkan create room
			if(data.length === 0){
				$scope.boxcreateroom = true;  
				//$scope.$apply();
			}
		});        
	}
	
	//tampilkan statistik history game
	function statistik(){
		$location.url("/statistik");
		$scope.$apply();
	}
	$scope.statistik = statistik;
	
	listPlayer();
			
	$scope.fokusnama = true;
	$scope.fokusroom = false;
	$scope.aturaninfo = true; 
	
	$scope.addplayer = addplayer;
	$scope.usrjoingame = usrjoingame;
	
}