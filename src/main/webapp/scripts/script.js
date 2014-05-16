
(function($, undefined){

	function game(){

		var _config = {
			board : $('#board'),
			posMove: 'pos-move',
			selTile: 'sel-tile'
		};

		var _moveList = {},
			_ctx = this; 

		//Repaints the entire board, fetchs the template (if not already fetched)
		//As well as the current game state and move list. 
		this.repaint = function(){
			
			//TODO: getMoves should probably be chained as well. 
			//Not sure yet why chaining results in wrong data being passed to the getBoardState function
			this.getMoves();

			this.getBoardTemplate().then(this.getBoardState).then(function(html){
				_config.board.html(html);
			});	

		};

		//Resets the game on the server and issues a repaint. 
		this.resetGame = function(){
			$.ajax({
				url:'/api/chess',
				type: 'POST'
			}).done(function(){
				_ctx.repaint()
			});
		};
		
		//Gets the state of the board and renders it with a passed in template. 
		this.getBoardState = function(template){

			var d = $.Deferred(); 
		    $.ajax({
				url:'/api/chess'
			}).done(function(data){
				d.resolve(template({
					pos: data.positionToPieces,
					letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
				}));
			});
			return d; 
		};

		//Gets and compiles the template for the board
		//Registers various Handlebars templates to assist with rendering. 
		this.getBoardTemplate = (function(){

			var template = null; 

			//src: http://stackoverflow.com/a/11924998
			Handlebars.registerHelper('times', function(n, block) {
			    var accum = '';
			    for(var i = 1; i < n + 1; ++i){//make this 1 based to avoid conversions
			        accum += block.fn(i);
		        }
			    return accum;
			});

			//Paints the pieces on the board
			Handlebars.registerHelper('genPiece', function(letter, number, pos){
				var piece = pos[letter + (number)]; 
				if(piece){
					//todo: not sure why I need a safe string
					//src: http://stackoverflow.com/a/10391275
					return new Handlebars.SafeString("<span class='piece " + piece.type + piece.owner + "'>&nbsp;</span>");
				}
				return ""; 
			});

			return function(){
				var d = $.Deferred(); 

				if(template){
					d.resolve(template); 
				}else{
					$.ajax({
						url:'/chess/scripts/template.board.js',
						dataType: 'text'
					}).done(function(data){
						template = Handlebars.compile(data);
						d.resolve(template);
					});
				}
				
				return d; 
			};
		})();

		//Gets the current list of moves for the board
		this.getMoves = function(){

			var d = $.Deferred(); 

			$.ajax({
				url:'/api/chess/moves'
			}).done(function(data){
				var newData = {}; 

				//Create an object with nested arrays to represent the available moves for every piece on the board. 
				$.each(data, function(i, ele){
					newData[ele.origin] = newData[ele.origin] ? newData[ele.origin] : [];
					newData[ele.origin].push(ele.destination)
				});

				//TODO: Get rid of this global setter.
				_moveList = newData; 
				d.resolve(newData);
			}); 

			return d; 

		};

		//Moves a piece from one cell to another
		//from: jQuery table cell
		//to: jkQuery table cell
		this.movePiece = function(from, to){
			
			//optomistic. Moving the piece before I get sever confirmation. 
			to.empty().append(from.find('span')); 

			$.ajax({
				url:'/api/chess/moves',
				type: 'POST',
				contentType:'application/json;',
				dataType:"json",
				data: JSON.stringify({ //need to serialize manually. Otherwise getting a 400
			        origin: from.attr('id'),
			        destination: to.attr('id')
			    })
			}).done(function(data){
				_ctx.getMoves();
			}).fail(function(e){
				console.log(e);
			})
		}

		//Wires up the click events for the board. 
		function setBoardEvents(){
			_config.board.on('click', 'td', function(){
				
				var ele = $(this); 
				var moves = _moveList[ele.attr('id')];

				if(ele.hasClass(_config.posMove)){
					_ctx.movePiece($('.' + _config.selTile), ele)
				}

				$('.' + _config.posMove).removeClass(_config.posMove);
				$('.' + _config.selTile).removeClass(_config.selTile);

				ele.addClass(_config.selTile);

				if(moves){
					$(genMoveSelector(moves)).addClass(_config.posMove);
				}
			});
		}

		//Generates a select list of possible moves.
		//Used for painting the available moves for the selected piece. 
		function genMoveSelector(moves){
			var selector = "", 
				i = 0; 
				l = moves.length; 

			for(; i < l; i++){
				selector += "#" + moves[i] + (i+1 < l ? "," : ""); 
			}

			return selector; 
		}

		setBoardEvents();

	}

	$(function(){
		var myGame = new game(); 
		myGame.repaint(); 

		$('#reset').click(myGame.resetGame);
	});

})(jQuery);

