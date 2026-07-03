import { lib, game, ui, get, ai, _status } from "../../../noname.js";

//全局技能需要以"_"开头才会加给所有角色

/** @type { importCharacterConfig["skill"] } */
const skills = {
	/**
	 * 全局技能示例
	 * 和config中的按钮相关，设置所有角色摸牌阶段额外摸牌数
	 */
	_exampleGlobalSkill: {
		trigger: {
			player: "phaseDrawBegin2",
		},
		filter(event, player) {
			const config = parseInt(lib.config.extension_恒宇苍穹神殿_hycq_example);
			return config > 0 && !event.numFixed;
		},
		async cost(event, trigger, player) {
			event.result = {
				bool: true,
				skill_popup: false,
			};
		},
		async content(event, trigger, player) {
			const config = parseInt(lib.config.extension_恒宇苍穹神殿_hycq_example);
			trigger.num += config > 0 ? config : 0;
		},
	},
		//毒
		_xinfan_du: {
		trigger: {
            player: "phaseBegin"
                        },
	    forced: true,
        filter(event, player) { 
           return event.player.countMark('xinfan_du') > 0;
        },

		async content(event, trigger, player) {
			trigger.player.removeMark('xinfan_du', 1); 
                    await trigger.player.loseHp();
		},
	},
	//时隙
	    _xinfan_shixi: {
        trigger: {
            global: "phaseBegin",
        },
		priority:15,
	    forced: true,
        filter(event, player) { 
           return event.skill == "xinfan_shixi";
        },
		async content(event, trigger, player) {
        trigger.player.addTempSkill('_xinfan_shixi_mark');
},
        subSkill: {
            mark: {
                mark: true,
                intro: {
                    content: '只有摸牌阶段和出牌阶段的回合',
                },
                charlotte: true,
            },
			 },
 },
	//永冻
		_xinfan_yongdong: {
		trigger: {
                           global: "phaseBegin"
                        },
		            	marktext: '永冻',
                         intro: {
                                   content: '下个回合开始时，跳过本回合并摸2张牌',
                                   name: '永冻',
                                 },
	     forced: true,
        filter(event, player) { 
           return event.player.countMark('_xinfan_yongdong') > 0;
        },

		async content(event, trigger, player) {
                await trigger.player.clearMark('_xinfan_yongdong');
                            trigger.player.draw(2);
                            trigger.cancel();
		},
	},
	/**
	 * 每轮限X次 的全局定义
	 * 使用方式：
	 * cyRoundLimit:2,每轮限2次
	 * 可以使用函数的形式，如果使用函数形式则参数与filter保持一致
	 */

	//联机切换bgm(持续时间到特定游戏时机或玩家死亡)
	removeBgmOL: {
		charlotte: true,
		forced: true,
		priority: 213412,
		forceDie: true,
		forceOut: true,
		popup: false,
		onremove(player) {
			if (_status.tempMusic != player.storage.removeBgmOL) return;
			game.broadcastAll(() => {
				delete _status.tempMusic;
				game.playBackgroundMusic();
			});
			delete player.storage.removeBgmOL;
			player.markSkill("removeBgmOL")
		},
		trigger: {
			player: "die"
		},
		filter(event, player) {
			return _status.tempMusic = player.storage.removeBgmOL;
		},
		async content(event, trigger, player) {
			game.broadcastAll(() => {
				delete _status.tempMusic;
				game.playBackgroundMusic();
			});
			delete player.storage.removeBgmOL;
			player.markSkill("removeBgmOL")
			player.removeSkill("removeBgmOL")
		}
	},
	//联机切换背景图片(持续时间到特定游戏时机)
	removeBackGroundOL: {
		charlotte: true,
		forced: true,
		forceDie: true,
		forceOut: true,
		priority: 213412,
		popup: false,
		onremove(player) {
			if (!player.storage.removeBackGroundOL) return;
			game.broadcastAll((id) => {
				var img = document.getElementById(id);
				if (img) {
					img.style.opacity = "0";
					setTimeout(() => {
						img.remove(); // 渐隐后移除
					}, 600);
				}
			}, player.storage.removeBackGroundOL);
			delete player.storage.removeBackGroundOL;
			player.markSkill("removeBackGroundOL")
		},
		trigger: {
			player: "die"
		},
		filter(event, player) {
			if (!player.storage.removeBackGroundOL) return false;
			return true
		},
		async content(event, trigger, player) {
			game.broadcastAll((id) => {
				var img = document.getElementById(id);
				if (img) {
					img.style.opacity = "0";
					setTimeout(() => {
						img.remove(); // 渐隐后移除
					}, 600);
				}
			}, player.storage.removeBackGroundOL);
			delete player.storage.removeBackGroundOL;
			player.markSkill("removeBackGroundOL")
			player.removeSkill("removeBackGroundOL")
		}
	},



};

Object.assign(lib.skill, skills);

//添加对应翻译
Object.assign(lib.translate, {
	_exampleGlobalSkill: "英姿",
	_exampleGlobalSkill_info: "摸牌阶段，额外摸牌。",

	_xinfan_du: "毒",
	_xinfan_du_info: "回合开始时，移去一枚并流失1点体力。",

	_xinfan_yongdong: "永冻",
	_xinfan_yongdong_info: "下一个回合开始时跳过本回合，并摸2张牌。",

	_xinfan_shixi: "时隙",
	_xinfan_shixi_info: "只有摸牌和出牌阶段的回合。",


});
