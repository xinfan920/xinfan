import { lib, game, ui, get, ai, _status } from "../../../../noname.js";
//武将文本信息，技能翻译文本信息，标签翻译文本信息
const translates = {
xinfan_jueqianji: "千姬",
xinfan_juechaoge: "潮歌",
xinfan_juechaoge_info: "锁定技,当你使用或打出牌或受到伤害的累计次数大于4后，你摸3张牌，然后重新计数。",

xinfan_juexingzhangchunhua: "星张春华",
xinfan_juejueqin: "绝情",
xinfan_juejueqin_info: "锁定技，每回合一次,防止你造成或受到的伤害。免伤角色本回合获得“绝情”标记。持有“绝情”标记的角色，其受到的伤害改为体力流失。",
xinfan_juezhinian: "执念",
xinfan_juezhinian_info: "每回合一次，当你的牌进入弃牌堆时，你可以获得之，本回合内你使用此牌无次数限制。",     

xinfan_juexingcaocao: "星曹操",
xinfan_juezhiyuan: "志远",
xinfan_juezhiyuan_info: "锁定技，当你的手牌数量大于手牌上限时，你将超出数量的手牌置于武将牌上称“志”。你的武将牌上每有1张“志”，你的手牌上限加1。结束阶段你将1张“志”收回手牌。",

xinfan_juexingzhaoyun: "星赵云",
xinfan_jueyoulong: "游龙",
xinfan_jueyoulong_info: "群势力技， 当你使用或打出牌后，你获得一枚“游”标记。你可以弃置两枚‘游”标记使用一张“势”牌，然后你本回合内下一张牌无次数限制。",

};

export default translates;