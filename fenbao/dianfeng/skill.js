import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

/** @type { importCharacterConfig['skill'] } */
const skills = {
    //星赵云
    xinfan_jueyoulong: {
                        audio: "chongzhen",
                        groupSkill: "qun",
                        ai: {
                            combo: ["xinfan_qiangshi"],
                        },
                        mod: {
                            cardEnabled: function(card, player) {
                                if(card.cards?.length&&card.cards[0].hasGaintag("xinfan_qiangshi_tag")&&player.countMark("xinfan_jueyoulong")<2) return false;
                            },
                            cardSavable: function(card, player) {
                                if(card.cards?.length&&card.cards[0].hasGaintag("xinfan_qiangshi_tag")&&player.countMark("xinfan_jueyoulong")<2) return false;
                            },
                            cardRespondable: function(card, player) {
                                if(card.cards?.length&&card.cards[0].hasGaintag("xinfan_qiangshi_tag")&&player.countMark("xinfan_jueyoulong")<2) return false;
                            },
                        },
                        trigger: {
                            player: ["useCard", "respondAfter"],
                        },
                        filter: function(event, player) {
                            return player.group == "qun";
                        },
                        frequent: true,
                        marktext: "游",
                        intro: {
                            content: "mark",
                            markcount: "mark",
                        },
                        content: function() {
                            player.addMark("xinfan_jueyoulong");
                        },
                        group:"xinfan_jueyoulong_remove",
                        subSkill: {
                            use:{
                                mod:{
                                    cardUsable: function(card) {
                                        return Infinity;
                                    },
                                },
                            },
                            remove: {
                                trigger: {
                                    player: "loseAfter"
                                },
                                forced: true,
                                audio: "chongzhen",
                                filter(event, player) {
                                    if (!event.ss || !event.ss.length) {
                                        return false;
                                    }
                                    for (var i in event.gaintag_map) {
                                        if (event.gaintag_map[i].includes("xinfan_qiangshi_tag")) {
                                            return true;
                                        }
                                        return false;
                                    }
                                },
                                content() {
                                    "step 0";
                                    var num=0;
                                    for (var i of trigger.ss) {
                                        if (!trigger.gaintag_map[i.cardid] || !trigger.gaintag_map[i.cardid].includes("xinfan_qiangshi_tag")) {
                                            continue;
                                        }
                                        num++;
                                    };
                                    event.num=num;
                                    player.removeMark("xinfan_jueyoulong",2);
                                    "step 1";
                                    player.logSkill("xinfan_qiangshi");
                                    player.loseToSpecial(get.cards(event.num), "xinfan_qiangshi_tag").visible = true;
                                },
                            },
                        },
                    },  
    //星曹操
    xinfan_juezhiyuan: {
                priority:1,
                        audio: "sbjianxiong",
                    forced: true,
                trigger: {
                    global: ["phaseBegin","phaseEnd","useCardEnd","gainEnd","respondEnd","useSkillEnd","loseEnd","damageEnd","loseMaxHpEnd","changeHp","gainMaxHpEnd"],
                },
                filter(event, player) {
                    return player.getHandcardLimit() < player.countCards('h');
                },
                mod: {
                    maxHandcard: function (player, num) {
                        return num + player.getExpansions('xinfan_juezhiyuan_mark').length;
                    },
                },
                content() {
                    'step 0'
                    let num = player.countCards('h') - player.getHandcardLimit();
                    player.chooseCard(`###志远###将${num}张牌置于武将牌上称“志”`, true, [num, num]);
                    'step 1'
                    player.addToExpansion(result.cards, 'gain2').gaintag.add('xinfan_juezhiyuan_mark');
                },
                group: ["xinfan_juezhiyuan_end"],
                subSkill: {
                    mark: {
                        mark: true,
                        intro: {
                            name: "志",
                            content: "expansion",
                            markcount: "expansion",
                        },
                        sub: true,
                        sourceSkill: "xinfan_juezhiyuan",
                      
                    },
                    end: {
                        audio:"sbjianxiong",
                        trigger: {
                            player: "phaseEnd",
                        },
                        forced: true,
                        filter(event, player) {
                            return player.getExpansions('xinfan_juezhiyuan_mark').length;
                        },
                        content() {
                            'step 0'
                            player
                                .chooseCardButton(1, '选择获得一张"志"', true, player.getExpansions('xinfan_juezhiyuan_mark'))
                                .set('ai', () => {
                                    return true;
                                });
                            'step 1'
                            if (result.links) player.gain(result.links, 'gain2')
                        },
                        sub: true,
                        sourceSkill: "xinfan_juezhiyuan",
                        
                    },
                },
             
            },
    //星张春华
    xinfan_juejueqin: {
        usable: 1,
        forced: true,
        audio: 'rejueqing',
        trigger: {
            player: 'damageBegin',
            source: 'damageBegin',
        },
        firstDo: true,
        content() {
            trigger.cancel();
            if (trigger.source == player) {
                trigger.player.addTempSkill('xinfan_juejueqin_mark');
                trigger.player.addMark('xinfan_juejueqin_mark', 1);
                if (!trigger.player.storage.xinfan_juejueqin_from) trigger.player.storage.xinfan_juejueqin_from = [];
                trigger.player.storage.xinfan_juejueqin_from.push(player);
            } else {
                player.addTempSkill('xinfan_juejueqin_mark');
                player.addMark('xinfan_juejueqin_mark', 1);
                if (!player.storage.xinfan_juejueqin_from) player.storage.xinfan_juejueqin_from = [];
                player.storage.xinfan_juejueqin_from.push(player);
            }
        },
        subSkill: {
            mark: {
                mark: true,
                onremove(player) {
                    delete player.storage.xinfan_juejueqin_from;
                },
                intro: {
                    name: '绝情',
                    content: 'mark',
                    nocount: true,
                },
                charlotte: true,
                trigger: {
                    player: 'damageBegin',
                },
                direct: true,
                content() {
                    trigger.cancel();
                    const num = trigger.num;
                    player.loseHp(num);
                },
            },
        },
    },
    xinfan_juezhinian: {
                audio: "reshangshi",
                filter(event, player) {
                    return (
                        !player.storage.xinfan_juezhinian.includes(event.card.name) &&
                        !player.getHistory('sourceDamage', function (evt) {
                            return evt.card == event.card;
                        }).length &&
                        get.position(event.card) == 'd'
                    );
                },
                check: () => true,
                init(player) {
                    player.storage.xinfan_juezhinian = [];
                },
                trigger: {
                    player: "useCardEnd",
                },
                usable: 1,
                content() {
                    const cards = trigger.card.cards ? trigger.card.cards : trigger.card;
                    player.gain(cards).gaintag = ['xinfan_juezhinian'];
                    player.addTempSkill('xinfan_juezhinian_temp');
                    player.storage.xinfan_juezhinian.push(trigger.card.name);
                },
                subSkill: {
                    temp: {
                        mod: {
                            cardUsable(card, player, num) {
                                return card.cards?.every(i => i.hasGaintag('xinfan_juezhinian')) ? Infinity : num;
                            },
                        },
                        onremove(player) {
                            player.removeGaintag('xinfan_juezhinian');
                            player.storage.xinfan_juezhinian = [];
                        },
                        sub: true,
                        sourceSkill: "xinfan_juezhinian",
                      
                    },
                },
               
            },

        //千姬
    xinfan_juechaoge:{
            forced: true,
            priority:1,
            trigger: {
                player: ['useCardBegin', 'respondBegin'],
            },
            marktext: '潮歌',
            intro: {
                content: '此标记数量大于4后清除，千姬摸3张牌。',
                name: '潮歌',
            },
            async content(event, trigger, player) {
                player.addMark('xinfan_juechaoge', 1);
		    },
            group: ['xinfan_juechaoge_ge'],
            subSkill: {
                ge: {
                    audio: "ext:阴阳师杀/fenbao/jsdf/juesebao/qianji:2",
                    trigger: {
                        player: 'xinfan_juechaogeAfter',
                    },
		            filter(event, player) {
                        return player.countMark('xinfan_juechaoge') > 4;
                    },			 
                    forced: true,
                    async content(event, trigger, player) {
		                await player.draw(3);
                        await player.clearMark('xinfan_juechaoge');
                    },
                },
            },
    },
};

export default skills;
