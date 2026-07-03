 import { lib, game, ui, get, ai, _status } from "../../../noname.js";

/** @type {Record<string, Skill>} */
const Yuhuns = {
	//御魂
	_Yuhun: {
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
			if (!lib.config.extension_新繁_xinfan_Yuhun) {
				return false;
			}
			return event.name != "phase" || game.phaseNumber == 0;
		},
		async content(event, trigger, player) {
			let list = [];
			for (let skill in lib.Yuhuns) {
				if (skill == event.name) continue;
				list.push([skill, lib.translate[skill]+"："+lib.translate[skill + "_info"]]);
			}
			if (!list.length) return;
			let result = await player.chooseButton([
				lib.translate["_Yuhun_info"],
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
					return Math.random();
				})
				.forResult();
			if (!result.bool) return
			player.addSkill(result.links[0]);
            player.popup(result.links[0]);
            game.log(player, "获得了", "【" + get.translation(result.links[0]) + "】");
		}
	},
	//破势
	xinfan_yuposhi:{
		usable:1,
		priority: 1,
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1"
		},
		filter(event,player){
			return !event.player.isDamaged()
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			trigger.num++;
		},
	},
	//心眼
	xinfan_yuxinyan:{
		usable:1,
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1"
		},
		filter(event,player){
			return event.player.hp==1;
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			trigger.num++;
		},
	},
	//鸣屋
	xinfan_yumingwu:{
		usable:1,
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1"
		},
		filter(event,player){
			return event.player.countCards("j") > 0;
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			trigger.num++;
		},
	},	
	//狂骨
	xinfan_yukuanggu:{
		usable:1,
		priority: -4,
		direct:true,
		trigger:{
			source:"damageBegin1"
		},
		filter(event,player){
			return event.player.countCards("h") < player.countCards("h");
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			trigger.num++;
		},
	},
	//荒骷髅
	xinfan_yuhuangkulou:{
		usable:1,
		priority: -4,
		trigger:{
			source:"damageBegin1"
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			await player.loseHp();
			trigger.num++;
		},
	},
	//狰
		xinfan_yuzheng: {
		logTarget: `source`,
		priority: -4,
		trigger: {
			player: "damageAfter"
		},
		filter(event, player) {
			if (!event.source) return false;
			if (event.source == player) return false;
			return true;
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			await player.chooseToUse(
				`【狰】：你可对 ${get.translation(trigger.source)} 使用1张【杀】`,
				function (card) {
					if (get.name(card) !== "sha") {
						return false;
					}
					return lib.filter.filterCard.apply(this, arguments);
				},
				function (card, player, target) {
					if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) {
						return false;
					}
					return lib.filter.targetEnabled.apply(this, arguments);
				}
			)
				.set("targetRequired", true)
				.set("complexSelect", true)
				.set("complexTarget", true)
				.set("sourcex", trigger.source)
				.set("addCount", false)
		},
	},	
	//招财
	xinfan_yuzhaocai: {
		priority: -4,
		direct:true,
		trigger: {
			player: ["phaseZhunbeiBegin"]
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			                 const choiceList = ['摸1张牌','获得2张影',];
                       const choices = ['选项一','选项二'];
                        var result = await player
                         .chooseControl()
                     .set('controls',choices)
                      .set('choiceList',choiceList)
                                 .forResult();
                        if(result.control=="选项一"){
			await player.draw();
                    }else if(result.control=="选项二"){
                  await player.gain(lib.card.ying.getYing(2), "gain2");
                }
		},
	},
	//骰子鬼
	xinfan_yutouzigui: {
		priority: -4,
		trigger: {
			player: ["phaseZhunbeiBegin"]
		},
		filter(event,player){
			return player.countCards("j") > 0;
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
            player.discardPlayerCard(player, true, "j");
			await player.chooseUseTarget({ name: 'sha' }, false, 'nodistance');
		},
	},	
	//网切
	xinfan_yuwangqie: {
		priority: -4,
		trigger: {
			player: ["useCardToPlayered"]
		},
		filter(event,player){
			return event.card.name === "sha" && event.target.countCards("e");
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
            player.discardPlayerCard(trigger.target, true, "e");
		},
	},		
	//阴摩罗
	xinfan_yuyinmoluo:{
		usable:1,
		priority: -4,
		direct:true,
		trigger:{
			source:"damageAfter"
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			await player.draw(trigger.num);
		},
	},
	//蝠翼
	xinfan_yufuyi: {
		usable: 1,
		forced: true,
		locked: false,
		priority: -4,
		trigger: {
			source: "damageAfter"
		},
		filter(event, player) {
			return true
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			await player.recover();
		}
	},
	//珍珠
	xinfan_yuzhenzhu: {
		usable: 1,
		forced: true,
		locked: false,
		priority: -4,
		trigger: {
			global: "recoverEnd"
		},
		filter(event, player) {
			return event.source == player;
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			await trigger.player.changeHujia(1, "gain");
		}
	},
	//涂佛
	xinfan_yutufo:{
		priority: -4,
		direct:true,
		trigger: {
        player: "phaseEnd",
        },
	    filter(event, player) {
        return !player.getStat("damage");
        },
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			await player.draw(2);
		},
	},
	//涅槃火
	xinfan_yuniepanhuo:{
		priority: -4,
		direct:true,
		trigger: {
        player: "phaseEnd",
        },
	    filter(event, player) {
        return player.hp==1;
        },
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			await player.recover();
		},
	},	
	//地藏像
		xinfan_yudizangxiang: {
		usable: 1,
		direct:true,
		priority: -4,
		trigger: {
			player: "changeHpAfter"
		},
		filter(event, player) {
			return event.num < 0;
		},
		async content(event, trigger, player) {
            player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			player.changeHujia(1)
		},
	},
	//青女坊
	xinfan_yuqingnvfang:{
		priority: -4,
		direct:true,
		trigger: {
		player: "dying",
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
		    player.awakenSkill('xinfan_yuqingnvfang');            
			player.recoverTo(1);
			await player.changeHujia(2);
			player.addTempSkill("xinfan_yuqingnvfang_ban", { player: "phaseBegin" });	
		},
		subSkill: {
			ban: {
            inherit: "baiban",
            intro: {
            content(storage, player, skill) {
                    let str = "<li>不能使用牌";
                    const list = player.getSkills(null, false, false).filter(function (i) {
                        return lib.skill.baiban.skillBlocker(i, player);
                    });
                    if (list.length) {
                        str += "<br><li>" + get.translation(list) + "失效";
                    }
                    return str;
                },
            },
            mod: {
                cardEnabled(card) {
                    return false;
                },
                cardSavable(card) {
                    return false;
                },
            },
            sub: true,
            sourceSkill: "eu_ducai",
            init: function(player, skill) {
              player.addSkillBlocker(skill);
            },
            onremove: function(player, skill) {
              player.removeSkillBlocker(skill);
            },
            charlotte: true,
            skillBlocker: function(skill, player) {
              return !lib.skill[skill].persevereSkill && !lib.skill[skill].charlotte;
            },
            mark: true,
		},	
		},
		},
	//木魅
	xinfan_yumumei:{
		priority: -4,
		direct:true,
		trigger:{
			player:"damageEnd"
		},
		filter(event,player){
			return event.source.countCards("he");
		},
		async content(event, trigger, player) {
			player.playGifOL(1000, lib.assetURL + `/extension/新繁/Yuhun/${event.name}.png`,)
			trigger.source.chooseToDiscard(1, true, "he");
		},
	},		
};


