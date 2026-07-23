import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

const translates = {
	//卡包包名翻译
	// `${packName}_card_config`
	betaCards_card_config: "衍生卡牌包",

	//卡牌翻译
	cy_szbbyd_sdshenpan:"阿斯塔罗特的宣判",
	cy_szbbyd_sdshenpan_info:"重铸；弃置至少X张牌，给予一名其他角色X点伤害，如果你的“渊”标记数量在3以下，则你受到1点伤害（X为目标角色当前体力值-1）",
	cy_szbbyd_sdpucong:"深渊之主的仆从",
	cy_szbbyd_sdpucong_info:"出牌阶段，选择一项使用（1）如果你未拥有护甲，则获得一点护甲（2）获得一枚“渊”标记，如果你未拥有技能“堕渊”，则获得技能“堕渊”；当你受到伤害后，如果你未拥有护甲，则可以使用此牌获得一点护甲",
	cy_szbbyd_sdmojiang:"沉默的魔将",
	cy_szbbyd_sdmojiang_info:"选择一名其他角色，对其造成1点伤害",
	cy_szbbyd_sdxiechong:"边狱的邪祟",
	cy_szbbyd_sdxiechong_info:"重复2次，弃置一名角色的一张牌",

	cy_szbbyd_emxybaizhizhang:"新约·白之章",
	cy_szbbyd_emxybaizhizhang_info:"宝物牌；其他角色计算与你的距离+1；你的手牌上限+2；你失去装备区的此牌时，你装备一张【新约·黑之章】并摸一张牌",
	cy_szbbyd_emxyheizhizhang:"新约·黑之章",
	cy_szbbyd_emxyheizhizhang_info:"宝物牌；你计算与其他角色的距离-1；你造成伤害时无视其他角色的护甲；你失去装备区的此牌时，你装备一张【新约·白之章】并可以弃置一名其他角色区域里的一张牌",

	cy_bwp_huangjinyu:"黄金羽",
	cy_bwp_huangjinyu_info:"基本牌，此牌可以当作【杀】或【闪】使用或打出",
};

export default translates;