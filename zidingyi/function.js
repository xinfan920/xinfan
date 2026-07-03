import { lib, game, ui, get, ai, _status } from "../../../noname.js";

//添加player方法
Object.assign(lib.element.Player.prototype, {

	//联机在武将头像上播放gif动画(也可以传入普通图片)
	//参数顺序必须为：图片路径、预播放的长、宽(不填则默认均为200像素)、持续时间(不填则默认2000ms)、图片相对于武将框中心的偏移量)
	// 联机在武将头像上播放gif动画（修改版：中心对齐 + 坐标偏移）
	playGifOL() {
		const player = this;
		const args = Array.from(arguments);

		// 默认值
		let path = '';
		let length = 200, height = 200; // 尺寸默认值
		let x = 0, y = 0;               // 偏移默认值
		let duration = 2000;            // 时长默认值

		let arrayCount = 0; // 用于区分第几个数组

		for (const arg of args) {
			if (typeof arg === 'string') {
				// 识别路径：包含斜杠或后缀名，且不是单纯的数字字符串
				if (arg.includes('.') || arg.includes('/')) {
					path = arg;
				}
			} else if (Array.isArray(arg)) {
				// 识别数组
				arrayCount++;
				if (arrayCount === 1) {
					// 第一个数组分配给 [长, 宽]
					length = arg[0] ?? 200;
					height = arg[1] ?? length; // 如果只填了一个，宽默认等于长
				} else if (arrayCount === 2) {
					// 第二个数组分配给 [x, y]
					x = arg[0] ?? 0;
					y = arg[1] ?? 0;
				}
			} else if (typeof arg === 'number') {
				// 单独的数字识别为时长
				duration = arg;
			}
		}

		if (!path) return;

		const imagePath = lib.assetURL + path;

		game.broadcastAll((imagePath, length, height, duration, x, y, player) => {
			const gifContainer = document.createElement('div');
			gifContainer.className = 'gif-animation-container';

			// 核心居中逻辑
			Object.assign(gifContainer.style, {
				position: 'absolute',
				top: '50%',
				left: '50%',
				width: length + 'px',
				height: height + 'px',
				// 使用 translate 使图片几何中心对齐头像框中心，再叠加 [x, y] 偏移
				transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
				zIndex: '1000',
				pointerEvents: 'none',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center'
			});

			const gifImg = document.createElement('img');
			gifImg.src = imagePath;
			Object.assign(gifImg.style, {
				width: '100%',
				height: '100%',
				objectFit: 'cover',
				pointerEvents: 'none'
			});

			gifContainer.appendChild(gifImg);
			player.appendChild(gifContainer);

			const actualDuration = duration || 2000;

			// 定时移除
			setTimeout(() => {
				if (gifContainer.parentNode) {
					gifContainer.parentNode.removeChild(gifContainer);
				}
			}, actualDuration);

			// 淡出动画
			setTimeout(() => {
				gifContainer.animate([
					{ opacity: 1 }, { opacity: 0 }
				], {
					duration: 300,
					easing: 'ease-out',
					fill: 'forwards'
				});
			}, Math.max(0, actualDuration - 300));
		}, imagePath, length, height, duration, x, y, player);
	},
	//联机在武将头像上播放CSS动画
	/*func例：爆炸特效(AI提示词：以下函数实现了在玩家头像框上播放爆炸动画的效果，我现在希望你不更改函数的参数表，将此函数实现的动画效果改为……)
	  func = function (targetPlayer) {
			// 创建爆炸容器
			const explosion = document.createElement('div');
			explosion.className = 'explosion-effect';

			// 设置爆炸样式
			Object.assign(explosion.style, {
				position: 'absolute',
				top: '-20px',
				left: '50%',
				transform: 'translateX(-50%)',
				width: '100px',
				height: '100px',
				zIndex: '1000',
				pointerEvents: 'none'
			});

			// 插入到玩家头像容器
			targetPlayer.appendChild(explosion);

			// 创建爆炸粒子

			// 动画结束后移除
			setTimeout(() => {
				if (explosion.parentNode) {
					explosion.parentNode.removeChild(explosion);
				}
			}, 800);
			const colors = ['#ff0000', '#ff8800', '#ffff00', '#ff6600'];
			const particleCount = 20;

			for (let i = 0; i < particleCount; i++) {
				const particle = document.createElement('div');
				particle.className = 'explosion-particle';

				// 随机大小
				const size = Math.random() * 300 + 5;
				const color = colors[Math.floor(Math.random() * colors.length)];

				Object.assign(particle.style, {
					position: 'absolute',
					width: `${size}px`,
					height: `${size}px`,
					background: color,
					borderRadius: '50%',
					left: '50%',
					top: '50%',
					transform: 'translate(-50%, -50%)',
					opacity: '0',
					boxShadow: `0 0 ${size}px ${color}`
				});

				explosion.appendChild(particle);

				// 粒子动画
				const angle = (Math.random() * Math.PI * 2);
				const distance = Math.random() * 40 + 30;
				const duration = Math.random() * 300 + 400;

				const animation = particle.animate([
					{
						opacity: 0,
						transform: 'translate(-50%, -50%) scale(0)'
					},
					{
						opacity: 1,
						transform: 'translate(-50%, -50%) scale(1)'
					},
					{
						opacity: 0,
						transform: `translate(${-50 + Math.cos(angle) * distance}%, ${-50 + Math.sin(angle) * distance}%) scale(0.2)`
					}
				], {
					duration: duration,
					easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
				});

				animation.onfinish = () => {
					if (particle.parentNode) {
						particle.parentNode.removeChild(particle);
					}
				};
			}
			// 添加到全局CSS
			if (!document.querySelector('#explosion-style')) {
				const style = document.createElement('style');
				style.id = 'explosion-style';
				style.textContent = `
								@keyframes explosionPulse {
									0% { transform: translateX(-50%) scale(0); opacity: 0; }
									50% { transform: translateX(-50%) scale(1.2); opacity: 1; }
									100% { transform: translateX(-50%) scale(1); opacity: 0; }
								}
		    
								.explosion-wave {
									position: absolute;
									width: 80px;
									height: 80px;
									border-radius: 50%;
									border: 4px solid #ff4400;
									opacity: 0;
									left: 50%;
									top: 50%;
									transform: translate(-50%, -50%);
									animation: explosionPulse 0.6s ease-out;
								}
							`;
				document.head.appendChild(style);
			}
		}
	 */
	playEffectOL() {
		let targets = [this]
		let func = () => { };
		const args = Array.from(arguments);
		for (const arg of args) {
			if (typeof arg === 'function') {
				func = arg;
			} else if (get.itemtype(arg) == "players") {
				targets = targets.concat(arg)
			} else if (get.itemtype(arg) == "player") {
				targets.push(arg)
			}
		}
		game.broadcastAll((func, targets) => {
			func(...targets.flat());
		}, func, targets);
	},
	//联机切换bgm(持续时间到特定游戏时机或玩家死亡)
	addTempBgmOL(path, expire) {
		const player = this;
		//path例："ext:一中杀/audio/End Like This.mp3"
		game.broadcastAll((path) => {
			_status.tempMusic = path;
			game.playBackgroundMusic();
		}, path);
		player.addTempSkill("removeBgmOL", expire)
		player.setStorage("removeBgmOL", path);
	},
	//联机切换背景图片(持续时间到特定游戏时机)
	addTempBackGroundOL(path, zIndex = "0", expire) {
		const player = this;
		var imagePath = lib.assetURL + path;//例："/extension/一中杀/image/background/BitetheDust_yzs.gif"
		// 创建一个唯一的ID来标识这个背景
		var id = Math.random().toString(36).slice(-8);

		// 2. 广播创建图片
		game.broadcastAll((imagePath, zIndex, id) => {
			var img = document.createElement("img");
			img.id = id; // 给图片加上唯一标识
			img.src = imagePath;
			img.style.position = "fixed";
			img.style.left = "0";
			img.style.top = "0";
			img.style.width = "100%";
			img.style.height = "100%";
			img.style.objectFit = "cover";
			img.style.zIndex = zIndex;
			img.style.opacity = 0;
			img.style.pointerEvents = "none";
			img.style.transition = "opacity 0.5s ease-out";
			document.body.appendChild(img);
			setTimeout(() => {
				img.style.opacity = "1";
			}, 50);
		}, imagePath, zIndex, id);

		// 3. 将 ID 存入 player 的 storage 供后续调用
		player.setStorage("removeBackGroundOL", id);
		player.addTempSkill("removeBackGroundOL", expire);
	},
	//联机更换武将图
	changeAvatarImageOL(path) {
		game.broadcastAll(function (current, path) {
			if (current.node.avatar) current.node.avatar.setBackgroundImage(path); //例："extension/一中杀/image/Unbelieve_xiangzi_yzs.png"
		}, this, path)
	},
	//联机放大缩小武将框(如果游戏总人数发生变化例如召唤的话，会变回原大小)
	scaleOL(scale = 1.0) {
		game.broadcastAll(async function (current, scale) {
			let numberOfPlayers = ui.arena.dataset.number;
			const playerPositions = ui.playerPositions;
			//单个人物的宽度，这里要设置玩家的实际的宽度
			const temporaryPlayer = ui.create.div(".player", ui.arena).hide();
			const computedStyle = getComputedStyle(temporaryPlayer);
			//玩家顶部距离父容器上边缘的距离偏移的单位距离
			const quarterHeight = (parseFloat(computedStyle.height) / 4) * scale;
			const halfWidth = parseFloat(computedStyle.width) / 2;
			temporaryPlayer.remove();
			//列数，即假如8人场，除去自己后，上面7个人占7列
			const columnCount = numberOfPlayers - 1;
			const percentage = 90 / (columnCount - 1);

			const players2 = game.players.concat(game.dead);
			let position = parseInt(current.dataset.position);
			playerPositions.forEach(pos => {
				if (pos == position) game.dynamicStyle.remove(pos);
			});
			if (position == 0) {
				const selector = `#arena[data-number='${ui.arena.dataset.number}']>.player[data-position='${position}']`;
				game.dynamicStyle.add(selector, {
					transform: `scale(${scale})`,
				});
				return;
			}
			players2.forEach((value) => {
				if (value.dataset.position == 0) return;
				const reversedOrdinal = columnCount - value.dataset.position;
				//动态计算玩家的top属性，实现拱桥的效果；只让两边的各两个人向下偏移一些
				const top = Math.max(0, Math.round(ui.arena.dataset.number / 5) - Math.min(Math.abs(value.dataset.position - 1), Math.abs(reversedOrdinal))) * quarterHeight;
				const selector = `#arena[data-number='${ui.arena.dataset.number}']>.player[data-position='${value.dataset.position}']`;
				if (parseInt(value.dataset.position) == position) {
					game.dynamicStyle.add(selector, {
						left: `calc(${percentage * reversedOrdinal + 5}% - ${halfWidth}px)`,
						top: `${top}px`,
						transform: `scale(${scale})`,
					});
				}
			})
		}, this, scale)
	},
	/**
	 * 创建事件函数示例
	 * 发动一次【苦肉】并将摸的牌作为返回值
	 */
	useKurou() {
		const next = game.createEvent("kurou", false);
		next.player = this;
		next.setContent("useKurouContent");
		return next;
	},

	//buff相关函数
	/*获取是否持有某个buff
		传入string类型时，获取持有该名称的buff
		传入function类型时，获取持有的符合func条件的buff
		默认为获取持有任意buff
	*/
	hasCyBuff(func = lib.filter.all) {
		if (typeof func == "string") {
			return this.getCyBuffNum(func) > 0;
		}
		if (typeof func != "function") {
			func = lib.filter.all;
		}
		this.cyBuffs ??= {};
		if (!Object.keys(this.cyBuffs)?.length) {
			return false;
		}
		return Object.keys(this.cyBuffs).some(func);
	},
	/*获取buff层数上限，形如player.getCyBuffLimit('cybuff_yanfan');
		输入值name必选，是buff的id
		除非你确定你清楚你在做什么，否则此函数不应被修改
		以下是一个更改层数上限的实例：令燕返buff的上限+2
		mod:{
			maxCyBuffLimit:function(player,name,num){
				if(name=='cybuff_yanfan') return num+2;
			}
		},
	*/
	getCyBuffLimit(name) {
		if (!name.startsWith("cybuff_")) {
			name = `cybuff_${name}`;
		}
		let num = lib.cybuff?.[name]?.buffLimit || 0;
		num = game.checkMod(this, name, num, "maxCyBuffLimit", this);
		return Math.max(0, num);
	},
	/*获取现有buff层数
		输入值name必选
	*/
	getCyBuffNum(name) {
		this.cyBuffs ??= {};
		if (!name.startsWith("cybuff_")) {
			name = `cybuff_${name}`;
		}
		return this.cyBuffs[name] ?? 0;
	},
	/*附加指定buff，形如player.addCyBuff('cybuff_yanfan',1);
		输入值有两个，顺序不可变更：
		buff名name，必选，要求输入的是buff对应的技能名，如cybuff_qishi或qishi
		数量num，非必选，无输入时默认是1
	*/
	addCyBuff(name, num = 1, log = true) {
		if (!num) num = 1;
		this.cyBuffs ??= {};
		if (!name.startsWith("cybuff_")) {
			name = `cybuff_${name}`;
		}
		this.cyBuffs[name] ??= 0;
		const addNum = Math.min(this.getCyBuffLimit(name) - this.getCyBuffNum(name), num);
		//在该函数中，由于设置了false，所以不存在常规的4个时机，仅该函数时机本身
		const next = game.createEvent("addCyBuff", false);
		next.player = this;
		next.cyBuff = name;
		next.num = addNum;
		next.log = log;
		if (addNum > 0 && this.canAddCyBuff(name)) {
			next.setContent("addCyBuff");
		} else {
			next.setContent(async (event) => {
				await event.trigger("addCyBuffExcluded");
			});
		}
		return next;
	},
	/*移除指定buff，形如player.removeCyBuff('cybuff_yanfan','all');
		输入值有两个，顺序不可变更：
		name:buff名，必选，要求输入的是buff对应的技能名，如cybuff_qishi或qishi
		num:数量，非必选，无输入时默认是1，一般输入数字，特别地，如果输入的是字符串'all'，会清空这个buff的层数
		type:移除类型，默认为default
	*/
	removeCyBuff(name, num = 1, type = "default", log = true) {
		this.cyBuffs ??= {};
		if (!name.startsWith("cybuff_")) {
			name = `cybuff_${name}`;
		}
		this.cyBuffs[name] ??= 0;
		const removeNum = num == "all" ? this.getCyBuffNum(name) : Math.min(num, this.getCyBuffNum(name));
		const next = game.createEvent("removeCyBuff", false);
		next.player = this;
		next.cyBuff = name;
		next.num = removeNum;
		next.type = type;
		next.log = log;
		if (removeNum >= this.getCyBuffNum(name)) {
			next.allRemove = true;
		}
		if (removeNum > 0 && this.canRemoveCyBuff(name, type)) {
			next.setContent("removeCyBuff");
		} else {
			next.setContent(async (event) => {
				await event.trigger("removeCyBuffExcluded");
			});
		}
		return next;
	},
	/*自然流失buff
		默认使所有可自然流失的buff流失层数
		填入name仅流失指定buff
		可自然流失的buff须持有dampingLose属性
		dampingLose: true //流失所有buff
		dampingLose: 2 //流失2层buff
		dampingLose:(player) => player.hp //流失体力值层buff
	*/
	dampingCyBuff(name = "all") {
		this.cyBuffs ??= {};
		if (!name.startsWith("cybuff_")) {
			name = `cybuff_${name}`;
		}
		const list = [];
		for (const cyBuff in this.cyBuffs) {
			if (name != "all" && name != cyBuff) {
				continue;
			}
			const info = lib.cybuff[cyBuff];
			if (info?.dampingLose) {
				let num = this.getCyBuffLimit(cyBuff);
				if (typeof info.dampingLose == "number") {
					num = info.dampingLose;
				} else if (typeof info.dampingLose == "function") {
					num = info.dampingLose(player);
				}
				if (num > 0) {
					list.add([cyBuff, num]);
				}
			}
		}
		const next = game.createEvent("dampingCyBuff", false);
		next.player = this;
		next.dampingList =  list;
		next.cyBuffs = list.map(i => i[0]);
		next.setContent("dampingCyBuff");
		return next;
	},
	//刷新buff的显示
	refreshBuff() {
		this.cyBuffs ??= {};
		game.broadcastAll((player, list) => player.cyBuffs = list, this, this.cyBuffs);
		if (Object.keys(this.cyBuffs)?.some(cybuff => this.cyBuffs[cybuff])) {
			this.markSkill("cybuff_show");
		} else {
			this.unmarkSkill("cybuff_show");
		}
		return this;
	},
	/*检测能否添加buff
		name:即将添加的buff名
		type:此次添加buff的类型，默认为default
		
		eg:无法添加buff[cybuff_yanfan]
		mod: {
			canAddCyBuff(player, name, type) {
				if (name == "cybuff_yanfan") {
					return false;
				}
			},
		},
	*/
	canAddCyBuff(name, type = "default") {
		let result = true;
		result = game.checkMod(this, name, type, result, "canAddCyBuff", this);
		return !!result;
	},
	/*检测能否失去buff
		name:即将失去的buff名
		type:此次添加buff的类型，默认为default，[natural自然失去, default默认失去, special特殊失去]
		
		eg:仅能以默认方式失去buff[cybuff_yanfan]
		mod: {
			canRemoveCyBuff(player, name, type) {
				if (name == "cybuff_yanfan" && type != "default") {
					return false;
				}
			},
		},
	*/
	canRemoveCyBuff(name, type = "default") {
		let result = true;
		result = game.checkMod(this, name, type, result, "canRemoveCyBuff", this);
		return !!result;
	},
	/*净化
		使指定debuff减少指定层数
		num：减少debuff层数，填入all则为全部净化
		name：要减少的debuff，默认为all净化全部debuff
	*/
	clearCyBuff(num = 1, name = "all") {
		return this.purgeCyBuff(num, name, "debuff");
	},
	/*驱散
		使指定buff减少指定层数
		num：减少buff层数，填入all则为全部驱散
		name：要减少的buff，默认为all驱散全部buff
	*/
	cutCyBuff(num = 1, name = "all") {
		return this.purgeCyBuff(num, name, "buff");
	},
	/*清除
		使指定buff和debuff减少指定层数
		num：减少buff层数，填入all则为全部清除
		name：要减少的buff，默认为all清除全部buff
			可填入"type:xxx"来清除具有buff标签xxx的所有buff eg: player.purgeCyBuff(1, "type:increase") 令所有增益类buff减少一层
			也可填入"type:xxx|yyy"来同时清除具有xxx和yyy任意一个buff标签的所有技能
	*/
	purgeCyBuff(num = 1, name = "all", type = "all") {
		this.cyBuffs ??= {};
		let fromType;
		if (name.startsWith("type:")) {
			name = name.slice(5).split("|");
			fromType = true;
		} else if (name != "all") {
			if (!Array.isArray(name)) {
				name = [name];
			}
			for (let i = 0; i < name.length; i++) {
				if (!name[i].startsWith("cybuff_")) {
					name[i] = `cybuff_${name[i]}`;
				}
			}
		}
		const list = [];
		for (const cyBuff in this.cyBuffs) {
			if (fromType) {
				if (!get.buffType(cyBuff, true).containsSome(...name)) {
					continue;
				}
			} else {
				if (name != "all" && !name.includes(cyBuff)) {
					continue;
				}
			}
			if (type != "all" && get.buffType(cyBuff) != type) {
				continue;
			}
			num = num === "all" ? this.getCyBuffLimit(cyBuff) : num;
			if (num > 0) {
				list.add([cyBuff, num]);
			}
		}
		const next = game.createEvent("purgeCyBuff", false);
		next.player = this;
		next.clearList =  list;
		next.type = type;
		next.cyBuffs = list.map(i => i[0]);
		next.setContent("purgeCyBuff");
		return next;
	},
	/*获得随机一项buff
		list: 可随机的buff列表
		num：默认为1，获得的buff层数，可传入function函数来实现不同buff不同层数
			eg：player.addRandomCyBuff(["cybuff_shufu", "cybuff_kongju"], name => name == "cybuff_shufu" ? 2 : 1)
				随机获得两层束缚或一层恐惧
		ignore：默认为true，若填入false，则在随机时不会排除已达上限的buff
	*/
	addRandomCyBuff(list = [], num = 1, ignore = true) {
		if (ignore !== false) {
			list = list.filter(name => {
				return this.getCyBuffLimit(name) > this.getCyBuffNum(name);
			});
		}
		if (!list.length) {
			return;
		}
		const name = list.randomGet(),
			numx = typeof num == "function" ? num(name) : num;
		return this.addCyBuff(name, numx);
	},

	//-----------元气------------//
	//元气函数，该部分由《太古天庭》作者“沐如风晨”完成
	//获得元气
	addCyyuanqi(num, source) {
		var player = this;
		var next = game.createEvent("addCyyuanqi");
		//player
		next.player = this;
		//num
		if (typeof num == "number") {
			if (num <= 0) next.num = 0;
			next.num = num;
		} else next.num = 1;
		//source
		if (typeof source == "string") {
			if (source != "nosource") next.source = player;
			else next.source = undefined;
		} else {
			if (source != undefined) next.source = source;
			else next.source = player;
		}
		//content
		next.setContent("addCyyuanqi");
		return next;
	},
	//扣除元气
	loseCyyuanqi(num, source) {
		var player = this;
		var next = game.createEvent("loseCyyuanqi");
		//player
		next.player = this;
		//num
		if (typeof num == "number") {
			if (num <= 0) next.num = 0;
			else next.num = num;
		} else next.num = 1;
		//source
		if (typeof source == "string") {
			if (source != "nosource") next.source = player;
			else next.source = undefined;
		} else {
			if (source != undefined) next.source = source;
			else next.source = player;
		}
		//content
		next.setContent("loseCyyuanqi");
		return next;
	},
	//读取目标元气数量
	countCyyuanqi() {
		if (!this.storage.cy_yuanqi) return 0;
		return this.storage.cy_yuanqi;
	},

	//-----------吟唱------------//
	/*
	新增吟唱效果，形如player.setCountDown(num, command, prompt);
	输入值均为必选，顺序不可以调换：
	————————————
	也可直接传入{}类型，比如
	player.setCountDown({
		num: 2,
		command: {
			async todu(player) {
				await player.draw();
			},
			list: [player],
		},
		prompt: "摸一张牌",
		skill: "exampleSkill",
	});
	来添加一个持有自定义属性的咏唱，如item.skill == "exampleSkill"的咏唱
	————————————
	吟唱回合数num：必须是整数，当然不是也行，不过我不能保证会发生什么
	描述prompt：对于吟唱完毕的效果的简要描述，用于上面的技能的显示
	吟唱完毕后执行的命令command：形如{
		todo:function(xxx){yyy},
		list:[xxx],
	}
	todo是要执行的函数体，list是会用到的参数数组，后续会给出两个实例帮助理解
	描述prompt：对于吟唱完毕的效果的简要描述，用于上面的技能的显示，方便随时观看正在进行的吟唱的效
	实例1：令玩家摸一张牌
	{
		todo:function(player){
			player.draw();//如果要使用player，一定要传参数传进来，不能直接调用，不可以用this，但是可以用_status.event.player
		},
		list:[player],//注意：即使todo没有任何需要的参数，这里也必须写成空数组，不能不写或者undefined
	}
	实例2：预先指定的角色A弃置预先指定的角色B一定量的牌
	{
		todo:function(target1,target2,num){
			target1.discardPlayerCard(target2,num,true);
		}
		list:[xxx,yyy,2];//list里面的参数顺序必须严格对应function里面的形参
	
	值得注意的是，这个函数是有返回值的，返回值是这样的形式：{
		num:1,
		command:{
			todo:function(xxx){yyy},
			list:[xxx],
		},
		prompt:"zzz",
	}
	如果你想要单独加速某一个吟唱效果，建议你记录此吟唱效果的返回值，后续会提到
	当然你不记录也可以，所有进行中的吟唱被记录在数组player.cy_countDowns里面，你也可以检索所需要的
	*/
	//新增吟唱
	setCountDown(num, command, prompt, tag = []) {
		this.cy_countDowns ??= [];
		let id;
		if (!Array.isArray(tag)) {
			tag = [tag];
		}
		let item = arguments.length == 1 ? num : {
			num: num,
			command: command,
			prompt: prompt,
			tag: tag,
		};
		for (let i = 0; i < tag.length; i++) {
			if (typeof tag == "string" && tag.indexOf(":") >= 0) {
				const [key, value] = tag.split(":");
				item[key] = value;
			}
		}
		while (!id || this.cy_countDowns.some(count => count.id == id)) {
			id = Math.random().toString(36).slice(-8);
		}
		item.id = id;
		const next = game.createEvent("setCountDown");
		next.countDown = item;
		next.id = id;
		next.player = this;
		next.setContent(async (event, trigger, player) => {
			const { countDown } = event;
			player.cy_countDowns.push(countDown);
			player.refreshCountDown();
		});
		return next;
	},
	/*
	用于更新吟唱剩余回合数的函数，形如player.updateCountDown();
	输入值link不是必选，无输入的情况下默认更新所有的吟唱效果
	第二个输入值count用于判定要减少的回合数
	有输入值的情况下只更新对应的吟唱效果，输入值为需要更新咏唱的id，或输入一个function方法来更新符合条件的咏唱
	如果你前面记录了setCountDown函数的返回值，你可以直接作为参数使用
	*/
	//更新吟唱剩余回合数
	async updateCountDown(link, count = 1) {
		const player = this;
		if (Array.isArray(link)) {
			for (const item of link) {
				await this.updateCountDown(item, count);
			}
			return;
		}
		player.cy_countDowns ??= [];
		if (player.cy_countDowns.length) {
			await game.doAsyncInOrder(player.cy_countDowns, async item => {
				if (link) {
					if (typeof link == "number" && item.id != link) {
						return;
					} else if (typeof link == "function" && !link(item)) {
						return;
					} else if (link != item) {
						return;
					}
				}
				if (count === "all") {
					count = item.num;
				}
				if (typeof count !== "number") {
					count = 1;
				}
				count = Math.min(item.num, count);
				const next = game.createEvent("updateCountDown");
				next.countDown = item;
				next.player = this;
				next.num = count;
				next.setContent(async (event, trigger, player) => {
					const { countDown, num } = event;
					countDown.num -= num;
					event.set("finalNum", countDown.num);
					player.refreshCountDown();
				});
				await next;
			}, () => 1);
		}
		const list = player.cy_countDowns.filter(item => item.num <= 0);
		if (list.length) {
			await game.doAsyncInOrder(list, async item => {
				await player.executeCountDown(item);
			}, () => 1);
		}
	},
	//清除吟唱效果
	async clearCountDown(link) {
		if (Array.isArray(link)) {
			for (const item of link) {
				await this.clearCountDown(item);
			}
			return;
		}
		const next = game.createEvent("clearCountDown");
		next.countDown = link;
		next.player = this;
		next.setContent(async (event, trigger, player) => {
			const { countDown } = event;
			player.cy_countDowns.remove(countDown);
			player.refreshCountDown();
		});
		return next;
	},
	/*
	执行对应的吟唱效果
	除非你确定你清楚你在做什么，否则此函数不应被修改或调用
	*/
	//执行吟唱效果
	executeCountDown(link) {
		const next = game.createEvent("executeCountDown");
		next.countDown = link;
		next.player = this;
		next.setContent(async (event, trigger, player) => {
			const { countDown: link } = event;
			try {
				let str = `执行了咏唱`;
				if ("name" in link) {
					str = `${str}<span style='color: #dc13ea'>${link.name}</span>`;
				}
				game.log(player, str, `：${link.prompt}`);
				if (link.repeatNum) {
					link.num = link.repeatNum;
				} else {
					await player.clearCountDown(link);
				}
				const result = link.command.todo(...link.command.list);
				if (result instanceof Promise) {
					await result;
				}
			} catch (error) {
				console.error("Error:", error);
			}
		});
		return next;
	},
	//刷新吟唱标记
	refreshCountDown() {
		this.cy_countDowns ??= [];
		game.broadcastAll((player, list) => player.cy_countDowns = list, this, this.cy_countDowns);
		if (this.cy_countDowns.length) {
			this.markSkill("cy_countDown");
		} else {
			this.unmarkSkill("cy_countDown");
		}
		return this;
	},
	/*判断是否持有咏唱
		传入function方法来判断是否持有符合条件的咏唱
		eg:持有tag包含"refresh"的咏唱
		player.hasCountDown(item => item?.tag?.includes("refresh"));
	*/
	hasCountDown(func = lib.filter.all) {
		this.cy_countDowns ??= [];
		if (typeof func == "string") {
			func = item => item?.tag?.includes(func);
		}
		return this.cy_countDowns.some(func);
	},
	getCountDown(func = lib.filter.all) {
		this.cy_countDowns ??= [];
		if (typeof func == "string") {
			func = item => item?.tag?.includes(func);
		}
		return this.cy_countDowns.filter(func);
	},

	//-----------蓄势------------//
	/*
		新增蓄势效果，形如player.setGathering(num, command, prompt);
		格式与吟唱基本一致
	*/
	//新增蓄势
	setGathering(num, command, prompt, tag = []) {
		this.cy_Gatherings ??= [];
		let item = arguments.length == 1 ? num : {
			num: num,
			command: command,
			prompt: prompt,
			tag: Array.isArray(tag) ? tag : [tag],
		};
		let id;
		while (!id || this.cy_Gatherings.some(count => count.id == id)) {
			id = Math.random().toString(36).slice(-8);
		}
		item.id = id;
		this.cy_Gatherings.push(item);
		this.refreshGathering();
		return item;
	},
	//更新蓄势剩余牌数
	updateGathering(link) {
		this.cy_Gatherings ??= [];
		for (let i = 0; i < this.cy_Gatherings.length; i++) {
			const item = this.cy_Gatherings[i];
			if (link) {
				if (typeof link == "number" && item.id != link) {
					continue;
				} else if (typeof link == "function" && !link(item)) {
					continue;
				} else if (link != item) {
					continue;
				}
			}
			item.num--;
			if (item.num <= 0) {
				this.executeGathering(item);
				this.cy_Gatherings.splice(i, 1);
				i--;
			}
			this.refreshGathering();
		}
	},
	//执行蓄势效果
	executeGathering(link) {
		const next = game.createEvent("executeGathering");
		next.countDown = link;
		next.player = this;
		next.setContent(async (event, trigger, player) => {
			const { countDown: link } = event;
			try {
				const result = link.command.todo(...link.command.list);
				if (result instanceof Promise) {
					await result;
				}
			} catch (error) {
				console.error("Error:", error);
			}
		});
		return next;
	},
	//刷新蓄势标记
	refreshGathering() {
		this.cy_Gatherings ??= [];
		game.broadcastAll((player, list) => player.cy_Gatherings = list, this, this.cy_Gatherings);
		if (this.cy_Gatherings.length) {
			this.markSkill("cy_Gathering");
		} else {
			this.unmarkSkill("cy_Gathering");
		}
		return this;
	},
	/*判断是否持有蓄势
		传入function方法来判断是否持有符合条件的蓄势
		eg:持有tag包含"refresh"的蓄势
		player.hasGathering(item => item?.tag?.includes("refresh"));
	*/
	hasGathering(func = lib.filter.all) {
		this.cy_Gatherings ??= [];
		return this.cy_Gatherings.some(func);
	},
	
	//-----------通灵召唤------------//
	//通灵召唤，来自于《太古天体》扩展，感谢作者“沐如风晨”
	tgtt_dytonglingzhaohuanInit(name) {
		if (!name || !get.character(name)) {
			console.warn("传的什么牛魔");
			return;
		}
		const next = game.createEvent("tgtt_dytonglingzhaohuanInit");
		next.player = this;
		next.CharacterName = name;
		next.setContent("tgtt_dytonglingzhaohuanInit");
		return next;
	},
});

