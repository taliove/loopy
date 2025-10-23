/**********************************

TOOLBAR CODE

**********************************/

function Toolbar(loopy){

	var self = this;

	// Tools & Buttons
	var buttons = [];
	var buttonsByID = {};
	self.dom = document.getElementById("toolbar");
	self.addButton = function(options){

		var id = options.id;
		var tooltip = options.tooltip;
		var callback = options.callback;

		// Add the button
		var button = new ToolbarButton(self,{
			id: id,
			icon: "css/icons/"+id+".png",
			tooltip: tooltip,
			callback: callback
		});
		self.dom.appendChild(button.dom);
		buttons.push(button);
		buttonsByID[id] = button;

		// Keyboard shortcut!
		(function(id){
			subscribe("key/"+id,function(){
				loopy.ink.reset(); // also CLEAR INK CANVAS
				buttonsByID[id].callback();
			});
		})(id);

	};

	// Select button
	self.selectButton = function(button){
		for(var i=0;i<buttons.length;i++){
			buttons[i].deselect();
		}
		button.select();
	};

	// Set Tool
	self.currentTool = "ink";
	self.setTool = function(tool){
		self.currentTool = tool;
		var name = "TOOL_"+tool.toUpperCase();
		loopy.tool = Loopy[name];
		document.getElementById("canvasses").setAttribute("cursor",tool);
	};

	// Populate those buttons!
	self.addButton({
		id: "ink",
		tooltip: "PE(N)CIL",
		callback: function(){
			self.setTool("ink");
		}
	});
	self.addButton({
		id: "label",
		tooltip: "(T)EXT",
		callback: function(){
			self.setTool("label");
		}
	});
	self.addButton({
		id: "loop",
		tooltip: "(L)OOP",
		callback: function(){
			self.setTool("loop");
			self.showLoopMenu();
		}
	});
	self.addButton({
		id: "drag",
		tooltip: "MO(V)E",
		callback: function(){
			self.setTool("drag");
		}
	});
	self.addButton({
		id: "erase",
		tooltip: "(E)RASE",
		callback: function(){
			self.setTool("erase");
		}
	});

	// Select button
	buttonsByID.ink.callback();

	// Loop menu functions
	self.showLoopMenu = function(){
		// Create loop menu if it doesn't exist
		if(!document.getElementById("loop_menu")){
			self.createLoopMenu();
		}
		var menu = document.getElementById("loop_menu");
		menu.style.display = "block";
	};

	self.hideLoopMenu = function(){
		var menu = document.getElementById("loop_menu");
		if(menu){
			menu.style.display = "none";
		}
	};

	self.createLoopMenu = function(){
		var menu = document.createElement("div");
		menu.id = "loop_menu";
		menu.setAttribute("class", "loop_menu");
		menu.style.display = "none";

		// Reinforcing button
		var reinforcingBtn = document.createElement("div");
		reinforcingBtn.setAttribute("class", "loop_menu_button reinforcing");
		reinforcingBtn.innerHTML = "增强环路 (R)";
		reinforcingBtn.onclick = function(){
			loopy.looper.setLoopType("reinforcing");
			self.hideLoopMenu();
		};

		// Balancing button
		var balancingBtn = document.createElement("div");
		balancingBtn.setAttribute("class", "loop_menu_button balancing");
		balancingBtn.innerHTML = "调节环路 (B)";
		balancingBtn.onclick = function(){
			loopy.looper.setLoopType("balancing");
			self.hideLoopMenu();
		};

		menu.appendChild(reinforcingBtn);
		menu.appendChild(balancingBtn);
		self.dom.appendChild(menu);
	};

	// Hide loop menu when other tools are selected
	var originalSetTool = self.setTool;
	self.setTool = function(tool){
		originalSetTool(tool);
		if(tool !== "loop"){
			self.hideLoopMenu();
		}
	};

	// Hide & Show

}

function ToolbarButton(toolbar, config){

	var self = this;
	self.id = config.id;

	// Icon
	self.dom = document.createElement("div");
	self.dom.setAttribute("class", "toolbar_button");
	self.dom.style.backgroundImage = "url('"+config.icon+"')";

	// Tooltip!
	self.dom.setAttribute("data-balloon", config.tooltip);
	self.dom.setAttribute("data-balloon-pos", "right");

	// Selected?
	self.select = function(){
		self.dom.setAttribute("selected", "yes");
	};
	self.deselect = function(){
		self.dom.setAttribute("selected", "no");
	};

	// On Click
	self.callback = function(){
		config.callback();
		toolbar.selectButton(self);
	};
	self.dom.onclick = self.callback;

}