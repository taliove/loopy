(function(exports){

	// Singleton
	var Key = {};
	exports.Key = Key;

	// Keycodes to words mapping
	var KEY_CODES = {
		
		17: "control",
		91: "control", // macs
		93: "command", // right command key on mac
		224: "command", // command key firefox
		13: "enter", // enter
		16: "shift", // shift
		90: "z", // Z key
		89: "y", // Y key

		// TODO: Standardize the NAMING across files?!?!
		78: "ink", // Pe(n)cil
		86: "drag", // Mo(v)e
		69: "erase", // (E)rase
		84: "label", // (T)ext
		76: "loop", // (L)oop
		83: "save", // (S)ave

	};

	// Event Handling
	// TODO: cursors stay when click button? orrrrr switch over to fake-cursor.
	Key.onKeyDown = function(event){
		if(window.loopy && loopy.modal && loopy.modal.isShowing) return;
		var code = KEY_CODES[event.keyCode];
	    Key[code] = true;
	    
	    // Handle Undo (Ctrl+Z / Cmd+Z)
	    if(code === "z" && (Key.control || Key.command)){
	    	if(Key.shift){
	    		publish("key/redo"); // Ctrl+Shift+Z / Cmd+Shift+Z
	    	}else{
	    		publish("key/undo"); // Ctrl+Z / Cmd+Z
	    	}
	    	event.stopPropagation();
	    	event.preventDefault();
	    	return;
	    }
	    
	    // Handle Redo (Ctrl+Y / Cmd+Y)
	    if(code === "y" && (Key.control || Key.command)){
	    	publish("key/redo");
	    	event.stopPropagation();
	    	event.preventDefault();
	    	return;
	    }
	    
	    publish("key/"+code);
	    event.stopPropagation();
	    event.preventDefault();
	}
	Key.onKeyUp = function(event){
		if(window.loopy && loopy.modal && loopy.modal.isShowing) return;
		var code = KEY_CODES[event.keyCode];
	    Key[code] = false;
	    event.stopPropagation();
	    event.preventDefault();
	}
	window.addEventListener("keydown",Key.onKeyDown,false);
	window.addEventListener("keyup",Key.onKeyUp,false);

})(window);