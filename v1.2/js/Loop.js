/**********************************

LOOP!
增强环路(Reinforcing)和调节环路(Balancing)

**********************************/

Loop.defaultType = "reinforcing"; // reinforcing or balancing

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
		radius: 80 // 圆的半径
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

		// Draw the 90% circle (270 degrees) with arrow at the end
		var startAngle = Math.TAU * 0.125; // 开始角度 (45度)
		var endAngle = startAngle + Math.TAU * 0.9; // 结束角度 (覆盖90%的圆，即324度)

		// 设置颜色 - 增强环路用红色，调节环路用蓝色
		var strokeColor = (self.loopType === "reinforcing") ? "#EA3E3E" : "#7FD4FF";
		
		ctx.beginPath();
		ctx.arc(0, 0, r, startAngle, endAngle, false);
		ctx.lineWidth = 6;
		ctx.strokeStyle = strokeColor;
		ctx.stroke();

		// Draw arrow at the end
		var arrowX = Math.cos(endAngle) * r;
		var arrowY = Math.sin(endAngle) * r;
		var arrowAngle = endAngle + Math.TAU/4; // perpendicular to circle
		var arrowLength = 20;

		ctx.save();
		ctx.translate(arrowX, arrowY);
		ctx.rotate(arrowAngle);
		ctx.beginPath();
		ctx.moveTo(-arrowLength/2, -arrowLength);
		ctx.lineTo(0, 0);
		ctx.lineTo(arrowLength/2, -arrowLength);
		ctx.lineWidth = 6;
		ctx.strokeStyle = strokeColor;
		ctx.stroke();
		ctx.restore();

		// Draw text in the center
		var fontsize = 50;
		ctx.font = "bold "+fontsize+"px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = strokeColor;
		
		// Measure text width and adjust font size if needed
		var width = ctx.measureText(self.text).width;
		while(width > r*1.5){ // 确保文本不超出圆圈
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
