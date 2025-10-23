window.Mouse = {};
Mouse.init = function(target){

	// Events!
	var _onmousedown = function(event){
		Mouse.moved = false;
		Mouse.pressed = true;
		Mouse.rightPressed = event.button === 2; // 2 = right button
		Mouse.startedOnTarget = true;
		var _fakeEvent = _onmousemove(event); // so Mouse.x/y is correct
		publish("mousedown", [_fakeEvent]);
		if(Mouse.rightPressed) publish("mousedown/right");
	};
	var _onmousemove = function(event){

		// DO THE INVERSE
		var canvasses = document.getElementById("canvasses");
		var s = 1/loopy.offsetScale;
		var CW = canvasses.clientWidth - _PADDING - _PADDING;
		var CH = canvasses.clientHeight - _PADDING_BOTTOM - _PADDING;

		// Start with mouse position
		var mx = event.x;
		var my = event.y;

		// Then transform to world space
		var tx = 0;
		var ty = 0;

		if(loopy.embedded){
			tx -= _PADDING/2; // dunno why but this is needed
			ty -= _PADDING/2; // dunno why but this is needed
		}
		
		tx -= (CW+_PADDING)/2;
		ty -= (CH+_PADDING)/2;
		
		tx = s*tx;
		ty = s*ty;

		tx += (CW+_PADDING)/2;
		ty += (CH+_PADDING)/2;

		tx -= loopy.offsetX;
		ty -= loopy.offsetY;

		// Apply transform
		mx = mx*s + tx;
		my = my*s + ty;

		// Mouse!
		Mouse.x = mx;
		Mouse.y = my;

		Mouse.moved = true;
		publish("mousemove", [event]);

		return event;

	};
	var _onmouseup = function(event){
		Mouse.pressed = false;
		if(Mouse.rightPressed) publish("mouseup/right");
		Mouse.rightPressed = false;
		if(Mouse.startedOnTarget){
			publish("mouseup");
			if(!Mouse.moved) publish("mouseclick");
		}
		Mouse.moved = false;
		Mouse.startedOnTarget = false;
	};

	// Add mouse & touch events!
	_addMouseEvents(target, _onmousedown, _onmousemove, _onmouseup);

	// Cursor & Update
	Mouse.target = target;
	Mouse.showCursor = function(cursor){
		Mouse.target.style.cursor = cursor;
	};
	Mouse.update = function(){
		Mouse.showCursor("");
	};

};