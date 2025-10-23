/**********************************

HISTORY - 历史记录管理器
类似 Photoshop 的历史记录功能

**********************************/

function History(loopy){

	var self = this;
	self.loopy = loopy;

	// 历史记录数组
	self.snapshots = [];
	self.currentIndex = -1; // 当前所在的历史记录索引
	self.maxHistory = 200; // 最大历史记录数量
	self.initialSnapshot = null; // 保存初始状态快照（永不删除）

	// 是否正在从历史记录恢复（避免重复记录）
	self.isRestoring = false;

	// 保存当前状态的快照
	self.saveSnapshot = function(actionName, isInitial){

		// 如果正在恢复历史记录，不保存
		if(self.isRestoring) return;

		// 获取当前模型的序列化数据（使用纯 JSON，不进行 URL 编码）
		var modelData = self.serializeForHistory();

		// 如果当前索引不是最后一个，删除后面的所有记录
		// （用户撤销后做了新操作，后面的"未来"记录应该被清除）
		if(self.currentIndex < self.snapshots.length - 1){
			self.snapshots.splice(self.currentIndex + 1);
		}

		// 创建快照对象
		var snapshot = {
			data: modelData,
			action: actionName || "操作",
			timestamp: Date.now(),
			isInitial: isInitial || false // 标记是否为初始状态
		};

		// 如果是初始状态，保存到特殊位置
		if(isInitial){
			self.initialSnapshot = snapshot;
			self.snapshots = [snapshot]; // 初始化时只有一个快照
			self.currentIndex = 0;
		}else{
			// 添加快照
			self.snapshots.push(snapshot);
			self.currentIndex++;

			// 限制历史记录数量（保留初始状态）
			// 如果超出最大值，删除第二早的记录（第一个是初始状态，不能删除）
			if(self.snapshots.length > self.maxHistory){
				if(self.snapshots[0].isInitial && self.snapshots.length > 1){
					// 删除索引 1 的记录（第二早的）
					self.snapshots.splice(1, 1);
					self.currentIndex--; // 索引需要调整
				}else{
					// 如果没有初始状态标记，删除最早的
					self.snapshots.shift();
					self.currentIndex--;
				}
			}
		}

		// 发布历史记录变化事件
		publish("history/changed");

	};

	// 专门为历史记录序列化（纯 JSON，不进行 URL 编码）
	self.serializeForHistory = function(){
		var model = self.loopy.model;
		var data = [];

		// Nodes
		var nodes = [];
		for(var i=0; i<model.nodes.length; i++){
			var node = model.nodes[i];
			var nodeData = [
				node.id,
				Math.round(node.x),
				Math.round(node.y),
				node.init,
				node.label, // 不进行 URL 编码
				node.hue
			];
			if(node.shape && node.shape !== 'circle'){
				nodeData.push(node.shape);
				if(node.radius && node.radius !== 60){
					nodeData.push(node.radius);
				}
			}else if(node.radius && node.radius !== 60){
				nodeData.push(node.shape || 'circle');
				nodeData.push(node.radius);
			}
			nodes.push(nodeData);
		}
		data.push(nodes);

		// Edges
		var edges = [];
		for(var i=0; i<model.edges.length; i++){
			var edge = model.edges[i];
			var dataEdge = [
				edge.from.id,
				edge.to.id,
				Math.round(edge.arc),
				edge.strength
			];
			if(edge.from.id == edge.to.id){
				dataEdge.push(Math.round(edge.rotation));
			}
			if(edge.isDelayed){
				if(dataEdge.length === 4){
					dataEdge.push(0);
				}
				dataEdge.push(edge.isDelayed);
			}
			edges.push(dataEdge);
		}
		data.push(edges);

		// Labels
		var labels = [];
		for(var i=0; i<model.labels.length; i++){
			var label = model.labels[i];
			labels.push([
				Math.round(label.x),
				Math.round(label.y),
				label.text // 不进行 URL 编码
			]);
		}
		data.push(labels);

		// META
		data.push(Node._UID);

		// Loops
		var loops = [];
		for(var i=0; i<model.loops.length; i++){
			var loop = model.loops[i];
			loops.push([
				loop.id,
				Math.round(loop.x),
				Math.round(loop.y),
				loop.text, // 不进行 URL 编码
				loop.loopType,
				loop.radius,
				loop.hue !== undefined ? loop.hue : 0
			]);
		}
		data.push(loops);

		// 返回纯 JSON 字符串
		return JSON.stringify(data);
	};

	// 专门为历史记录反序列化（纯 JSON）
	self.deserializeForHistory = function(dataString){
		var model = self.loopy.model;
		
		model.clear();

		var data = JSON.parse(dataString);

		// Get from array!
		var nodes = data[0];
		var edges = data[1];
		var labels = data[2];
		var UID = data[3];
		var loops = data[4] || [];

		// Nodes
		for(var i=0; i<nodes.length; i++){
			var node = nodes[i];
			var nodeConfig = {
				id: node[0],
				x: node[1],
				y: node[2],
				init: node[3],
				label: node[4], // 已经是纯文本
				hue: node[5]
			};
			if(node[6]){
				nodeConfig.shape = node[6];
			}
			if(node[7]){
				nodeConfig.radius = node[7];
			}
			model.addNode(nodeConfig);
		}

		// Edges
		for(var i=0; i<edges.length; i++){
			var edge = edges[i];
			var edgeConfig = {
				from: edge[0],
				to: edge[1],
				arc: edge[2],
				strength: edge[3]
			};
			if(edge[4] && (edge.length === 5 || typeof edge[5] === 'boolean')) {
				edgeConfig.rotation = edge[4];
			}
			if(edge[5]) edgeConfig.isDelayed = edge[5];
			model.addEdge(edgeConfig);
		}

		// Labels
		for(var i=0; i<labels.length; i++){
			var label = labels[i];
			model.addLabel({
				x: label[0],
				y: label[1],
				text: label[2] // 已经是纯文本
			});
		}

		// META
		Node._UID = UID;

		// Loops
		for(var i=0; i<loops.length; i++){
			var loop = loops[i];
			model.addLoop({
				id: loop[0],
				x: loop[1],
				y: loop[2],
				text: loop[3], // 已经是纯文本
				loopType: loop[4],
				radius: loop[5],
				hue: loop[6] !== undefined ? loop[6] : 0
			});
		}
	};

	// 跳转到指定的历史记录索引
	self.goToSnapshot = function(index){

		if(index < 0 || index >= self.snapshots.length) return;
		if(index === self.currentIndex) return; // 已经在这个状态了

		// 标记为正在恢复
		self.isRestoring = true;

		// 获取该历史记录的数据
		var snapshot = self.snapshots[index];

		// 恢复模型状态（使用专门的反序列化函数）
		self.deserializeForHistory(snapshot.data);

		// 更新当前索引
		self.currentIndex = index;

		// 发布历史记录变化事件
		publish("history/changed");

		// 重置模型
		publish("model/reset");

		// 短暂延迟后解除恢复标记
		setTimeout(function(){
			self.isRestoring = false;
		}, 100);

	};

	// 撤销（Undo）
	self.undo = function(){
		if(self.canUndo()){
			self.goToSnapshot(self.currentIndex - 1);
		}
	};

	// 重做（Redo）
	self.redo = function(){
		if(self.canRedo()){
			self.goToSnapshot(self.currentIndex + 1);
		}
	};

	// 是否可以撤销
	self.canUndo = function(){
		return self.currentIndex > 0;
	};

	// 是否可以重做
	self.canRedo = function(){
		return self.currentIndex < self.snapshots.length - 1;
	};

	// 格式化时间戳为可读格式
	self.formatTimestamp = function(timestamp){
		var date = new Date(timestamp);
		var now = new Date();
		var diff = now - date;

		// 如果是今天
		if(date.toDateString() === now.toDateString()){
			var hours = date.getHours().toString().padStart(2, '0');
			var minutes = date.getMinutes().toString().padStart(2, '0');
			var seconds = date.getSeconds().toString().padStart(2, '0');
			return hours + ':' + minutes + ':' + seconds;
		}
		
		// 如果是昨天
		var yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		if(date.toDateString() === yesterday.toDateString()){
			var hours = date.getHours().toString().padStart(2, '0');
			var minutes = date.getMinutes().toString().padStart(2, '0');
			return '昨天 ' + hours + ':' + minutes;
		}

		// 其他日期
		var month = (date.getMonth() + 1).toString().padStart(2, '0');
		var day = date.getDate().toString().padStart(2, '0');
		var hours = date.getHours().toString().padStart(2, '0');
		var minutes = date.getMinutes().toString().padStart(2, '0');
		return month + '-' + day + ' ' + hours + ':' + minutes;
	};

	// 清空历史记录
	self.clear = function(){
		// 保留初始状态
		if(self.initialSnapshot){
			self.snapshots = [self.initialSnapshot];
			self.currentIndex = 0;
		}else{
			self.snapshots = [];
			self.currentIndex = -1;
		}
		publish("history/changed");
	};

	// 获取动作名称（用于显示）
	self.getActionName = function(changeType){
		var actionNames = {
			"add_node": "添加节点",
			"remove_node": "删除节点",
			"edit_node": "编辑节点",
			"move_node": "移动节点",
			"add_edge": "添加箭头",
			"remove_edge": "删除箭头",
			"edit_edge": "编辑箭头",
			"add_label": "添加标签",
			"remove_label": "删除标签",
			"edit_label": "编辑标签",
			"add_loop": "添加环路",
			"remove_loop": "删除环路",
			"edit_loop": "编辑环路",
			"clear": "清空画布"
		};
		return actionNames[changeType] || "操作";
	};

	// 监听模型变化事件
	var changeTimer = null;
	var lastChangeType = null;

	subscribe("model/changed", function(changeType){
		
		// 如果正在恢复历史，忽略
		if(self.isRestoring) return;

		// 记录变化类型（changeType 现在是数组的第一个元素）
		lastChangeType = changeType;

		// 使用防抖，避免连续快速操作产生过多历史记录
		clearTimeout(changeTimer);
		changeTimer = setTimeout(function(){
			var actionName = self.getActionName(lastChangeType);
			self.saveSnapshot(actionName);
		}, 300); // 300ms 防抖

	});

	// 快捷键支持
	subscribe("key/undo", function(){
		if(Key.control || Key.command){ // Ctrl+Z 或 ⌘+Z
			self.undo();
		}
	});

	subscribe("key/redo", function(){
		if(Key.control || Key.command){ // Ctrl+Shift+Z 或 ⌘+Shift+Z
			self.redo();
		}
	});

	// 初始化：保存初始状态
	setTimeout(function(){
		self.isRestoring = true;
		self.saveSnapshot("初始状态", true); // 标记为初始状态
		self.isRestoring = false;
	}, 500);

}