//添加事件函数
Object.assign(lib.element.content, {
	/**
	 * 创建事件函数示例
	 * 发动一次【苦肉】并将摸的牌作为返回值
	 */
	async useKurouContent(event, trigger, player) {
		await player.loseHp();
		event.result = await player.draw(2).forResult();
	},

	//-----------BUFF------------//
	//获得buff
	async addCyBuff(event, trigger, player) {
		const { num, cyBuff, log } = event;
		player.cyBuffs[cyBuff] += num;
		game.broadcast((player, cyBuffs) => player.cyBuffs = cyBuffs, player, player.cyBuffs);
		player.refreshBuff();
		player.addSkill(cyBuff);
		if (log === true) {
			game.log(player, `获得了${num}层`, `#g【${get.translation(cyBuff)}】`);
		} else if (typeof log == "function"){
			log(num, cyBuff);
		}
		await event.trigger(event.name);
	},
	//失去buff
	async removeCyBuff(event, trigger, player) {
		const { num, cyBuff, allRemove, type, log } = event;
		player.cyBuffs[cyBuff] -= num;
		game.broadcast((player, cyBuffs) => player.cyBuffs = cyBuffs, player, player.cyBuffs);
		player.refreshBuff();
		let str = `${num}层`;
		if (allRemove) {
			player.removeSkill(cyBuff);
			str = "全部";
		}
		if (log === true) {
			game.log(player, `消耗了${str}`, `#g【${get.translation(cyBuff)}】`);
		} else if (typeof log == "function"){
			log(str, cyBuff);
		}
		await event.trigger(event.name);
	},
	//流失buff
	async dampingCyBuff(event, trigger, player) {
		const { dampingList: list, cyBuffs } = event;
		for (let info of list) {
			await player.removeCyBuff(info[0], info[1], "natural", (str, cyBuff) => {
				game.log(player, `流失了${str}`, `#g【${get.translation(cyBuff)}】`);
			});
		}
	},
	//清除buff
	async purgeCyBuff(event, trigger, player) {
		const { clearList: list, cyBuffs, type } = event;
		const method = {
			all: "清除",
			debuff: "净化",
			buff: "削强",
		}[type];
		for (let info of list) {
			await player.removeCyBuff(info[0], info[1], null, (str, cyBuff) => {
				game.log(player, `${method}了${str}`, `#g【${get.translation(cyBuff)}】`);
			});
		}
	},

	//-----------元气------------//
	//元气函数，该部分由《太古天庭》作者“沐如风晨”完成
	//获得元气
	addCyyuanqi() {
		"step 0";
		if (!player.storage.cy_yuanqi) player.storage.cy_yuanqi = 0;
		if (player.storage.cy_yuanqi >= 5) event.finish();
		("step 1");
		if (event.num <= 0) return;
		//元气上限为5，非常暴力的写法~
		if (5 - player.storage.cy_yuanqi <= 0) event.finish();
		if (event.num >= 5 - player.storage.cy_yuanqi) event.num = 5 - player.storage.cy_yuanqi;
		player.storage.cy_yuanqi += event.num;
		player.markSkill("cy_yuanqi");
		event.trigger("addCyyuanqi");
		game.log(player, "获得了", event.num, "<font color='orange'>元气</font>");
		player.syncStorage("cy_yuanqi");
	},
	//扣除元气
	loseCyyuanqi() {
		"step 0";
		if (!player.storage.cy_yuanqi || player.storage.cy_yuanqi <= 0) event.finish();
		("step 1");
		if (event.num <= 0) return;
		if (event.num > player.storage.cy_yuanqi) event.num = player.storage.cy_yuanqi;
		player.storage.cy_yuanqi -= event.num;
		if (player.storage.cy_yuanqi == 0) player.unmarkSkill("cy_yuanqi");
		event.trigger("loseCyyuanqi");
		game.log(player, "扣除了", event.num, "<font color='orange'>元气</font>");
		player.syncStorage("cy_yuanqi");
	},
	//-----------通灵召唤------------//
	//通灵召唤，来自于《太古天体》扩展，感谢作者“沐如风晨”（该代码由萌佬完成）
	async tgtt_dytonglingzhaohuanInit(event, trigger, player) {
		const name = event.CharacterName;
		if (player.tgtt_dytonglingzhaohuan_fellow) {
			const fellow = player.tgtt_dytonglingzhaohuan_fellow;
			player.line(fellow);
			const result = fellow.name2 ? await player.chooseControl(fellow.name1, fellow.name2).set("prompt", "请选择要更换的武将牌").forResult() : { control: fellow.name1 };
			if (result.control) fellow.reinit(result.control, name);
		} else {
			const targets = game.players.slice().concat(game.dead);
			for (const i of targets) {
				if (parseInt(i.dataset.position) !== 0) {
					i.dataset.position = parseFloat(parseInt(i.dataset.position) + 1);
				}
			}
			ui.arena.setNumber(targets.length + 1);
			const fellow = game.addFellow(parseInt(player.dataset.position) + 1, name);
			fellow.gain(get.cards(4));
			//*fellow.identity = (() => {
			//if (get.zhu(player) === player && player.identity.startsWith("zhu")) return "zhong" + player.identity.slice(3);
			//return player.identity;
			//})();
			fellow.tgtt_dytonglingzhaohuan_master = player;
			player.tgtt_dytonglingzhaohuan_fellow = fellow;
			player.addSkill("tgtt_dytonglingzhaohuan_fellow");
			fellow.addSkill("tgtt_dytonglingzhaohuan_master");
			fellow.addSkill("tgtt_dytonglingzhaohuan_kongzhi");
			fellow.addSkill("tgtt_dytonglingzhaohuan_identity");
			fellow.markSkillCharacter("tgtt_dytonglingzhaohuan_master", player, "通灵召唤", "由" + get.translation(player) + "召唤");
			//if (player == game.me) {
			//fellow.setIdentity(fellow.identity);
			//fellow.node.identity.classList.remove("guessing");
			//fellow.fanfixed = true;
			//}
		}
		if (get.mode() == "guozhan") {
			player.tgtt_dytonglingzhaohuan_fellow.changeCharacter([player.tgtt_dytonglingzhaohuan_fellow.name, "tgtt_jzunknown"]);
		}
		event.trigger("Tonglingzhaohuan");
	},
});

