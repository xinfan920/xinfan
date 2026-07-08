 import { lib, game, ui, get, ai, _status } from "../../../noname.js";

/** @type {Record<string, Skill>} */
const Bgms = {
	//御魂
	_Bgm: {
		priority: 80,
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
			if (!lib.config.extension_阴阳师杀_xinfan_Bgm || player.getSeatNum() != 1) {
				return false;
			}
			return event.name != "phase" || game.phaseNumber == 0;
		},
		async content(event, trigger, player) {
			if(lib.config.extension_阴阳师杀_xinfan_zBgm){
				let list = [];
				for (let skill in lib.Bgms) {
					if (skill == event.name) continue;
					list.push([skill, lib.translate[skill]+"："+lib.translate[skill + "_info"]]);
				}
				if (!list.length) return;
				let result = await player.chooseButton([
					lib.translate["_Bgm_info"],
					[
						list,
						"textbutton",
					],
				])
					.set("forced", false)
					.set("selectButton", 1)
					.set("filterButton", function (button) {
						let player = _status.event.player
						return !player.hasSkill(button.link)
					})
					.set("ai", (button) => {
            	        return Math.random();;
					})
					.forResult();
				if (!result.bool) return
				player.useResult({ skill: result.links[0] }, event);
        	    game.log(player, "播放了", "【" + get.translation(result.links[0]) + "】");
			} else {
				let list = [];
				for (let skill in lib.Bgms) {
					if (skill == event.name) continue;
					list.push(skill);
				}
				if (!list.length) return;
				let num = game.countPlayer();
				while (num > 0) {
					let zhu = game.findPlayer(i => i.getSeatNum() == num);
           			if(list.some(i => i == zhu.name)){
             			player.useResult({ skill: zhu.name }, event);
						break;
					} else {
                    num -= 1;
					if(num == 0){
						const num4 = list.length;
						let num3 = Math.floor(Math.random() * num4);
						let yinyue = list[num3];
						player.useResult({ skill: yinyue }, event);
						break;
					}
                	}  
          		}
			}
		},
	},
	//帝释天
	xinfan_dishitian:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/dishitian.jpg');
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/Broken Hero.mp3");
		},
	},
	//逢魔之时
	xinfan_fengmozhishi:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/fengmozhishi.jpg');
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/fengmozhishi.mp3");
		},
	},
	//千姬
	xinfan_qianji:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/qianji.jpg');
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/huanshidejintou.mp3");
		},
	},
    //季
	xinfan_ji:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/ji.jpg');
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/huasiji.mp3");
		},
	},
	//缚骨清姬
	xinfan_fuguqingji:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/fuguqingji.jpg');
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/huazuoqingyan.mp3");
		},
	},
    //孔雀明王
	xinfan_kongquemingwang:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/kongquemingwang.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/jingjimeigui.mp3");
		},
	},
	//空相面灵气
	xinfan_kongxiangmianlingqi:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/kongxiangmianlingqi.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/kongxiang.mp3");
		},
	},
	//荒骷髅
	xinfan_huangkulou:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/huangkulou.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/kugushizhang.mp3");
		},
	},
	//不知火
	xinfan_buzhihuo:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/buzhihuo.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/lidaozhige.mp3");
		},
	},
	//铃鹿御前
	xinfan_lingluyuqian:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/lingluyuqian.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/luhaiweiwang.mp3");
		},
	},
	//鬼童丸
	xinfan_guitongwan:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/guitongwan.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/shayushenghua.mp3");
		},
	},
	//神堕八岐大蛇
	xinfan_shenduobaqidashe:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/shenduobaqidashe.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/shenzhijiangzhi.mp3");
		},
	},
	//神堕八岐大蛇
	xinfan_shenduobaqidashe:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/shenduobaqidashe.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/shenzhijiangzhi.mp3");
		},
	},
	//鬼切
	xinfan_guiqie:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/guiqie.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/weimingzhizui.mp3");
		},
	},
	//本真三尾狐
	xinfan_benzhensanweihu:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/benzhensanweihu.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/xianyuezhixia.mp3");
		},
	},
	//紧那罗
	xinfan_jinnaluo:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/jinnaluo.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/xingchenzhilv.mp3");
		},
	},
	//面灵气
	xinfan_mianlingqi:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/mianlingqi.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/xinshengqimian.mp3");
		},
	},
	//蝉冰雪女
	xinfan_chanbingxuenv:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/chanbingxuenv.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/xueyu.mp3");
		},
	},
	//瑶音紧那罗
	xinfan_yaoyinjinnaluo:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/yaoyinjinnaluo.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/yanhuozhilv.mp3");
		},
	},
	//伊邪娜美
	xinfan_yixienamei:{
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1",
		},
		filter(event,player){
			return false;
		},
		async content(event, trigger, player) {
			game.broadcastAll(function () {
                ui.background.setBackgroundImage("extension/阴阳师杀/fenbao/yys/beijing/yixienamei.jpg");
            })
            game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/zhanyushijiejintou.mp3");
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
	_Bgm_info:`游戏开始时，你选择一个Bgm播放`,
	xinfan_dishitian:`帝释天`,
	xinfan_dishitian_info:`播放 [Broken Hero]`,	
	xinfan_fengmozhishi:`逢魔之时`,
	xinfan_fengmozhishi_info:`播放 [逢魔之时]`,
	xinfan_qianji:`千姬`,
	xinfan_qianji_info:`播放 [幻世的尽头]`,
	xinfan_ji:`季`,
	xinfan_ji_info:`播放 [化四季]`,
	xinfan_fuguqingji:`缚骨清姬`,
	xinfan_fuguqingji_info:`播放 [化作青烟]`,
	xinfan_kongquemingwang:`孔雀明王`,
	xinfan_kongquemingwang_info:`播放 [荆棘玫瑰]`,
	xinfan_kongxiangmianlingqi:`空相面灵气`,
	xinfan_kongxiangmianlingqi_info:`播放 [空相]`,
	xinfan_huangkulou:`荒骷髅`,
	xinfan_huangkulou_info:`播放 [枯骨誓章]`,
	xinfan_buzhihuo:`不知火`,
	xinfan_buzhihuo_info:`播放 [离岛之歌]`,
	xinfan_lingluyuqian:`铃鹿御前`,
	xinfan_lingluyuqian_info:`播放 [麓海为王]`,
	xinfan_guitongwan:`鬼童丸`,
	xinfan_guitongwan_info:`播放 [杀欲生花]`,
	xinfan_shenduobaqidashe:`神堕八岐大蛇`,
	xinfan_shenduobaqidashe_info:`播放 [神之将至]`,
	xinfan_guiqie:`鬼切`,
	xinfan_guiqie_info:`播放 [未名之罪]`,
	xinfan_benzhensanweihu:`本真三尾狐`,
	xinfan_benzhensanweihu_info:`播放 [弦月之下]`,
	xinfan_jinnaluo:`紧那罗`,
	xinfan_jinnaluo_info:`播放 [星辰之律]`,
	xinfan_mianlingqi:`面灵气`,
	xinfan_mianlingqi_info:`播放 [心生七面，善恶难辨]`,
	xinfan_chanbingxuenv:`蝉冰雪女`,
	xinfan_chanbingxuenv_info:`播放 [雪语]`,
	xinfan_yaoyinjinnaluo:`瑶音紧那罗`,
	xinfan_yaoyinjinnaluo_info:`播放 [烟火之律]`,
	xinfan_yixienamei:`伊邪娜美`,
	xinfan_yixienamei_info:`播放 [绽于世界尽头]`,


});
