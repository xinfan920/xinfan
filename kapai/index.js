import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

//导入卡牌包相关文件
//卡牌
import cards from "./card.js";
//卡牌技能
import cardSkills from "./cardSkill.js";
//牌堆
import cardLists from "./cardList.js";
//卡牌相关翻译
import cardTranslates from "./cardTranslate.js";

//导入卡牌包[betaCards]
game.import("card", function () {
	const betaCards = {
		name: "betaCards",//卡牌包名
		connect: true,
		card: { ...cards },
		skill: { ...cardSkills },
		translate: { ...cardTranslates },
		list: cardLists,
	};
	//为未设置图片的卡牌设置默认路径
	for (const name in betaCards.card) {
		const info = betaCards.card[name];
		if (!info.cardimage) {
			info.image ??= `ext:联机恒宇苍穹/image/card/${name}.jpg`;
		}
	}
	lib.config.all.cards.push("betaCards");
	return betaCards;
});