//添加card方法
Object.assign(lib.element.Card.prototype, {});

//添加get方法
Object.assign(get, {
	/*获取buff收益
		①buff默认收益写法为：
			cybuff_xxx: {
				buffEffect(target, player) {
					return target.hp;
				},
			}
		表示player视角下cybuff_xxx对target的默认收益为[target的体力值]
		
		②上述计算完后的值乘以“player对target态度值的符号（1, 0, -1）”，得到常态返回值
		
		③手动调整buff收益使用playerBuffValue和targetBuffValue的mod

				playerBuffValue表示玩家视角下[buff]对指定角色[target]的收益，参数为buff名[name], 视角角色[player], 指定目标[target], 初始收益[eff]
				playerBuffValue(name, player, target, eff)

				targetBuffValue表示指定角色[target]视角下[buff]对玩家[player]的收益，参数为buff名[name], 指定目标[player], 视角角色[target], 初始收益[eff]
				targetBuffValue(name, player, target, eff)

				当player == target时，上述两个mod实际上效果是一致的
				一个是你的视角看任意角色
				一个是任意角色的视角看你

			skill_xxx: {
				mod: {
					playerBuffValue(name, target, eff) {
						if (target.hasSex("male")) {
							return eff + 1;
						}
					},
				},
			},
			表示玩家视角下所有buff对男性角色的收益+1

		eg：持有skill_xxx的角色眼里cybuff_xxx的返回值：
			3血男队友：4;
			4血女队友：4;
			4血男敌方：-3;
			3血女敌方：-3;
			4血男未知身份: 1;

		填入数组则获取平均收益
	*/
	buffValue(name, target, viewer) {
		if (Array.isArray(name)) {
			let eff = name.reduce((sum, buff) => sum + get.buffValue(buff, target, viewer), 0);
			return eff / name.length;
		}
		if (!viewer) {
			viewer = target;
		}
		if (!name.startsWith("cybuff_")) {
			name = `cybuff_${name}`;
		}
		const info = get.info(name);
		if (!info?.buffEffect) {
			return 0;
		}
		if (target.getCyBuffLimit(name) <= target.getCyBuffNum(name)) {
			return 0;
		}
		let eff = 0;
		if (typeof info.buffEffect == "function") {
			eff = info.buffEffect(target, viewer);
		} else if (typeof info.buffEffect == "number") {
			eff = info.buffEffect;
		} else {
			return eff;
		}
		eff = game.checkMod(name, viewer, target, eff, "playerBuffValue", viewer);
		eff = game.checkMod(name, target, viewer, eff, "targetBuffValue", target);
		eff *= get.sgnAttitude(viewer, target);
		return eff;
	},
	//获取buff类型
	//默认返回值为buff[name]持有的info.buffType的键值，一般为buff和debuff
	//填入第二个参数true获取子类别，既info.subBuffTypes的键值，比如增益[increase]，异常[abnormal]；返回值为数组
	/*eg:
		cybuff_xxx: {
			buffType: "buff",
			subBuffTypes: "increase",
		},

		get.buffType("xxx") = "buff";
		get.buffType("xxx", true) = ["increase"];
	*/
	buffType(name, type) {
		if (!name.startsWith("cybuff_")) {
			name = `cybuff_${name}`;
		}
		const info = get.info(name);
		if (!info) {
			return null;
		}
		if (type === true) {
			let subs = info.subBuffTypes;
			if (!Array.isArray(subs)) {
				subs = [subs];
			}
			return subs;
		}
		return info.buffType;
	},
	//获取吟唱收益
	cdValue(item, player) {
		player ??= get.player();
		if ("value" in item) {
			return item.value(item, player);
		}
		return 1;
	},
});

