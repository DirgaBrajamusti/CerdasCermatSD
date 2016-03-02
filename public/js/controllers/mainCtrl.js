angular.module('app').
	controller('main', main)
;

function main($scope, $location, mySocketService) {
	$scope.isi = 'TEST MAIN MAIN';
	$scope.pemain = mySocketService.getName();
		
	var socket = mySocketService.getSck();
	
	// socket ada isinya?
	if(socket === undefined){$location.url("/");}
	
	function datasend(msg) {		
		socket.emit('sendchat', msg);
		$scope.message = '';
	}
	
	
	$scope.datasend = datasend;
	
	$scope.pembicaraan = []; 
	socket.on('updatechat', function(username, data) {		
		$scope.pembicaraan.push({ isi: username + ': ' + data} );		
		//refresh draw
		$scope.$apply();		
	});
	
	//Request soal
	function requestsoal(datasoals){
		//console.log("requestsoal", datasoals);
		rendersoal(datasoals);		
	}
	socket.on('requestsoal', requestsoal);
	
	function rendersoal(data){
		$scope.soals = data;
		$scope.$apply();		
	}
	
	function finishsoal(hasil){
		$scope.isi = hasil;
		$scope.boxmain = false;
		$scope.$apply();
	}
	socket.on('finishsoal', finishsoal);
	
	function reqsoalawal(){
		socket.emit('reqsoalawal', mySocketService.getName());
	}
	
	function contreng(no, pilih){		
		$scope.pilih = pilih;
		//console.log('ISINYA', 'no:'+ no + ' , pilihan:'+ pilih);
		socket.emit('jawab', mySocketService.getName(),no,pilih);
	}
	
	$scope.contreng = contreng;
	
	
	
	//run it first, utk mnetriger soal berikutnya
	reqsoalawal();
}

