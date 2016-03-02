angular.module('app').
	controller('LoginCtrl', LoginCtrl)
;

function LoginCtrl($scope, $rootScope, $http, $location) {
	// This object will be filled by the form
	$scope.user = {};

	// Register the login() function
	$scope.login = function(){
		$http.post('/login', {
			username: $scope.user.username,
			password: $scope.user.password,
		})
		.success(function(user){
			$rootScope.loged = true;
			// No error: authentication OK
			$rootScope.message = 'Authentication successful!';
			$rootScope.errorMsg = null;
			$location.url('/');
		})
		.error(function(){
			// Error: authentication failed
			$rootScope.message = 'Authentication failed.';
			$location.url('/login');
			$rootScope.errorMsg = "salah";
		});
	};
}