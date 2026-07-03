import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

/** @type { importCharacterConfig['skill'] } */
//这里是用来放装备牌的装备技能的
const cardSkills = {
	cy_bwp_huangjinyu_skill: {
		mod: {
			cardname(card, player) {
				if (card.name == "cy_bwp_huangjinyu") {
					const evt = get.event(),
						viewAs = name => get.autoViewAs({ name: name, cards: [card] }, [card]);
					if (typeof evt.filterCard == "function" && evt.filterCard(viewAs("shan"), player, evt) && !evt.filterCard(viewAs("sha"), player, evt)) {
						return "shan";
					}
					return "sha";
				}
			},
		},
		trigger: {
			player: ["useCardBefore", "respondBefore"],
		},
		silent: true,
		direct: true,
		firstDo: true,
		priority: Infinity,
		filter(event, player) {
			if (!["sha", "shan"].includes(event.card.name)) {
				return false;
			}
			if (event.cards?.length !== 1 || event.cards.includes(event.card)) {
				return false;
			}
			if (event.cards[0].name != "cy_bwp_huangjinyu") {
				return false;
			}
			const evt = event.getParent(),
				viewAs = name => get.autoViewAs({ name: name }, event.cards);
			return typeof evt.filterCard == "function" && evt.filterCard(viewAs("shan"), player, evt) && evt.filterCard(viewAs("sha"), player, evt);
		},
		async content(event, trigger, player) {
			const result = await player
				.chooseControl("sha", "shan")
				.set("prompt", `黄金羽：请选择视为${trigger.name == "respond" ? "打出" : "使用"}的牌名`)
				.set("ai", () => {
					const choice = _status.event.getParent(5).choice;
					if (choice && ["sha", "shan"].includes(choice)) {
						return choice;
					}
					return ["sha", "shan"].randomGet();
				})
				.forResult();
			if (!result.control) {
				return;
			}
			const card = get.autoViewAs({ name: result.control }, trigger.cards);
			trigger.card = card;
			trigger.getParent().result.card = card;
		},
		hiddenCard(player, name) {
			return ["sha", "shan"].includes(name) && player.countCards("hs", card => card.name == "cy_bwp_huangjinyu");
		},
		ai: {
			respondSha: true,
			respondShan: true,
			skillTagFilter(player, tag, arg) {
				if (!player.countCards("hs", card => card.name == "cy_bwp_huangjinyu")) {
					return false;
				}
			},
		},
	},
	//新约·白之章
	cy_szbbyd_emxybaizhizhang: {
		equipSkill: true,
		mod: {
			maxHandcard(player, num) {
				return num + 2;
			}
		}
	},
	//新约·黑之章
	cy_szbbyd_emxyheizhizhang: {
		equipSkill: true,
		trigger: {
			source: 'damageBefore'
		},
		filter(event, player) {
			return event.player != player;
		},
		forced: true,
		async content(event, trigger, player) {
			trigger.nohujia = true;
		}
	}
};

export default cardSkills;