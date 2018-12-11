// webworker-thread
// created by dashlab.
//
// postMessage({ action: 'log', data: 'starting web worker...' })

	importScripts('js/three.min.js');

	function sleep () {
		let start = new Date ().getTime();
		while (new Date().getTime() < start + 1000) ;
	}

	//Message from main thread to start the Game of Life:
	onmessage = function(e) {
		
		//console.log('Message received from main script');

		//Read variables from main thread:
		var xcells = e.data[0];
		var ycells = e.data[1];
		var fadeoutlook = e.data[2];

		var colorWhite = new THREE.Color(0xffffff);
		var colorDark = new THREE.Color(0x000000);
		var mypreparedcolors = new Float32Array(xcells * ycells *3);

		//Prepare variables and arrays:
		var myrow = [];
		var cells = [];
		for (var x = 0; x < xcells; x++) {
			myrow = [];
			for (var y = 0; y < ycells; y++) 
				myrow.push(Math.round(Math.random() * 1))
			cells.push(myrow);
		}
		var newcells = [];
		for (x = 0; x < xcells; x++) {
			myrow = [];
			for (y = 0; y < ycells; y++) 
				myrow.push(0)
			newcells.push(myrow);
		}

		//GoL function for counting living neighbours:
		var countLivingNeighbours = function (cell_x, cell_y) {
			if ((cell_x > 0) && (cell_y > 0) && (cell_x < xcells - 1) && (cell_y < ycells - 1)) 
			{
				return	cells[cell_x - 1][cell_y - 1]+
						cells[cell_x    ][cell_y - 1]+
						cells[cell_x + 1][cell_y - 1]+
						cells[cell_x - 1][cell_y    ]+
						cells[cell_x + 1][cell_y    ]+
						cells[cell_x - 1][cell_y + 1]+
						cells[cell_x    ][cell_y + 1]+
						cells[cell_x + 1][cell_y + 1];
			} else return 0;
		}

		while (true) {
				
			var living = 0;

			//Applying GoL rules to all cells in the grid (400ms)
			for (var y = 0; y < ycells; y++) {
				for (var x = 0; x < xcells; x++) {

					living = countLivingNeighbours(x, y);
					//
					newcells[x][y] = 0;
					if (cells[x][y] == 1) { //living cell:
						if (living == 2) newcells[x][y] = 1
						else if (living == 3) newcells[x][y] = 1;
					}
					else //dead cell:
					{
						if (living == 3) newcells[x][y] = 1;
					};
				};
			};
				
			//Repainting dead and living cells:
			for (y = 0; y < ycells; y++) {
				for (x = 0; x < xcells; x++) {
					if (fadeoutlook) { //Dead cells fading out to black:
						if (newcells[x][y] == 1) //alive:
							colorWhite.toArray( mypreparedcolors, (y * xcells + x) * 3 )
						else //dead:
						{
							colorDark.fromArray( mypreparedcolors, (y * xcells + x) * 3 );
							if ( colorDark.r == 1.0 )
								colorDark.r = colorDark.r*0.3
							else
								colorDark.r = colorDark.r*0.98;
							//
							colorDark.g = colorDark.r;
							colorDark.b = 0;
							colorDark.toArray( mypreparedcolors, (y * xcells + x) * 3 );
						};
						//
						cells[x][y]=newcells[x][y];
					}
					else if (cells[x][y] != newcells[x][y]) { //makes the code faster (1.5x) //1010ms.
						if (newcells[x][y] == 1) //alive:
							colorWhite.toArray( mypreparedcolors, (y * xcells + x) * 3 )
						else //dead:
							colorDark.toArray( mypreparedcolors, (y * xcells + x) * 3 );
						//
						cells[x][y] = newcells[x][y];
					};
				};
			};
				
			//Send color data to main thread:
			postMessage({ action: 'datatodraw', data: mypreparedcolors })

		};
	};