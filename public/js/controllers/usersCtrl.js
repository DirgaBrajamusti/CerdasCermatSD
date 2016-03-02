angular.module('app').
	controller('users', users)
;


//login users
function users($scope, $http) {
	// List of users got from the server
	  $scope.users = [];	  
	  $scope.user = null;
	  $scope.buttonupdate = false;
	  $scope.editUserTitle = "User Baru";
	  
	  // Fill the array to display it in the page
	  function refresh(){
		  $scope.users = [];
		  $http.get('/users/list').success(function(users){
			  for (var i in users)
				  $scope.users.push(users[i]);
		  });
		  
		  $scope.user = null;
	  }
	  
	  //----
	  //hapus
	  function hapus(user){
		  // Pop up a confirmation dialog
		  var confirmation = confirm('Anda akan menghapus user?');

		  // Check and make sure the user confirmed
		  if (confirmation === true) {
			  var responsePromise = $http.delete("/users/delete/" + user.id);

			  responsePromise.success(function(data, status, headers, config) {
				  refresh();
			  });
			  responsePromise.error(function(data, status, headers, config) {
				  alert("AJAX failed!");
			  });
		  }else {
			  // If they said no to the confirm, do nothing
			  return false;
		  }
	  }

	  $scope.hapus = hapus;
	  
	  //-----
	  //tambah
	  function tambah(){
		  //console.log($scope.user.nama);
		  var responsePromise = $http.post("/users/add", $scope.user);

		  responsePromise.success(function(data, status, headers, config) {        	
			  $scope.person=null;
			  refresh();        	
		  });
		  responsePromise.error(function(data, status, headers, config) {
			  alert("AJAX failed!");
		  });
	  }

	  $scope.tambah = tambah;
	  
	  //isi form
	  function isiForm(user){
		  //async, menunggu [send] balik dari server
		  
		  var responsePromise = $http.get("/users/listone/" + user.id);

		  responsePromise.success(function(data, status, headers, config) {
			  //console.log(data);
			  $scope.user = data[0];			  
			  //toggle, show update button, hide save button
			  $scope.buttonupdate=true;
			  $scope.editUserTitle = "User Lama";			  
		  });
		  responsePromise.error(function(data, status, headers, config) {
			  alert("AJAX failed!");
		  });
	  }

	  $scope.isiForm = isiForm;

	  //-----
	  //ubah
	  function ubah(){
		  console.log($scope.user);
		  var responsePromise = $http.put("/users/update", $scope.user);

		  responsePromise.success(function(data, status, headers, config) {        	
			  $scope.person=null;
			  
			  //kembali ke opsi buat user baru yaitu batal update
			  batal();
			  refresh();        	
		  });
		  responsePromise.error(function(data, status, headers, config) {
			  alert("AJAX failed!");
		  });
	  }

	  $scope.ubah = ubah;
	  
	  function batal(){
		  $scope.buttonupdate= !true;
		  $scope.editUserTitle = "User Baru";
		  $scope.user = null; 
	  }
	  
	  $scope.batal = batal;
	  
	  //runn di awal control
	  refresh();
}