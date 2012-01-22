(function( $ ){

  var methods = {
    init : function(options) { 
      	var settings = $.extend( {
	      'width'         : 500,
	      'height' 		  : 400, //"#000000",220,370,32,32,3,"x-wing.png"
		  'players'       : [{"color": "#000000","start_x":220,"start_y":370, "lives": 3, "image": "x-wing.png", "width":32,"height":32}]
	    }, options);
	//game.init(this,settings);
	var g = new Game(this, settings);
		g.init();
    }
  };
  
  Game = function(container,settings){
	this.container = container;
	this.width = settings.width;
	this.height = settings.height;
	this.fps = 30;
	this.players = []; 
	this.enemies = [];
	this.interval = null;
	this.canvas = null;
	this.fps = 30;
	this.end_game = function(){
		alert('Game Over!');
		clearInterval(this.interval);
	};
	this.update= function(){
		this.canvas.clearRect(0, 0, this.width, this.height);
		for(var i=0; i < this.players.length; i++){
			this.players[i].draw();
			this.players[i].x = this.players[i].x.clamp(0, this.width - this.players[i].width);
			this.players[i].bullets.forEach(function(bullet) {
				bullet.update();
			});
			this.players[i].bullets = this.players[i].bullets.filter(function(bullet) {
			    return bullet.active;
			});
			this.handle_collisions();
		}
		this.enemies.forEach(function(enemy) {
		    enemy.update();
		});

		this.enemies = this.enemies.filter(function(enemy) {
			return enemy.active;
		});

		if(Math.random() < 0.1) {
		   this.enemies.push(new Enemy({canvas_width:this.width, canvas_height: this.height, canvas: this.canvas}));
		}
	
	};
	this.draw = function(){
		for(var i=0; i < this.players.length; i++){
			this.players[i].bullets.forEach(function(bullet) {    
				bullet.draw();
			});		
		}
		
		this.enemies.forEach(function(enemy) {
		    	enemy.draw();
		});
	};
	this.init = function(){
		$(this.container).html(''); //clear out the element where the canvas tag will be placed
		var canvasElement 	= $('<canvas width="'+this.width+'" height="'+this.height+'"></canvas>');
		this.canvas 			= canvasElement.get(0).getContext("2d");
		$(this.container).append(canvasElement);
		var players = [];
		for(var i=0; i< settings.players.length; i++){			
			//players.push(new Player("#000000",220,370,32,32,3,"x-wing.png",this.canvas,this));
			players.push(new Player( settings.players[i], this));
		}
	    this.players = players;
		var _this = this;
		this.interval = setInterval(function() {
		  _this.update();
		  _this.draw();
		}, 1000/_this.fps);
	};
	this.collides = function(a,b){
		  return a.x < b.x + b.width &&
		         a.x + a.width > b.x &&
		         a.y < b.y + b.height &&
		         a.y + a.height > b.y;		
	};
	this.handle_collisions = function() {
	 	var tb = [];
		this.players.forEach(function(player){
			$.merge(tb,player.bullets);
	 	});
	   
		var all_enemies = this.enemies;
		var collides_method = this.collides;
		var all_players = this.players;
		tb.forEach(function(bullet) {
	    	all_enemies.forEach(function(enemy) {
	      		if (collides_method(bullet, enemy)) {
	        		enemy.explode();
	        		bullet.active = false;
	      		}
	    	});
	  	});

	  	this.enemies.forEach(function(enemy) {
			all_players.forEach(function(player){
				if (collides_method(enemy, player)) {
		      		enemy.explode();
		      		player.explode();
		   		}
			})	
	  	});
	};//end handle collisions
    function Enemy(I) {
	  I = I || {};

	  I.active = true;
	  I.age = Math.floor(Math.random() * 128);

	  I.color = "#A2B";

	  I.x = I.canvas_width / 4 + Math.random() * I.canvas_width / 2;
	  I.y = 0;
	  I.xVelocity = 0;
	  I.yVelocity = 2;
	  I.sprite = Sprite("tie-fighter.gif");
	  I.width = 32;
	  I.height = 32;

	  I.inBounds = function() {
	    return I.x >= 0 && I.x <= I.canvas_width &&
	      I.y >= 0 && I.y <= I.canvas_height;
	  };

	  I.draw = function() {
		this.sprite.draw(I.canvas, this.x, this.y);
	    //canvas.fillStyle = this.color;
	    //canvas.fillRect(this.x, this.y, this.width, this.height);
	  };
	  
	  I.explode = function(){
		this.active = false;
	  }

	  I.update = function() {
	    I.x += I.xVelocity;
	    I.y += I.yVelocity;

	    I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

	    I.age++;

	    I.active = I.active && I.inBounds();
	  };

	  return I;
	};
    Player = function(p,game){
	
		function Bullet(I) {
		  I.active = true;
		  I.xVelocity = 0;
		  I.yVelocity = -I.speed;
		  I.width = 3;
		  I.height = 3;
		  I.color = "#000";

		  I.inBounds = function() {
		    return I.x >= 0 && I.x <= game.width &&
		      I.y >= 0 && I.y <= game.height;
		  };

		  I.draw = function() {
		    game.canvas.fillStyle = this.color;
		    game.canvas.fillRect(this.x, this.y, this.width, this.height);
		  };

		  I.update = function() {
		    I.x += I.xVelocity;
		    I.y += I.yVelocity;

		    I.active = I.active && I.inBounds();
		  };
		  return I;
		}
		this.canvas = game.canvas;
		this.x = p.start_x;
		this.y = p.start_y;
		this.width = p.width;
		this.height = p.height;
		this.lives = p.lives;
		this.sprite = Sprite(p.image);
		this.bullets = [];
		this.life_bar = {
			live_color: "#990000",
			dead_color: "#CCCCCC",
			width: 100,
			height:10,
			status: 100,
			reduce: function(){
				
			},
			gain: function(){
				
			},
			draw: function(){
				game.canvas.fillStyle = this.live_color;
				game.canvas.fillRect(12, 5, this.status, this.height);
			}
		};
		this.handle_keys = function(){
			if (keydown.left) {
				this.x -= 5;
			}
			if (keydown.right) {
				this.x += 5;
			}
			if (keydown.space){
				this.shoot();
			}
		};
		this.draw = function() {
		    //canvas.fillStyle = this.color;
		    //canvas.fillRect(this.x, this.y, this.width, this.height);
		    this.sprite.draw(this.canvas, this.x, this.y);
			this.canvas.fillStyle = "#000000";
		    this.canvas.fillText(this.lives, 3, 13);
			this.handle_keys();
			this.life_bar.draw();
		};
		this.shoot = function(){
			//console.log('test');
			if (this.bullets.length >= 10 ) return false;
			var bulletPosition = this.midpoint();
			this.bullets.push(new Bullet({
			    speed: 5,
			    x: bulletPosition.x,
			    y: bulletPosition.y
			}));
		};
		this.explode = function(){
			this.life_bar.status = this.life_bar.status - 10;
			if ( this.life_bar.status <= 0 )
				this.die();
		};
		this.die = function(){
			this.lives = this.lives - 1;
			if(this.lives == 0){ 
				game.end_game();
			}
			else{
				this.life_bar.status = 100;
			}   
	    };
		this.midpoint = function() {
		  	return { x: this.x + this.width/2, y: this.y + this.height/2};
	  	}	
	};
		
  };   	
	
  $.fn.gameable = function(method) {
	//extend the Number object with this clamp method
	Number.prototype.clamp = function(min, max) {
		 return Math.min(Math.max(this, min), max);
	};
	    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.gameable' );
    }    
  
  };

})( jQuery );