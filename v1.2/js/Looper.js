/**********************************

LOOPER
工具：创建增强/调节环路

**********************************/

function Looper(loopy){

	var self = this;
	self.loopy = loopy;

	// Which type of loop to create: "reinforcing" or "balancing"
	self.currentLoopType = "reinforcing";
	
	// Show menu when loop tool is selected
	self.showMenu = function(){
		var menu = document.getElementById("loop_menu");
		if(menu){
			menu.style.display = "block";
		}
	};

	// Hide menu
	self.hideMenu = function(){
		var menu = document.getElementById("loop_menu");
		if(menu){
			menu.style.display = "none";
		}
	};

	// Try making a loop
	self.tryMakingLoop = function(){
		
		// Get the next number for this loop type
		var number = self.getNextLoopNumber(self.currentLoopType);
		var prefix = (self.currentLoopType === "reinforcing") ? "R" : "B";
		var text = prefix + number;

		// 根据loopType设置默认颜色（增强=0红色，调节=4蓝色）
		var hue = (self.currentLoopType === "reinforcing") ? 0 : 4;

		// Create loop at mouse position
		var loop = loopy.model.addLoop({
			x: Mouse.x,
			y: Mouse.y,
			text: text,
			loopType: self.currentLoopType,
			hue: hue
		});

		// Edit it immediately
		loopy.sidebar.edit(loop);

	};

	// Get next loop number
	self.getNextLoopNumber = function(loopType){
		var prefix = (loopType === "reinforcing") ? "R" : "B";
		var maxNumber = 0;
		
		// Find the highest number for this type
		for(var i=0; i<loopy.model.loops.length; i++){
			var loop = loopy.model.loops[i];
			if(loop.loopType === loopType && loop.text){
				var match = loop.text.match(new RegExp("^" + prefix + "(\\d+)$"));
				if(match){
					var num = parseInt(match[1]);
					if(num > maxNumber) maxNumber = num;
				}
			}
		}
		
		return maxNumber + 1;
	};

	// Set loop type
	self.setLoopType = function(loopType){
		self.currentLoopType = loopType;
	};

}
