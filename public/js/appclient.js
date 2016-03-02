angular
	.module("app", ['ngRoute', 'ui.bootstrap'])
	.run(jalan)	
	.config(myConfig)
	;


function jalan($rootScope, $location, $http) {	
	socket = io.connect({'forceNew':true });


	function backHome(){		
		$location.url("/");
	}	

	function login(){
		$location.url("/login");
	}

	function UsersMenu(){
		$location.url("/users");
	}

	function showRank(){
		$location.url("/rank");
	}

	function showAbout(){
		$location.url("/about");
	}	

	$rootScope.message = '';

	// Logout function is available in any pages
	function logout(){
		$rootScope.loged = false;
		$rootScope.message = 'Logged out.';
		$http.post('/logout');
		$location.url("/");
	}

	$rootScope.backHome = backHome;
	$rootScope.login = login;
	$rootScope.UsersMenu = UsersMenu;
	$rootScope.showRank = showRank;
	$rootScope.showAbout = showAbout;


	$rootScope.navbarCollapsed = true;

	$rootScope.logout = logout;

	$rootScope.loged = false;

}

//navbar
function HeaderController($scope, $location, $rootScope){	
	//terakhir menu dipilih
	$scope.isActive = function (viewLocation) { 
		return viewLocation === $location.path();
	};	
}


function myConfig($routeProvider, $locationProvider, $httpProvider) {
	// Check if the user is connected
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user){
        // Authenticated
        if (user !== '0')
          /*$timeout(deferred.resolve, 0);*/
          deferred.resolve();

        // Not Authenticated
        else {
          $rootScope.message = 'You need to log in.';
          //$timeout(function(){deferred.reject();}, 0);
          deferred.reject();
          $location.url('/login');
        }
      });

      return deferred.promise;
    };
    //================================================
    
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.interceptors.push(function($q, $location) {
      return {
        response: function(response) {
          // do something on success
          return response;
        },
        responseError: function(response) {
          if (response.status === 401)
            $location.url('/login');
          return $q.reject(response);
        }
      };
    });
	
	$routeProvider.when('/', {templateUrl: '/views/lobi.html', controller: 'lobi'});
	$routeProvider.when('/main', {templateUrl: '/views/main.html', controller: 'main'});
	$routeProvider.when('/users', {templateUrl: '/views/users.html', controller: 'users',
        resolve: {
            loggedin: checkLoggedin
          }});
	$routeProvider.when('/login', {templateUrl: 'views/login.html', controller: 'LoginCtrl'});
	$routeProvider.when('/rank', {templateUrl: '/views/rank.html', controller: 'rank'});
	$routeProvider.when('/about', {templateUrl: '/views/about.html', controller: 'about'});
    $routeProvider.otherwise({redirectTo: '/'});
	
    //$locationProvider.html5Mode(true);
}
