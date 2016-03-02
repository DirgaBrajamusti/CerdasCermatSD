function game(name){	
	this.name = name;
	this.status = 'wait'; //wait, started, lock, finish, enabled	
	this.playerlist = 0;
	this.player = []; //list player
	this.ids = []; //list player id
	this.maxply = 2; //normal max player  4
	this.soalno = 1;
}

module.exports = game;