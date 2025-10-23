/**********************************

LOOP!
增强环路(Reinforcing)和调节环路(Balancing)

**********************************/

Loop.defaultType = "reinforcing"; // reinforcing or balancing
Loop.defaultSize = 24; // 默认大小 - 第二小的等级（7个等级中）
Loop.defaultHue = 0; // 默认颜色（使用Node的颜色系统）
Loop.arrowRotation = 9; // 箭头旋转度数（逆时针，度数制）

// 颜色定义 - 使用Node的颜色系统
Loop.COLORS = {
	0: "#EA3E3E", // red
	1: "#EA9D51", // orange
	2: "#FEEE43", // yellow
	3: "#BFEE3F", // green
	4: "#7FD4FF", // blue
	5: "#A97FFF"  // purple
};

function Loop(model, config){

	var self = this;
	self._CLASS_ = "Loop";

	// Mah Parents!
	self.loopy = model.loopy;
	self.model = model;
	self.config = config;

	// Default values...
	_configureProperties(self, config, {
		id: Loop._getUID,
		x: 0,
		y: 0,
		text: "R1", // 默认文本
		loopType: Loop.defaultType, // reinforcing or balancing
		radius: Loop.defaultSize, // 圆的半径
		hue: Loop.defaultHue // 颜色
	});

	//////////////////////////////////////
	// UPDATE & DRAW /////////////////////
	//////////////////////////////////////

	// Update!
	self.update = function(speed){
		// Loops are static, no update needed for now
	};

	// Draw
	self.draw = function(ctx){

		// Retina
		var x = self.x*2;
		var y = self.y*2;
		var r = self.radius*2;

		// Translate!
		ctx.save();
		ctx.translate(x, y);
		
		// DRAW HIGHLIGHT???
		if(self.loopy.sidebar.currentPage.target == self){
			ctx.beginPath();
			ctx.arc(0, 0, r+20, 0, Math.TAU, false);
			ctx.fillStyle = HIGHLIGHT_COLOR;
			ctx.fill();
		}

		// 设置颜色 - 使用hue属性
		var color = Loop.COLORS[self.hue];

		// Draw 90% arc with arrow (circular indicator)
		var startAngle = 90; // 开始角度 (45度)
		var endAngle = startAngle + Math.TAU * 0.9; // 结束角度 (覆盖90%的圆，即324度)

		ctx.beginPath();
		ctx.arc(0, 0, r, startAngle, endAngle, false);
		ctx.lineWidth = r/5;
		ctx.strokeStyle = color;
		ctx.stroke();

		// Draw arrow at the end of arc
		var arrowX = Math.cos(endAngle) * r+r/5;
		var arrowY = Math.sin(endAngle) * r+r/3.7;
		var arrowAngle = 44.9
		var arrowLength = r * 0.5;

		ctx.save();
		ctx.translate(arrowX, arrowY);
		ctx.rotate(arrowAngle);
		ctx.beginPath();
		ctx.moveTo(-arrowLength, -arrowLength/2);
		ctx.lineTo(0, 0);
		ctx.lineTo(-arrowLength, arrowLength/2);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.restore();

		// Draw text in the center
		var fontsize = Math.max(Math.floor(r * 0.75), 12);
		ctx.font = "bold "+fontsize+"px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = color;
		
		// Measure text width and adjust font size if needed
		var width = ctx.measureText(self.text).width;
		while(width > r*1.2 && fontsize > 8){
			fontsize -= 2;
			ctx.font = "bold "+fontsize+"px sans-serif";
			width = ctx.measureText(self.text).width;
		}
		
		ctx.fillText(self.text, 0, 0);

		// Restore
		ctx.restore();

	};

	//////////////////////////////////////
	// KILL LOOP /////////////////////////
	//////////////////////////////////////

	self.kill = function(){
		// Remove from parent!
		model.removeLoop(self);

		// Killed!
		publish("kill",[self]);
	};

	//////////////////////////////////////
	// HELPER METHODS ////////////////////
	//////////////////////////////////////

	self.isPointInLoop = function(x, y){
		return _isPointInCircle(x, y, self.x, self.y, self.radius);
	};

	self.getBoundingBox = function(){
		return {
			left: self.x - self.radius,
			top: self.y - self.radius,
			right: self.x + self.radius,
			bottom: self.y + self.radius
		};
	};

}

////////////////////////////
// Unique ID identifiers! //
////////////////////////////

Loop._UID = 0;
Loop._getUID = function(){
	Loop._UID++;
	return Loop._UID;
};
