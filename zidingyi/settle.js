import { lib, game, ui, get, ai, _status } from '../../../noname.js';

//自定义前缀
lib.namePrefix.set("苍", { color: '#00ffff' });
lib.namePrefix.set("灵", { color: '#79efffff' });

//自定义势力
game.addGroup("hycq_cang", "苍", "苍穹", { color: "#3388BB" });
game.addGroup("hycq_bwp", "蜃", "百闻牌蜃气楼", { color: "#f68261ff" });
game.addGroup("hycq_szb", "影", "影之诗", { color: "#b377cfff" });
game.addGroup("hycq_ao", "奥", "奥", { color: "#0932ead5" });

//自定义新的关键词超链接翻译
lib.poptip.add({
    id:"cybuffinfo",
    name: "cybuff",
    info:"由本扩展作者苍宇所定义的buff",
});

lib.poptip.add({
    id:"cydebuffinfo",
    name: "cydebuff",
    info:"由本扩展作者苍宇所定义的debuff",
});

lib.poptip.add({
    id:"jinghuainfo",
    name: "净化",
    info:"净化X层，即该角色身上的所有cydebuff均失去X层；如果是净化全部层数，则代表失去所有cydebuff",
});

lib.poptip.add({
    id:"qusaninfo",
    name: "驱散",
    info:"驱散X层，即该角色身上的所有cybuff均失去X层；如果是驱散全部层数，则代表失去所有cybuff",
});

lib.poptip.add({
    id:"chaoyuanpojuninfo",
    name: "超元破军",
    info:"基于游戏《奥拉星》所衍生的机制，在使用技能的时候，如果元气不低于4，则会自动消耗4点元气，大幅强化技能效果",
});

lib.poptip.add({
    id:"juejiexianshiinfo",
    name: "绝界现世",
    info:"基于游戏《奥拉星》所衍生的机制，消耗3点元气，获得一个绝界技能；<br>绝界技能有阶级，每次使用时提升一阶，<br>回合结束时，如果当前回合没有发动过对应的绝界现世，则降低一阶<br>最高三阶",
});

lib.poptip.add({
    id:"tonglingzhaohuaninfo",
    name: "通灵召唤",
    info:"基于游戏《奥拉星》所衍生的机制，消耗4点元气，由通灵随从中选择一名随从召唤入场；每名角色最多在场上存在一名通灵召唤的随从，新随从入场时会将旧随从替代<br>注：<br>（1）该部分代码摘抄自《太古天庭》扩展，感谢代码完成者：萌佬，扩展作者：沐如风晨<br>（2）目前该机制已经兼容身份模式与国战模式，在身份模式下作为内奸的时候如果托管则会造成一些小问题<br>（3）目前存在当通灵召唤物于自己回合内死亡时，会跳过下家回合的问题，等待修复",
});

lib.poptip.add({
    id:"shengtijuexinginfo",
    name: "圣体觉醒",
    info:"基于游戏《奥拉星》所衍生的机制，当元气不低于4的时候，圣体技能效果增强；<br>其他部分技能的效果加强<br>获得新的效果<br>当元气低于4的时候，自动退出觉醒状态",
});

lib.poptip.add({
    id:"yingxiongshenhuainfo",
    name: "英雄神化",
    info:"基于游戏《奥拉星》所衍生的机制，消耗4点元气，进入特定的神化状态，获得强力增益；并且使用特定的技能将不再消耗元气",
});

lib.poptip.add({
    id:"yinchanginfo",
    name: "吟唱",
    info:"吟唱X：每个回合开始时，X减少1点，当X减少至0的时候，触发后续效果；<br>该机制代码由“终日羽禁”完成，“白银山幽灵”修复BUG",
});

lib.poptip.add({
    id:"chongfuyinchanginfo",
    name: "重复吟唱",
    info:"重复吟唱X：每个回合开始时，X减少1点，当X减少至0的时候，触发后续效果，并且再次获得该吟唱效果；<br>该机制代码由“白银山幽灵”完成",
});

lib.poptip.add({
    id:"tongling_liumangshouhu",
    name: "六芒星系守护者",
    info:"本扩展武将“修罗”的通灵召唤目标，原型均为游戏《奥拉星》在六芒星系的剧情主角或星球守护者，<br>包括如下武将：<br>飞天独角兽，黑夜童心，魔幻摩卡，远古灵龟，暴雪山神",
});

lib.poptip.add({
    id:"byd_sadan_shenyuanpai",
    name: "深渊牌",
    info:"由“影之世界”武将包的武将“撒旦”所衍生的卡牌，包括：阿斯塔罗特的宣判，深渊之主的仆从，沉默的魔将，边狱的邪祟",
});

lib.poptip.add({
    id:"byd_juejieyuzhou",
    name: "绝大宇宙卡组",
    info:"包含本扩展及无名杀本体的所有卡包的所有卡牌各一张（花色与点数随机）",
});

lib.poptip.add({
    id:"zaijieskill",
    name: "灾杰技能",
    info:"包含灾祸十杰的试炼技能（技能名中包含“绝”字，能够令在场玩家获得戒律技能的技能）与戒律技能（即技能名为“第X戒律”的技能）",
});