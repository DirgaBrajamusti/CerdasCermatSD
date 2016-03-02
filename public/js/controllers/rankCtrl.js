angular.module('app').
	controller('rank', rank)
;

function rank($scope, $http) {
	function refresh(){
		  $scope.ranks = [];
		  $http.get('/rank').success(function(ranks){
			  for (var i in ranks)
				  $scope.ranks.push(ranks[i]);
		  });
		  
		  $scope.rank = null;
	  }
	
	$scope.refresh = refresh;
	
	refresh();
}