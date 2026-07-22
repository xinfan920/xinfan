 import { lib, game, ui, get, ai, _status } from "../../../noname.js";

/** @type {Record<string, Skill>} */
const Bgms = {
	//背景音乐
	_Bgm: {
		priority: 20,
		ruleSkill: true,
		locked: true,
		forced: true,
		nopop:true,
		charlotte: true,
		trigger: {
			global: "phaseBefore",
			player: "enterGame",
		},
		filter: function (event, player) {
			if (lib.config.extension_阴阳师杀_xinfan_Bgm == 0 || player.getSeatNum() != 1) {
				return false;
			}
			return event.name != "phase" || game.phaseNumber == 0;
		},
		async content(event, trigger, player) {
			if(lib.config.extension_阴阳师杀_xinfan_Bgms == 0){
				var list = [
					"Broken Hero","fengmozhishi","huanshidejintou","huasiji","kongxiang","lidaozhige",
					"shenzhijiangzhi","weimingzhizui","xianyuezhixia","xingchenzhilv","xinshengqimian",
					"yanhuozhilv","huazuoqingyan","jingjimeigui","kugushizhang","luhaiweiwang","xueyu",
					"shayushenghua","zhanyushijiejintou"
				]
			}	
			var num = list.length;
			var num1 = Math.floor(Math.random() * num);	
			game.broadcastAll(() => {
				ui.background.setBackgroundImage(`extension/阴阳师杀/fenbao/yys/beijing/${list[num1]}.jpg`);
			});	
			game.playBgmOL(`ext:阴阳师杀/fenbao/yys/yinyue/${list[num1]}.mp3`);
			if(lib.config.extension_阴阳师杀_xinfan_Bgm == 2){
				game.broadcastAll(() => {
				ui.backgroundMusic.addEventListener('ended', () => {
					var num1 = Math.floor(Math.random() * num);	
					ui.background.setBackgroundImage(`extension/阴阳师杀/fenbao/yys/beijing/${list[num1]}.jpg`);
        			_status.tempMusic = `ext:阴阳师杀/fenbao/yys/yinyue/${list[num1]}.mp3`;
					game.playBackgroundMusic();
    			});
				});	
			}
		},
	},
};
game.broadcastAll(
	(Bgms) => {
		lib.Bgms = { ...Bgms };
	},
	Bgms,
);

Object.assign(lib.skill, { ...Bgms });

Object.assign(lib.translate, {
	_Bgm: "背景音乐",
	_Bgm_info:`游戏开始时，随机播放BGM`,
});
