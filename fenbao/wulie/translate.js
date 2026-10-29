import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
//武将文本信息，技能翻译文本信息，标签翻译文本信息
const translates = {
   
xinfan_liezhangjiao: "烈张角",
xinfan_jiaoyi: '教义',
xinfan_jiaoyi_info: '锁定技，有角色造成雷属性伤害后，你获得枚“道”标记。出牌阶段内/当有角色进入濒死状态时，你可以弃置两枚“道”标记，令一名角色摸两张牌/令其回复一点体力。',
xinfan_xingdao: '行道',
xinfan_xingdao_info: '每回合各限一次，你可以将一张♥/♦/♠/♣牌视为乐不思蜀/无中生有/闪电/兵粮寸断使用。你以此法使用的牌，可指定任意角色为目标。',
xinfan_zhangshi: '掌势',
xinfan_zhangshi_info: '当一张延时类锦囊牌进入一名角色区域内时，你可以将之视为一张无次数限制的雷[杀]对其使用，若造成伤害则该锦囊牌视为生效。',

 
xinfan_lieliuhong: "烈刘宏",
xinfan_guoku: '国库',
xinfan_guoku_info: '锁定技，游戏开始时，你将牌堆顶8张牌置于武将牌上称“国库”牌。其他角色获得非"国库"牌后，须将一张牌置于“国库”中（每回合每名角色至多5张）。',
xinfan_fuying: '富盈',
xinfan_fuying_info: '锁定技，准备阶段开始时，你分配“国库”任意张牌。结算完成后，未以此法获得牌的角色可以令你流失一点体力。你可将“国库”牌视为手牌使用。',
xinfan_gongzhu: '共主',
xinfan_gongzhu_info: '主公技，其他角色准备阶段，你可令其摸2张牌。',

 
xinfan_liehuanggai: "烈黄盖",
xinfan_zhaxiang: '诈降',
xinfan_zhaxiang_info: '每名角色出牌阶段开始时，你可以交给其他角色一张牌。若其未横置，则其横置。',
xinfan_kurou: '苦肉',
xinfan_kurou_info: '锁定技,当你体力值减少后，你获得等量点护甲并摸本次减少值两倍张牌，然后你发动一次“诈降”。',
xinfan_renhuo: '人祸',
xinfan_renhuo_info: '锁定技，你始终横置，其他角色获得你的牌后，其获得一枚“祸”标记。每个角色的回合结束后，你视为对自己使用一张火攻。持有“祸”标记的角色受到属性伤害时，移除一枚标记增加1点伤害。',

xinfan_liezhugeliang: "烈诸葛亮",
xinfan_jieze: '竭泽',
xinfan_jieze_info: '锁定技，每轮游戏开始时或你的准备阶段开始时，你减少一点体力上限观看牌堆顶x张牌，获得其中一张，将剩余的牌以任意顺序置于牌堆顶或牌堆底（x为你的体力上限）。',
xinfan_zhisheng: '智胜',
xinfan_zhisheng_info: '其他角色使用或打出牌时，你可以弃一张同类别的牌，令其使用或打出的牌无效并弃置。若二者名称相同，其本回合使用同名牌无效并弃置。',

	 
xinfan_liezhaoyun: "烈赵云",
xinfan_jvqi: "聚气",
xinfan_jvqi_info: "锁定技，每个自身的回合结束后或当你成为其他角色使用牌的目标后，你获得一枚“气”标记。当你获得或失去“气”标记时，你摸一张牌。",
xinfan_nuzhan: "怒斩",
xinfan_nuzhan_info: "当你使用牌指定仅一名其他角色为目标后，你可以弃置任意“气”标记获得额外效果。弃置标记数量不小于1时，此牌不计入次数限制。不小于2时，此牌伤害加一。不小于3时，此牌不可被响应。不小于4时，目标非锁定技失效。不小于5时，目标失去当前所有体力值。",
  
xinfan_lieyuanshao: "烈袁绍",
xinfan_lirui: "利锐",
xinfan_lirui_info: "出牌阶段内，你可以将至少两张手牌视为一张无距离次数限制的[杀]对至多X名其他角色使用(X为你以此法使用手牌的数量)。",
xinfan_shiya: "势压",
xinfan_shiya_info: "锁定技，当你使用牌指定了所有其他角色为目标时，直到此牌结算完成前，其他角色不能使用或打出牌。",

xinfan_liexvshu: "烈徐庶",
xinfan_yixing: "义行",
xinfan_yixing_info: "每回合限一次，一名角色的准备阶段开始时，你可以交给其一张牌或获得其一张牌，若如此做，其可以对你造成一点伤害。",
xinfan_renxia: "任侠",
xinfan_renxia_info: "转换技，每名角色回合开始时转换为阳。阳：当你造成或受到伤害后，你观看牌堆顶两张牌并交给至多两名角色，以此法获得牌的角色本回合内造成的伤害加一。然后你转换为阴。阴：当你造成或受到伤害后，你可以弃置两张牌防止此伤害或令此伤害加一。若你弃置的牌均为红色/黑色，你可以令一名角色摸一张牌/弃置一名角色区域内一张牌。",

xinfan_liecaocao: '烈曹操',
xinfan_kuaichou: '快仇',
xinfan_kuaichou_info: '每回合限x次。一张造成过伤害的牌结算完成后，若你为使用者或受伤角色之一，你可以立即无次数限制的使用一张牌（x为你已损失体力值加一）。',
xinfan_jisi: '汲思',
xinfan_jisi_info: '锁定技，一张造成过伤害的牌结算完成时，若你为使用者或受伤角色之一。若你未记录此牌/已记录/已记录不同牌名，你记录此牌名并摸两张牌/清除牌名/用此牌名替换并摸两张牌。',
xinfan_fuji: '复击',
xinfan_fuji_info: '你可以将一张与“汲思”记录牌名同类别的牌，视为同名牌使用。',


xinfan_liezhangliao: "烈张辽",
xinfan_tuxi: '突袭',
xinfan_tuxi_1: '突袭弃置牌',
xinfan_tuxi_2: '突袭使用牌',
xinfan_tuxi_info: '每回合各限一次：1.当其他角色于其回合内弃置牌后/2.当其他角色于回合外使用牌后。你可以视为对其使用一张无距离次数限制的雷[杀]。',
xinfan_wucuo: '无措',
xinfan_wucuo_info: '锁定技，你使用的牌结算完成前，其他角色不能使用或打出本回合内获得的牌。',
xinfan_kuibing: '溃兵',
xinfan_kuibing_info: '当你不因此技能对其他角色造成伤害后，你必须选择一项：1.弃置目标本回合内获得的牌。2.获得目标装备区所有牌。3.额外造成一点雷属性伤害。',
					
xinfan_liewangyi: "烈王异",
xinfan_liezhenlie: "贞烈",
xinfan_liezhenlie_info: "游戏开始时你可以将一名其他角色标记为“贞烈”角色。“贞烈”角色使用基本牌或伤害类锦囊牌指定其他角色为唯一目标时/成为基本牌或伤害类锦囊牌的唯一目标时，你视为对同一目标使用一张同名牌/使用者视为对你使用一张同名牌",
xinfan_liemiji: "秘计",
xinfan_liemiji_info: "当你使用无颜色牌指定目标时/成为无颜色牌的目标时，你摸一张牌。",

xinfan_lieguanyu: "烈关羽",
xinfan_zhonglun: "众论",
xinfan_zhonglun_info: "出牌阶段限一次，你可以选择一名其他角色，其以外的其他角色依次选择其下次受到的伤害，加一/减一。然后你对其造成一点伤害",
xinfan_aoyi: "傲意",
xinfan_aoyi_info: "当你造成的伤害/使用的牌，被抵消时，你可以流失一点体力，令此伤害生效并增加x点/令此牌生效并额外结算x次（x为本技能发动次数+1）。",
				    
xinfan_liejiangwei: "烈姜维",
xinfan_weijian: "维艰",
xinfan_weijian_info: "当一名角色的牌进入弃牌堆后，你可以流失x点体力，令其将其中一张牌收回手牌并标记为“维艰”牌，“维艰”牌不计入手牌上限且无使用次数限制（x为本回合内此技能使用次数）。",
xinfan_kuzhi: "苦志",
xinfan_kuzhi_info: `觉醒技，当你进入濒死状态后，你将手牌数量和体力值调整至体力上限。失去技能“维艰”获得技能${get.poptip("xinfan_xinhuo")}和${get.poptip("xinfan_yujin")}。`,
xinfan_xinhuo: "心火",
xinfan_xinhuo_info: "限定技，出牌阶段内，你可以分配1点火焰伤害。",
xinfan_yujin: "余烬",
xinfan_yujin_info: `锁定技，一名角色的回合结束时，你失去一点体力上限，获得一点护甲并摸两张牌。然后你令${get.poptip("xinfan_xinhuo")}的火焰伤害加1.当你以此法失去最后一点体力上限时，你发动一次${get.poptip("xinfan_xinhuo")}。`,
 
xinfan_liepangtong: "烈庞统",
xinfan_lianhuan: '连环',
xinfan_lianhuan_info: '出牌阶段内/当你成为其他角色使用牌的目标时，你可以流失所有体力令至多等量名其他角色横置，然后你可以弃置一名其他角色一张牌。',
xinfan_niepan: '涅槃',
xinfan_niepan_info: '锁定技，当你阵亡时，你令一名其他角色于你阵亡后受到一点火焰伤害。本轮结束时，你复活并将手牌数量和体力值和体力上限调整至当前存活角色数量。',
 
xinfan_liegaoshun: "烈高顺",
xinfan_xianzhen: '陷阵',
xinfan_xianzhen_info: '锁定技,每名角色回合结束后,你获得一枚"陷"标记。你每持有一枚"陷"标记你与其他角色计算距离互相减1。',
xinfan_yongjue: '勇决',
xinfan_yongjue_info: '出牌阶段内/当你成为其他角色使用牌的目标后/当你受到伤害时,你可以弃置一枚"陷"标记，对其他角色造成一点伤害/取消之/防止之。',

xinfan_liewolongzhugeliang: "烈卧龙诸葛亮",
xinfan_liangtianshu: '天数',
xinfan_liangtianshu_info: '牌堆顶前7张牌始终对你可见。每回合一次，你可以使用其中一张牌。',
xinfan_liangqihe: '气合',
xinfan_liangqihe_info: '出牌阶段限一次，你可以依次，展示你的一张牌，展示牌堆顶一张牌，令一名其他角色展示一张牌。然后你获得展示的牌，每有一张展示牌与你展示的颜色相同，你摸一张牌并分配一点火焰伤害。',
};

export default translates;