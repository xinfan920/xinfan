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
			if(lib.config.extension_阴阳师杀_xinfan_Bgms == 1 && "qlwh" in lib.characterPack){
				var list = [
					"麟趾马蹄金","天球仪","天王石刻","铜壶滴漏"
				]
				var lu ="五花米线/audio/background/";
				var lu2 ="五花米线/skin/background/";
				var tu =".png";
			}else{
				var list = [
					"Broken Hero","fengmozhishi","huanshidejintou","huasiji","kongxiang","lidaozhige",
					"shenzhijiangzhi","weimingzhizui","xianyuezhixia","xingchenzhilv","xinshengqimian",
					"yanhuozhilv","huazuoqingyan","jingjimeigui","kugushizhang","luhaiweiwang","xueyu",
					"shayushenghua","zhanyushijiejintou"
				]
				var lu ="阴阳师杀/fenbao/yys/yinyue/";
				var lu2 ="阴阳师杀/fenbao/yys/beijing/";
				var tu =".jpg";
			}	
			var name = list.randomGet();
			game.broadcastAll(() => {
				ui.background.setBackgroundImage(`extension/${lu2}${name}${tu}`);
			});	
			game.playBgmOL(`ext:${lu}${name}.mp3`);
			if(lib.config.extension_阴阳师杀_xinfan_Bgm == 2){
				game.broadcastAll(() => {
				ui.backgroundMusic.addEventListener('ended', () => {
					var name = list.randomGet();	
					ui.background.setBackgroundImage(`extension/${lu2}${name}${tu}`);
        			_status.tempMusic = `ext:${lu}${name}.mp3`;
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
