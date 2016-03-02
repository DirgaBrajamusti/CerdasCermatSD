angular.module('app').
	service('mySocketService', mySocketService)
;

function mySocketService() {
	var _maker = 'Kamal';
	var _sck;
	var _game;
	var _name;	
	var _status = 'wait'; //wait, started, lock, finish, enabled	
	var _id;
	var _timer;
	
	
	this.getmaker = function() {
		return _maker;
	}
	this.setmaker = function(nama){
		_maker = nama;
	}
	
	this.getSck = function(){ return _sck }
	this.setSck = function(sck){ _sck = sck }
	
	this.getGame = function(){ return _game}
	this.setGame = function(game){ _game = game}
	
	this.getName = function(){ return _name}
	this.setName = function(name){ _name = name}
	
	this.getStatus = function(){return _status}
	this.setStatus = function(status){_status = status}
		
	this.getId = function(){return _id}
	this.setId = function(id){_id = id}
	
	this.getTimer = function(){return _timer}
	this.setTimer = function(timer){_timer = timer}
}