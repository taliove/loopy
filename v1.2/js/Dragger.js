/**********************************

DRAGGER

**********************************/

function Dragger(loopy){

	var self = this;
	self.loopy = loopy;

	// Dragging anything?
	self.dragging = null;
	self.offsetX = 0;
	self.offsetY = 0;

	// Canvas dragging
	self.draggingCanvas = false;
	self.canvasDragStartScreenX = 0;
	self.canvasDragStartScreenY = 0;
	self.canvasDragStartOffsetX = 0;
	self.canvasDragStartOffsetY = 0;

	subscribe("mousedown",function(event){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_DRAG) return;

		// RIGHT-CLICK TO DRAG CANVAS
		if(Mouse.rightPressed){
			self.draggingCanvas = true;
			self.canvasDragStartScreenX = event.x;
			self.canvasDragStartScreenY = event.y;
			self.canvasDragStartOffsetX = loopy.offsetX;
			self.canvasDragStartOffsetY = loopy.offsetY;
			return;
		}

		// Any node under here? If so, start dragging!
		var dragNode = loopy.model.getNodeByPoint(Mouse.x, Mouse.y);
		if(dragNode){
			self.dragging = dragNode;
			self.offsetX = Mouse.x - dragNode.x;
			self.offsetY = Mouse.y - dragNode.y;
			loopy.sidebar.edit(dragNode); // and edit!
			return;
		}

		// Any label under here? If so, start dragging!
		var dragLabel = loopy.model.getLabelByPoint(Mouse.x, Mouse.y);
		if(dragLabel){
			self.dragging = dragLabel;
			self.offsetX = Mouse.x - dragLabel.x;
			self.offsetY = Mouse.y - dragLabel.y;
			loopy.sidebar.edit(dragLabel); // and edit!
			return;
		}

		// Any loop under here? If so, start dragging!
		var dragLoop = loopy.model.getLoopByPoint(Mouse.x, Mouse.y);
		if(dragLoop){
			self.dragging = dragLoop;
			self.offsetX = Mouse.x - dragLoop.x;
			self.offsetY = Mouse.y - dragLoop.y;
			loopy.sidebar.edit(dragLoop); // and edit!
			return;
		}

		// Any edge under here? If so, start dragging!
		var dragEdge = loopy.model.getEdgeByPoint(Mouse.x, Mouse.y);
		if(dragEdge){
			self.dragging = dragEdge;
			self.offsetX = Mouse.x - dragEdge.labelX;
			self.offsetY = Mouse.y - dragEdge.labelY;
			loopy.sidebar.edit(dragEdge); // and edit!
			return;
		}

		// NOTHING UNDER CURSOR - DRAG CANVAS!
		self.draggingCanvas = true;
		self.canvasDragStartScreenX = event.x;
		self.canvasDragStartScreenY = event.y;
		self.canvasDragStartOffsetX = loopy.offsetX;
		self.canvasDragStartOffsetY = loopy.offsetY;

	});
	subscribe("mousemove",function(event){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_DRAG) return;

		// If you're dragging the CANVAS, move it!
		if(self.draggingCanvas){
			var dx = event.x - self.canvasDragStartScreenX;
			var dy = event.y - self.canvasDragStartScreenY;
			loopy.offsetX = self.canvasDragStartOffsetX + dx;
			loopy.offsetY = self.canvasDragStartOffsetY + dy;
			// Publish a custom event to keep draw() active while dragging canvas
			publish("canvas/drag");
			return;
		}

		// If you're dragging a NODE, move it around!
		if(self.dragging && self.dragging._CLASS_=="Node"){

			// Model's been changed!
			publish("model/changed");
			
			var node = self.dragging;
			node.x = Mouse.x - self.offsetX;
			node.y = Mouse.y - self.offsetY;

			// update coz visual glitches
			loopy.model.update();
			
		}

		// If you're dragging a LOOP, move it around!
		if(self.dragging && self.dragging._CLASS_=="Loop"){

			// Model's been changed!
			publish("model/changed");
			
			var loop = self.dragging;
			loop.x = Mouse.x - self.offsetX;
			loop.y = Mouse.y - self.offsetY;

			// update coz visual glitches
			loopy.model.update();
			
		}

		// If you're dragging an EDGE, move it around!
		if(self.dragging && self.dragging._CLASS_=="Edge"){

			// Model's been changed!
			publish("model/changed");

			var edge = self.dragging;
			var labelX = Mouse.x - self.offsetX;
			var labelY = Mouse.y - self.offsetY;

			if(edge.from!=edge.to){

				// The Arc: whatever label *Y* is, relative to angle & first node's pos
				var fx=edge.from.x, fy=edge.from.y, tx=edge.to.x, ty=edge.to.y;
				var dx=tx-fx, dy=ty-fy;
				var a = Math.atan2(dy,dx);

				// Calculate arc
				var points = [[labelX,labelY]];
				var translated = _translatePoints(points, -fx, -fy);
				var rotated = _rotatePoints(translated, -a);
				var newLabelPoint = rotated[0];

				// ooookay.
				edge.arc = -newLabelPoint[1]; // WHY NEGATIVE? I DON'T KNOW.

			}else{

				// For SELF-ARROWS: just get angle & mag for label.
				var dx = labelX - edge.from.x,
					dy = labelY - edge.from.y;
				var a = Math.atan2(dy,dx);
				var mag = Math.sqrt(dx*dx + dy*dy);

				// Minimum mag
				var minimum = edge.from.radius+25;
				if(mag<minimum) mag=minimum;

				// Update edge
				edge.arc = mag;
				edge.rotation = a*(360/Math.TAU)+90;

			}

			// update coz visual glitches
			loopy.model.update();

		}

		// If you're dragging a LABEL, move it around!
		if(self.dragging && self.dragging._CLASS_=="Label"){

			// Model's been changed!
			publish("model/changed");
			
			var label = self.dragging;
			label.x = Mouse.x - self.offsetX;
			label.y = Mouse.y - self.offsetY;

			// update coz visual glitches
			loopy.model.update();
			
		}

	});
	subscribe("mouseup",function(){

		// ONLY WHEN EDITING w DRAG
		if(self.loopy.mode!=Loopy.MODE_EDIT) return;
		if(self.loopy.tool!=Loopy.TOOL_DRAG) return;

		// Let go!
		self.dragging = null;
		self.draggingCanvas = false;
		self.offsetX = 0;
		self.offsetY = 0;

	});

}