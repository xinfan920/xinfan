import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
//武将文本信息，技能翻译文本信息，标签翻译文本信息
const translates = {

xinfan_xiayuzhibozuozhu: "佐助",
xinfa_xiazyanhuang: "炎凰",
xinfa_xiazyanhuang_info: `每回合一次，需要时，你可以视为使用一张火【杀】。若你本回合内使用的上一张牌为基本牌/锦囊牌，则改为雷【杀】/【决斗】。`,
xinfa_xiazyujie: "御劫",
xinfa_xiazyujie_info: `每回合一次，需要时，你可以视为使用一张【闪】。若你本回合内使用的上一张牌为基本牌/锦囊牌，则改为【桃】/【无中生有】。`,
xinfa_xiazjingzhe: "惊蛰",
xinfa_xiazjingzhe_info:`每回合一次，需要时，你可以视为使用一张【无懈可击】。若你本回合内使用的上一张牌为基本牌/锦囊牌，则改为【酒】/【过河拆桥】。`,
xinfan_xiazbianzhen: "变阵",
xinfan_xiazbianzhen_info:`当你发动“炎凰”或“御劫”或“惊蛰”后，你可以无次数限制的使用一张牌，以此法使用牌时，本回合内“炎凰”和“御劫”和“惊蛰”和“变阵”失效。`,

};

export default translates;