game.broadcastAll(
	(Yuhuns) => {
		lib.Yuhuns = { ...Yuhuns };
	},
	Yuhuns,
);

Object.assign(lib.skill, { ...Yuhuns });

Object.assign(lib.translate, {
	_Yuhun: "御魂",
	_Yuhun_info:`游戏开始时，你选择一个御魂(技能)获得`,
	xinfan_yuposhi:`破势`,
	xinfan_yuposhi_info:`每回合1次，你对未受伤的角色造成伤害+1。`,
	xinfan_yuxinyan:`心眼`,
	xinfan_yuxinyan_info:`每回合1次，你对体力值为1的角色造成伤害+1。`,
	xinfan_yuzhaocai:`招财`,
	xinfan_yuzhaocai_info: "准备阶段开始时，你可以摸1张牌或获得2张影。",
    xinfan_yuyinmoluo:`阴摩罗`,
	xinfan_yuyinmoluo_info: "每回合1次，造成伤害时摸伤害值张牌。",
	xinfan_yukuanggu:`狂骨`,
	xinfan_yukuanggu_info: "每回合1次，对手牌数量小于你的角色，造成的伤害加1。",
	xinfan_yutufo:`涂佛`,
	xinfan_yutufo_info: "你的回合结束后，若你本回合内未造成过伤害，你摸2张牌。",
	xinfan_yuqingnvfang:`青女坊`,
	xinfan_yuqingnvfang_info: "限定技，当你进入濒死状态时，你回复体力至1点并获得2点护甲。然后你技能失效且不能使用牌直至你的回合开始。",
	xinfan_yuhuangkulou:`荒骷髅`,
	xinfan_yuhuangkulou_info:`每回合1次，当你造成伤害时，你可以流失1点体力令本次造成的伤害+1。`,	
	xinfan_yuniepanhuo:`涅槃火`,
	xinfan_yuniepanhuo_info: "你的回合结束后，若你体力值为1，你回复1点体力。",	
	xinfan_yumingwu:`鸣屋`,
	xinfan_yumingwu_info:`每回合1次，你对判定区内有牌的角色造成伤害+1。`,	
	xinfan_yumumei:`木魅`,
	xinfan_yumumei_info:`受到伤害后，来源弃置1张牌。`,	
	xinfan_yutouzigui:`骰子鬼`,
	xinfan_yutouzigui_info:`准备阶段开始时，你可以弃置判定区内一张牌，并视为使用一张无距离限制的【杀】。`,	
	xinfan_yuwangqie:`网切`,
	xinfan_yuwangqie_info:`当你使用【杀】指定目标后，你可以弃置目标装备区内一张牌。`,	
	xinfan_yuzheng:`狰`,
	xinfan_yuzheng_info:`受到伤害后，你可以对来源使用一张【杀】。`,	
	xinfan_yudizangxiang:`地藏像`,
	xinfan_yudizangxiang_info:`每回合首次减少体力值后，你获得1点护甲。`,	
	xinfan_yufuyi:`蝠翼`,
	xinfan_yufuyi_info:`每回合首次造成伤害后，你回复1点体力。`,	
	xinfan_yuzhenzhu:`珍珠`,
	xinfan_yuzhenzhu_info:`每回合一次，当一名角色回复体力后，若你为来源，则其获得1点护甲。`,	

});
