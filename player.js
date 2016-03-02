//player

function player(id, name, game){	
	
	this.id = id; //socket.id
	this.name = name;
	this.game = game;
	this.locked; false; // locked= true tidak bisa dipilih lagi
	this.totalbenar = 0;
}

module.exports = player;