//添加game方法
Object.assign(game, {
	//联机播放BGM(默认不循环)
	playBgmOL(path, loop = false) {
		//path例："ext:一中杀/audio/Zoltraak.mp3"
		if (!loop) {
			game.broadcastAll((path) => {
				_status.tempMusic = path;
				game.playBackgroundMusic();
			}, path);
			return;
		}
		game.broadcastAll((path) => {
			_status.tempMusic = path;
			game.playBackgroundMusic();
			ui.backgroundMusic.addEventListener('ended', () => {
				delete _status.tempMusic;
				game.playBackgroundMusic();
			}, { once: true });
		}, path);
	},
	//联机播放图片，允许图片从屏幕外移入
	playImageOL(path, zIndex = "0", duration = 0, pos) {
		// 预处理 pos
		if (pos && !Array.isArray(pos)) {
			pos = [pos];
		}
		// 简单过滤对向冲突
		if (pos && pos.length >= 2) {
			if ((pos.contains('left') && pos.contains('right')) || (pos.contains('up') && pos.contains('down'))) {
				pos = null;
			}
		}

		game.broadcastAll((path, duration, zIndex, pos) => {
			var imagePath = lib.assetURL + path;
			var img = document.createElement("img");
			img.src = imagePath;
			img.style.position = "fixed";
			img.style.left = "20";
			img.style.top = "30";
			img.style.width = "70vw";
			img.style.height = "80vh";
			img.style.objectFit = "cover";
			img.style.zIndex = zIndex;
			img.style.pointerEvents = "none";

			// 1. 设置初始透明度为0
			img.style.opacity = "0";

			// 2. 根据 pos 设置初始位移（在屏幕外）
			if (pos) {
				var tx = 0, ty = 0;
				if (pos.contains("left")) tx = -100;
				if (pos.contains("right")) tx = 100;
				if (pos.contains("up")) ty = -100;
				if (pos.contains("down")) ty = 100;
				img.style.transform = `translate(${tx}%, ${ty}%)`;
			}

			document.body.appendChild(img);

			// 【关键步骤】强制浏览器重绘 (Read a layout property)
			// 这行代码让浏览器意识到图片当前在屏幕外且透明度为0
			img.offsetWidth;

			// 3. 设置过渡属性
			img.style.transition = "transform 0.5s ease-out, opacity 0.5s ease-out";

			// 4. 触发动画：回到原点并显示
			setTimeout(() => {
				img.style.opacity = "1";
			}, 50);
			if (pos) {
				img.style.transform = "translate(0, 0)";
			}

			if (!duration) return;
			setTimeout(function () {
				img.style.transition = "opacity 1s ease-out";
				img.style.opacity = 0;
				setTimeout(function () {
					if (img.parentNode) img.parentNode.removeChild(img);
				}, 1100);
			}, duration);
		}, path, duration, zIndex, pos);
	},
	//联机播放视频
	playVideoOL(path, zIndex = "9999", loop = false) {
		game.broadcastAll((path, zIndex, loop) => {
			var video = document.createElement("VIDEO");
			video.className = "anime";
			Object.assign(video, {
				src: lib.assetURL + path,//例："/extension/一中杀/image/background/SSF_Nightmare_yzs_start.MP4"
				autoplay: true,//准备就绪后自动播放
				loop: loop,//是否循环播放(默认只播放一次)
				muted: false,//是否静音
				preload: true,//是否提前加载
			})
			Object.assign(video.style, {
				position: "fixed",
				left: "0",
				top: "0",
				width: "100%",
				height: "100%",
				objectFit: "cover",
				minWidth: "100vw",
				minHeight: "100vh",
				opacity: "0",//透明度
				pointerEvents: "none",//不阻挡点击事件
				zIndex: zIndex,//图层默认为最上方
				transition: "opacity 0.5s ease-out",
			})
			if (!loop) {
				video.addEventListener("ended", () => {
					video.style.opacity = "0";
					setTimeout(() => {
						document.body.removeChild(video);
					}, 1000)//播放完毕1s后移除视频
				})
			}
			document.body.appendChild(video);
			setTimeout(() => {
				video.style.opacity = "1";
			}, 50)//50ms后设置视频为可见(防止未加载完毕导致闪屏)
		}, path, zIndex, loop);
	},
});
