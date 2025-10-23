/**********************************

HISTORY PANEL - 历史记录面板

**********************************/

function HistoryPanel(loopy){

	var self = this;
	self.loopy = loopy;

	// 创建 DOM
	self.dom = document.createElement("div");
	self.dom.id = "history_panel";

	// 创建标题
	var header = document.createElement("div");
	header.className = "history_header";
	header.innerHTML = "历史记录";
	self.dom.appendChild(header);

	// 创建列表容器
	self.listContainer = document.createElement("div");
	self.listContainer.id = "history_list";
	self.dom.appendChild(self.listContainer);

	// 添加到 sidebar
	var sidebar = document.getElementById("sidebar");
	sidebar.appendChild(self.dom);

	// 更新历史记录显示
	self.update = function(){
		
		if(!loopy.history) return;
		
		// 清空列表
		self.listContainer.innerHTML = "";
		
		// 获取历史记录
		var snapshots = loopy.history.snapshots;
		var currentIndex = loopy.history.currentIndex;
		
		// 如果没有历史记录
		if(snapshots.length === 0){
			self.listContainer.innerHTML = "<div class='history_empty'>暂无历史记录</div>";
			return;
		}
		
		// 倒序显示（最新的在上面），但初始状态始终置顶
		var orderedSnapshots = [];
		var initialIndex = -1;
		
		// 找到初始状态
		for(var i = 0; i < snapshots.length; i++){
			if(snapshots[i].isInitial){
				initialIndex = i;
				break;
			}
		}
		
		// 先添加非初始状态（倒序）
		for(var i = snapshots.length - 1; i >= 0; i--){
			if(!snapshots[i].isInitial){
				orderedSnapshots.push({snapshot: snapshots[i], originalIndex: i});
			}
		}
		
		// 最后添加初始状态（如果存在）
		if(initialIndex >= 0){
			orderedSnapshots.push({snapshot: snapshots[initialIndex], originalIndex: initialIndex});
		}
		
		// 渲染所有项目
		for(var j = 0; j < orderedSnapshots.length; j++){
			var item = orderedSnapshots[j];
			var snapshot = item.snapshot;
			var i = item.originalIndex;
			
			var itemDiv = document.createElement("div");
			itemDiv.className = "history_item";
			
			// 初始状态特殊样式
			if(snapshot.isInitial){
				itemDiv.className += " history_initial";
			}
			
			// 当前状态高亮显示
			if(i === currentIndex){
				itemDiv.className += " history_current";
			}
			
			// 未来的状态（被撤销的）显示为灰色
			if(i > currentIndex){
				itemDiv.className += " history_future";
			}
			
			// 构建 HTML 内容
			var timeStr = loopy.history.formatTimestamp(snapshot.timestamp);
			var actionHTML = '<div class="history_item_action">' + snapshot.action + '</div>';
			var timeHTML = '<div class="history_item_time">' + timeStr + '</div>';
			itemDiv.innerHTML = actionHTML + timeHTML;
			
			itemDiv.setAttribute("data-index", i);
			
			// 点击跳转到该历史记录
			itemDiv.onclick = function(){
				var index = parseInt(this.getAttribute("data-index"));
				loopy.history.goToSnapshot(index);
			};
			
			self.listContainer.appendChild(itemDiv);
		}
	};

	// 监听历史记录变化
	subscribe("history/changed", function(){
		self.update();
	});

	// 初始化历史记录面板
	setTimeout(function(){
		self.update();
	}, 600);

}
