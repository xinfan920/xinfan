import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

/** @type { importCharacterConfig['skill'] } */
const skills = {
    //狐妖
    xinfan_hujuqi: {
        trigger: {
            player: "useCardAfter",
        },
        forced: true,
        locked: false,
        audio: "ext:新繁/fenbao/yys/juesebao/yaohu:2",
        filter(event, player) {
            if (!event.targets || !event.targets?.length) {
                return true;
            }
            return event.targets.slice().remove(player).length == 0;
        },
        async content(event, trigger, player) {
            const num = 3 + player.getHistory("useSkill", evt => evt.skill == event.name).length;
            const cards = get.cards(num, true);
            const result = await player
                .chooseCardButton(get.translation(event.name), cards.slice(), true)
                .set("ai", button => {
                    return get.player().getUseValue(button.link);
                })
                .forResult();
            if (result.bool && result.links?.length) {
                await player.gain(result.links, "gain2");
            }
        },
        },
    xinfan_hukuanglan: {
        trigger: {
            player: "useCardToPlayered",
        },
        filter(event, player) {
            return event.card.name == "sha";
        },
        logTarget: "target",
        audio: "ext:新繁/fenbao/yys/juesebao/yaohu:1",
        async content(event, trigger, player) {
            while (true) {
                const cards = get.cards();
                await player.showCards(cards);
                const card = cards[0];
                await game.cardsGotoOrdering(cards);
                if (card.name == "sha") {
                    if (player.canUse(card, trigger.target, false, false)) {
                        await player.chooseUseTarget(card, trigger.target, false, "nodistance");
                    }
                    const result = await player.chooseBool("是否继续展示牌堆顶的一张牌？").forResult();
                    if (!result.bool) {
                        break;
                    }
                } else {
                    break;
                }
            }
        },
    },
    //时耀泷夜叉姬
    xinfan_shixi: {
        name: "时隙",
    },
    xinfan_chashiyao: {
        trigger: {
            player: "phaseBegin",
        },
        audio: "ext:新繁/fenbao/yys/juesebao/shiyaolongyechaji:2",
        forced: true,
        async content(event, trigger, player) {
            await player[player.countMark(event.name) % 2 == 0 ? "gainMaxHp" : "recover"]();
        },
    },
    xinfan_chalunzhuan: {
        trigger: {
            global: "phaseEnd",
        },
        audio: "ext:新繁/fenbao/yys/juesebao/shiyaolongyechaji:2",
        async content(event, trigger, player) {
            player.tempBanSkill(event.name, "roundStart", false);
            const next = player.insertPhase("xinfan_shixi");
            next.set("phaseList", ["phaseDraw", "phaseUse"]);
            player.addMark("xinfan_chashiyao", 1, false);
        },
    },
    xinfan_chashiji: {
        filterx(event, player) {
            const evt = event?.getParent("phase");
            if (!evt || evt?.skill != "xinfan_shixi") {
                return false;
            }
            return game.hasPlayer(target => {
                return _status.currentPhase == target && target.hasSkill("xinfan_chashiji");
            });
        },
        audio: "ext:新繁/fenbao/yys/juesebao/shiyaolongyechaji:2",
        global: "xinfan_chashiji_global",
        subSkill: {
            global: {
                mod: {
                    cardEnabled2(card, player) {
                        if (!lib.skill.xinfan_chashiji.filterx(_status.event, player)) {
                            return;
                        }
                        if (_status.currentPhase?.isIn() && _status.currentPhase.hasSkill("xinfan_chashiji") && _status.currentPhase != player) {
                            return false;
                        }
                    },
                },
                trigger: {
                    player: "damageBegin4",
                },
                forced: true,
                filter(event, player) {
                    if (!lib.skill.xinfan_chashiji.filterx(event, player)) {
                        return false;
                    }
                    return true;
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    player.addSkill("xinfan_chashiji_effect");
                    player.addMark("xinfan_chashiji_effect", trigger.num, false);
                },
            },
            effect: {
                mark: true,
                intro: {
                    content: "下一名角色的回合开始时，你受到#点伤害",
                },
                trigger: {
                    global: "phaseBegin",
                },
                silent: true,
                charlotte: true,
                onremove: true,
                async content(event, trigger, player) {
                    await player.damage(player.countMark(event.name), "nosource");
                    player.removeSkill(event.name);
                },
            },
        },
    },
   //卑弥呼
    xinfan_beirihui: {
        trigger: {
            global: "roundStart",
        },
        audio: "ext:新繁/fenbao/yys/juesebao/beimihu:2",
        popup: false,
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt2(event.skill), (card, player, target) => {
                    return !player
                        .getRoundHistory("useSkill", evt => {
                            return evt.skill == "xinfan_beirihui" && evt.targets?.includes(target);
                        }, 1)
                        .length;
                })
                .set("ai", target => {
                    const player = get.player();
                    const att = get.attitude(player, target);
                    return att;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            player.logSkill(event.name, target);
            target.addTempSkill("diaohulishan", "roundEnd");
            target
                .when({ global: "roundEnd" })
                .then(() => {
                    const next = player.insertPhase("xinfan_shixi");
                    next.set("phaseList", ["phaseDraw", "phaseUse"]);
                });
        },
    },
    xinfan_beirilun: {
        mod: {
            cardUsable(card, player, num) {
                if (card.name == "sha") {
                    return num + Math.min(7, game.roundNumber);
                }
            },
        },
        trigger: {
            player: "phaseDrawBegin2",
        },
        forced: true,
        filter(event, player) {
            return !event.numFixed;
        },
        async content(event, trigger, player) {
            trigger.num += Math.min(7, game.roundNumber);
        },
    },

      //修罗鬼童丸
    xinfan_guiluowang: {
                    audio: "ext:新繁/fenbao/yys/juesebao/xiuluoguitongwan:2",
        trigger: {
            source: "damageSource",
            player: "damageEnd",
        },
        filter(event, player) {
            if (event.getParent().name == "xinfan_guiluowang") {
                return false;
            }
            return lib.skill.xinfan_guiluowang.logTarget(event, player).length;
        },
        logTarget(event, player) {
            return game.filterPlayer(target => {
                return target != event.source && target != event.player;
            }).sortBySeat();
        },
        async content(event, trigger, player) {
            for (const target of event.targets) {
                if (!target.isIn()) {
                    continue;
                }
                await target.damage();
            }
        },
    },
    xinfan_guishouyi: {
                    audio: "ext:新繁/fenbao/yys/juesebao/xiuluoguitongwan:2",
        trigger: {
            player: ["loseHpBefore", "damageBegin4", "loseMaxHpBefore"],
        },
        getNum(player) {
            return game.getAllGlobalHistory(
                "everything",
                evt => {
                    return evt.name == "die" && evt.source == player;
                },
            ).length;
        },
        filter(event, player) {
            return player.countMark("xinfan_guishouyi_used") <= (get.info("xinfan_guishouyi").getNum(player));
        },
        async content(event, trigger, player) {
            player.addTempSkill("xinfan_guishouyi_used", "roundStart");
            player.addMark("xinfan_guishouyi_used", 1, false);
            trigger.cancel();
            const num = (get.info("xinfan_guishouyi").getNum(player) + 1);
            await player.draw(num);
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true,
            },
        },
    },
    xinfan_xiuguikuanglie: {
            audio: "ext:新繁/fenbao/yys/juesebao/xiuluoguitongwan:2",
        enable: "phaseUse",
        usable(skill, player) {
            return (get.info("xinfan_guishouyi").getNum(player) + 1);
        },
        async content(event, trigger, player) {
            const num = (get.info("xinfan_guishouyi").getNum(player) + 1);
            await player.draw(num);
            player.addSkill("xinfan_xiuguikuanglie_effect");
        },
        ai: {
            order() {
                return get.order({ name: "sha" }) - 0.5;
            },
            result: {
                player(player) {
                    return 1;
                },
            },
        },
        subSkill: {
            effect: {
                mod: {
                    cardUsable(card, player, num) {
                        if (get.number(card) === "unsure" || card.cards?.some(card => get.position(card) == "h")) {
                            return Infinity;
                        }
                    },
                    targetInRange(card, player, target) {
                        if (get.number(card) === "unsure" || card.cards?.some(card => get.position(card) == "h")) {
                            return true;
                        }
                    },
                    cardname(card, player, target) {
                        if (get.position(card) == "h") return "sha";
                    },
                },
                trigger: {
                    source: "damageBefore",
                    player: "damageBefore",
                },
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    player.removeSkill(event.name);
                },
                group: "xinfan_xiuguikuanglie_use",
            },
            use: {
                trigger: {
                    player: "useCard",
                },
                silent: true,
                charlotte: true,
                async content(event, trigger, player) {
                    trigger.card.storage.xinfan_xiuguikuanglie = true;
                },
                ai: {
                    unequip: true,
                    skillTagFilter(player, tag, arg) {
                        if (!arg || !arg.card || !arg.card?.storage?.xinfan_xiuguikuanglie) {
                            return false;
                        }
                    },
                },
            },
        },
    },
             //歌留多
xinfan_gewuguang: {
    audio: "ext:新繁/fenbao/yys/juesebao/geliuduo:2",
        forced: true,
        trigger: {
            player: 'useCard',
        },
        intro: {
            content: '已记录的花色：$',
        },
        filter(event, player) {
            const suit = get.suit(event.card);
            return [player, ...event.targets].some(t => !t.getStorage('xinfan_gewuguang').includes(suit));
        },
        async content(event, trigger, player) {
            const suit = get.suit(trigger.card);
            player.markAuto('xinfan_gewuguang', suit);
            if (player.getStorage('xinfan_gewuguang').length >= 4) {
                await player.loseHp(4);
            }
            const targets = trigger.targets.filter(target => target != player);
            if (targets.length) {
                for (const target of targets) {
                    target.markAuto('xinfan_gewuguang', suit);
                    if (target.getStorage('xinfan_gewuguang').length >= 4) {
                   player.logSkill('xinfan_geqita'); 
                        await target.loseHp(4);
                        target.unmarkAuto('xinfan_gewuguang', target.getStorage('xinfan_gewuguang'));
                    }
                }
            }
        },
    },
    xinfan_gehuayi: {
        subSkill: {
            tag: {
                intro: {
                    content: '已移除的花色：#',
                },
                onremove: true,
                charlotte: true,
            },
        },
        audio: "ext:新繁/fenbao/yys/juesebao/geliuduo:1",
        enable: 'phaseUse',
        filter(event, player) {
            return game.hasPlayer(p => p.getStorage('xinfan_gewuguang').some(i => !player.getStorage('xinfan_gehuayi_tag').includes(i)));
        },
        filterTarget(card, player, target) {
            return target.getStorage('xinfan_gewuguang').some(i => !player.getStorage('xinfan_gehuayi_tag').includes(i));
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            const suit = target.getStorage('xinfan_gewuguang').filter(i => !player.getStorage('xinfan_gehuayi_tag').includes(i));
            const result = await player
                .chooseControl(suit)
                .set('prompt', `###花憶###请选择要移除的花色！`)
                .set('ai', () => {
                    return _status.event.controls.randomGet();
                })
                .forResult();
            player.markAuto('xinfan_gehuayi_tag', result.control);
            player.addTempSkill('xinfan_gehuayi_tag');
            target.unmarkAuto('xinfan_gewuguang', result.control);
            const card = get.cardPile(c => get.suit(c) == result.control);
            if (card) {
                await player.gain(card, 'draw');
            }
        },
        ai: {
            order: 15,
            result: {
                target: 5,
            },
        },
    },
    xinfan_geqingduan: {
        trigger: {
            target: 'useCardToTargeted',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/geliuduo:2",
        check(event, player) {
            return get.effect(player, event.card, event.player, player) < 0;
        },
        filter(event, player) {
            if (event.player == player) return false;
            return player.getStorage('xinfan_gewuguang').includes(get.suit(event.card));
        },
        async content(event, trigger, player) {
            player.unmarkAuto('xinfan_gewuguang', get.suit(trigger.card));
            trigger.getParent().excluded.add(player);
        },
    },
    xinfan_geqita: {
        trigger: {
            player: 'damageEnd',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/geliuduo:2",
               forced: true,
		getIndex: event => event.num,
    async content(event, trigger, player) {
        player.draw();
       },
       },

          //不见岳
    xinfan_bushanxing: {
        enable: "phaseUse",
        usable: 1,
        audio: "ext:新繁/fenbao/yys/juesebao/bujianyue:2",
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog(get.translation("xinfan_bushanxing"), [
                    [
                        ["damage", "令一名角色受到1点伤害"],
                        ["recover", "令一名角色回复1点体力"],
                    ],
                    "textbutton",
                ]);
            },
            check(button) {
                const player = get.player();
                if (button.link == "recover") {
                    return Math.max(
                        ...game.filterPlayer().map(target => {
                            return get.recoverEffect(target, player, player);
                        })
                    );
                } else {
                    return Math.max(
                        ...game.filterPlayer().map(target => {
                            return get.damageEffect(target, player, player);
                        })
                    );
                }
            },
            backup(links, player) {
                return {
                    choice: links[0],
                    filterTarget: true,
                    ai1: () => 1,
                    ai2(target) {
                        const player = get.player();
                        const sgn = get.sgnAttitude(player, target);
                        const { choice } = get.info("xinfan_bushanxing_backup");
                        if (choice == "recover") {
                            return get.recoverEffect(target, player, player) * sgn;
                        }
                        return get.damageEffect(target, player, player);
                    },
                    async content(event, trigger, player) {
                        player.logSkill('xinfan_bushanxing');
                        const {
                            targets: [target],
                        } = event;
                        const { choice } = get.info(event.name);
                        await target[choice]();
                    },
                };
            },
            prompt(links, player) {
                if (links[0] == "damage") {
                    return "令一名角色受到1点伤害";
                } else {
                    return "令一名角色回复1点体力";
                }
            },
        },
        subSkill: {
            backup: {

            },
        },
        ai: {
            order: 1,
            result: {
                player: 1,
            },
        },
    },
            xinfan_buguyue: {
          trigger: {
            global: "damageBegin",
                      },
                      usable: 1,
                audio: "ext:新繁/fenbao/yys/juesebao/bujianyue:2", 
                                  filter(event, player) {
                                    return event.source != player;
                                        }, 
                                        async content(event, trigger, player) {
                 const choiceList = ['本次伤害加1','本次伤害减1',];
                       const choices = ['选项一','选项二'];
                        var result = await player
                         .chooseControl()
                    .set('controls',choices)
                    .set('choiceList',choiceList)
                    .set("ai", () => {
                if (get.attitude(player, trigger.player) > 0) {
                    return "选项二";
                }else{
                 return "选项一";
                }  
            })
                                 .forResult();
                        if(result.control=="选项一"){
                        trigger.num++;
                    }else if(result.control=="选项二"){
                        trigger.num--;
                }    
                                            },
                },
          //御怨般若
                xinfan_boyuyuan: {
                        trigger: {
                            player: 'useCardAfter',
                        },
                        audio: "ext:新繁/fenbao/yys/juesebao/yuyuanbore:2",
                        filter(event, player) {
                            return ['basic', 'trick'].includes(get.type(event.card)) && !event.card?.storage?.xinfan_boyuyuan;
                        },
                        frequent: true,
                        async content(event, trigger, player) {
                            await player.chooseUseTarget(
                                {
                                    name: trigger.card?.name,
                                    nature: trigger.card?.nature,
                                    storage: {
                                        xinfan_boyuyuan: true,
                                    },
                                },
                                false,
                                `###御怨###是否视为使用一张同名牌（${get.translation(trigger.card?.name)}）？`
                            );
                        },
                    },
          xinfan_bohenfan: {
           forced: true,
    priority:15,
               audio: "ext:新繁/fenbao/yys/juesebao/yuyuanbore:2",
           trigger: {
            global: 'damageEnd',
        },
                                    marktext: '仇恨',
                         intro: {
                                   content: 'mark',
                                   name: '仇恨',
                                 },
              filter(event, player) {
                                    return event.source != player;
                                },                      
        async content(event, trigger, player) {
                     await player.addMark('xinfan_bohenfan', 1);
                     if(player.countMark('xinfan_bohenfan') > 2){
                     await player.clearMark('xinfan_bohenfan');       
               player.addTempSkill("xinfan_bohenfan_start", { global: 'roundStart', }); 
               player.addTempSkill("xinfan_bohenfan_star", { global: 'roundStart', }); 
                       if(player.countCards("j") > 0){
                    const cards = player.getCards("j");
                    player.discard(cards);
        }
                     }
       },  
       subSkill: { 
                start: {
                           trigger: {
            global: 'damageBegin',
        },
                           forced: true,
                           priority:15,
                        async content(event, trigger, player) {
                    player.logSkill('xinfan_bohenfan');    
                trigger.cancel();
                    const num = trigger.num;
                    trigger.player.loseHp(num);            
                  },   
                       },   
                               star: {
                    trigger: {
            global: 'roundEnd',
        },
               forced: true,
               priority:15,
             async content(event, trigger, player) {
             player.logSkill('xinfan_bohenfan');    
                player.insertPhase().skill=event.name;       
                  },   
                       },           
                                     },  
              },   
          //鬼王酒吞童子
                         xinfan_tunfentian: {
                                audio: "ext:新繁/fenbao/yys/juesebao/guiwangjiutuntongzi:2",
        enable: 'phaseUse',
        usable: 1,
                async content(event, trigger, player) {  
                    player.addTempSkill("xinfan_tunfentian_start", { player: "useCardEnd" });
                    await player.chooseUseTarget({ name: 'sha' , nature: 'fire',isCard: true}, false, 'nodistance');                    
			 },  
             subSkill: { 
                start: {
    mod: {
        selectTarget(card, player, range) {
          if (get.name(card) == "sha") {
            range[1] = 1 + player.getDamagedHp();
          }
        },
    },
                    },
                },
                                ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
        },
           },
            },    
                           xinfan_tunguiwang: {
                       audio: "ext:新繁/fenbao/yys/juesebao/guiwangjiutuntongzi:2",    
                mark: true,
                intro: {
                    content: '每回合1次，造成伤害加1或受到伤害减1。',
                },
                charlotte: true,
        trigger: {
            player: 'damageBegin',
            source: 'damageBegin',
        },
        usable: 1,
        forced: true,
		async content(event, trigger, player) {
            
               if(trigger.source == player){
            trigger.source.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/guiwang.png`,[100,100])
                trigger.num++;
               }else{
            trigger.player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/guiwang.png`,[100,100])
                trigger.num--;
               }
            },
},

                    xinfan_tunnuyan: {
            audio: "ext:新繁/fenbao/yys/juesebao/guiwangjiutuntongzi:2",
        priority:35,
        trigger: {
            global: 'phaseZhunbeiBegin',
        },
        check(event, player) {
            if(event.player.hp == 1){
                return get.attitude(player, event.player) < 0;
            }
            if(event.player.hp > 2 && event.player == player){
                return get.attitude(player, event.player) > 0;
            }
            if(event.player.hp > 1 && event.player.countCards("j") >= 1){
				return get.attitude(player, event.player) > 0;	
			}
            return event.player == player && player.countCards("j") >= 1
                  },
        prompt2(event, player) {
             return `是否令${get.translation(event.player)}流失1点体力，弃置判断区内所有牌，直到其下个回合开始前获得“鬼王”？`;
        },
        async content(event, trigger, player) { 
            player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/nuyan.png`,[100,100])
            trigger.player.loseHp();
            if(trigger.player.countCards("j") > 0){
                    const cards = trigger.player.getCards("j");
                    trigger.player.discard(cards);
            }
            if(trigger.player != player){
            trigger.player.addTempSkill("xinfan_tunguiwang", {player: "phaseBefore" });
            }
        
                            },
                            },
          //梦山白藏主
                   xinfan_baizhanmeng: {
                                audio: "ext:新繁/fenbao/yys/juesebao/mengshanbaizangzhu:2",
        enable: 'phaseUse',
        usable: 1,
                 filter(event, player) {
            return player.countCards("he") >= 1;
        },
			filterCard: true,
            position: "he",
            selectCard:1,
			filterTarget(card, player, target) {
               return target != player;
            },
            selectTarget:1,
            filter(event, player){
            return game.hasPlayer(function(current) {
            return current != player;
            });
            },
                async content(event, trigger, player) {         
					const target = event.target;
                    target.addTempSkill("qinggang2", { player: "useCardEnd" });
                    await player.useCard({ name: 'sha'},target, false);	
            },
            group: ['xinfan_baizhanmeng_start'],
        subSkill: {   
                       start: {
        trigger: {
           player: 'damageAfter',
        },
        	check(event, player) {
							return get.attitude(player, event.source) <= 0;
						},
         filter(event, player) {
            return event.source != player && player.countCards("he") >= 1;
        },
        prompt2(event, player) {
             return `是否对${get.translation(event.source)}发动“斩梦”？`;
        },
async content(event, trigger, player) { 
             player.chooseToDiscard(1, true, "he");  
            player.logSkill('xinfan_baizhanmeng');        
            trigger.source.addTempSkill("qinggang2", { player: "useCardEnd" });
            await player.useCard({ name: 'sha'},trigger.source, false);
    },
                        },
                        },
            ai:{
    order:1,
    result:{
        player(player) {
            return 2;
        },
    },
           },
           },
                        xinfan_baiyushou: {
                   audio: "ext:新繁/fenbao/yys/juesebao/mengshanbaizangzhu:1",
        trigger: {
            global: 'roundStart'
        },
                            forced: true,
        async content(event, trigger, player) {
            player.draw(2);
               const  result  = await player.chooseTarget(`###御守###令一名角色回复一点体力,若其未受伤则改为获得1点护甲。`)
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                            if(result.targets[0].isDamaged()){
                                result.targets[0].recover(1);
                            }else{
                                  result.targets[0].changeHujia();
                            }
                }
},
},

                                xinfan_baishanshi: {
                   audio: "ext:新繁/fenbao/yys/juesebao/mengshanbaizangzhu:2",
        trigger: {
           global: 'damageBegin',
        },
        priority:15,
        filter(event, player) {
            return !player.getStorage('xinfan_baishanshi_used').includes(event.player) && event.source != player && event.player != player;
        },
        	check(event, player) {
							return get.attitude(player, event.player) > 0;
						},
                prompt2(event, player) {
             return `${get.translation(event.player)}即将受到伤害，是否代替之？`;
        },
        async content(event, trigger, player) {  
            player.markAuto('xinfan_baishanshi_used', trigger.player);
            player.addTempSkill('xinfan_baishanshi_used');
            trigger.player = player;  
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true,
                intro: {
                    content: '已发动技能目标：$',
                },
            },
        },
 },
          //封阳君
                  xinfan_fengfengyang: {
    audio: "ext:新繁/fenbao/yys/juesebao/fengyangjun:2",
         trigger: {
            player: "phaseUseBefore",
        },
        async content(event, trigger, player) {
        trigger.cancel();
        const evt = event.getParent("phase", true);
        if (evt) {
        game.log(player, "结束了回合");
        evt.num = evt.phaseList.length;
        evt.goto(11);
       }
       const evtx = event.getParent("phaseUse", true);
       if (evtx) {
        evtx.skipped = true;
       } 
       player.chooseUseTarget({ name: 'sha' }, false, 'nodistance');
        },
        },
            xinfan_fengwangyue: {
        audio: "ext:新繁/fenbao/yys/juesebao/fengyangjun:2",
        forced: true,
        zhuanhuanji: true,
        mark: true,
        marktext: '☯',
        trigger: {
             player: "useCardToPlayered",
        },
        filter(event, player) {
            return event.card?.name == 'sha';
        },
         async content(event, trigger, player) {
            player.changeZhuanhuanji('xinfan_fengwangyue');
            if (player.storage.xinfan_fengwangyue) {
          trigger.target.chooseToDiscard(2, true, "he");
                   await player.changeHujia();
               player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/fengyangjun/xinfan_fengyangjun2.jpg");
            } else {
               player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/fengyangjun/xinfan_fengyangjun1.jpg");
                    await player.draw();
                trigger.parent.baseDamage++;
            }
        },
    },
      xinfan_fengxunbu: {
       audio: "ext:新繁/fenbao/yys/juesebao/fengyangjun:2",
        round: 1,
        trigger: {
            global: 'phaseEnd',
        },
        lastDo: true,
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
           player.insertPhase().skill=event.name;
            player.addTempSkill('xinfan_fengxunbu_bu', 'phaseEnd');
            trigger.player.addMark('xinfan_fengxunbu_xun', 1);
        },
                global: ['xinfan_fengxunbu_xun'],
        subSkill: {
            bu: {
                                             mark: true,
                                intro: {
                                    name: "巡捕",
                                    name2: "巡捕",
                                    content: function(storage, player) {
                                        var players = game.filterPlayer(i => i.hasMark("xinfan_fengxunbu_xun"));
                                        return "本回合使用牌仅能指定" + get.translation(players) ,"为目标";
                                    },
                                    markcount: () => null,
                                },
                                mod: {
                                    cardSavable(card, player, target) {
                                        if (!target.hasMark("xinfan_fengxunbu_xun")) {
                                            return false;
                                        }
                                    },
                                    playerEnabled(card, player, target) {
                                        if (!target.hasMark("xinfan_fengxunbu_xun")) {
                                            return false;
                                        }
                                    },
                                },
                },
                xun: {
        trigger: {
            global: 'phaseEnd',
        },
                                 marktext: '巡捕',
                         intro: {
                                   content: 'mark',
                                   name: '巡捕',
                                 },
          filter(event, player) {
            return  player.hasMark('xinfan_fengxunbu_xun');
        },
         forced: true,
                async content(event, trigger, player) {            
                player.clearMark('xinfan_fengxunbu_xun');
                                            },
                            },
            },
    },  
          //葛叶
              xinfan_gehuanhua: {
        trigger: {
            global: 'phaseBegin',
        },
                audio: "ext:新繁/fenbao/yys/juesebao/geye:2",
        forced: true,
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            const target = trigger.player;
            player.markAuto('xinfan_gehuanhua_use', target);
            player.addTempSkill([...target.skills, 'xinfan_gehuanhua_use', 'xinfan_gehuanhua_clear']);
            target.addTempSkill(['xinfan_gehuanhua_change']);    
             game.broadcastAll(function (player,name) {
            player.node.avatar.setBackground(name, "character");   
              }, player,trigger.player.name);
        },
        subSkill: {
            change: {
                trigger: {
                    global: ['loseEnd', 'loseAsyncEnd', 'gainEnd', 'addToExpansionEnd', 'equipEnd', 'addJudgeEnd'],
                },
                silent: true,
                charlrotte: true,
                filter(event, player) {
                    return event.getg?.(player)?.length || event.getl?.(player)?.hs?.length;
                },
                forceDie: true,
                async content(event, trigger, player) {
                    const toAdd = trigger.getg?.(player) || [],
                        toRemove = trigger.getl?.(player)?.hs || [];
                    event.set('toAdd', toAdd);
                    event.set('toRemove', toRemove);
                    await event.trigger('xinfan_gehuanhuaChange');
                },
            },
            use: {
                init(player, skill) {
                    const toRemove = player.getCards('s', card => card.hasGaintag('xinfan_gehuanhua_tag'));
                    game.deleteFakeCards(toRemove);
                    const cards = player.getStorage(skill).reduce((cards, target) => {
                        const fake = target.isAlive() && target.countCards('h') ? game.createFakeCards(target.getCards('h')) : [];
                        return cards.addArray(fake);
                    }, []);
                    player.directgains(cards, null, 'xinfan_gehuanhua_tag');
                },
                onremove(player, skill) { 
                    game.broadcastAll(function (player) {      
                player.node.avatar.setBackground(player.name, "character");
                }, player);
                    player.unmarkAuto(skill, player.getStorage(skill));
                    const toRemove = player.getCards('s', card => card.hasGaintag('xinfan_gehuanhua_tag'));
                    game.deleteFakeCards(toRemove);
                },
                mark: true,
                intro: {
                    content: '你可以如手牌般使用或打出<span class=thundertext>$</span>的手牌',
                },
                forced: true,
                popup: false,
                delay: false,
                charlotte: true,
                trigger: {
                    player: ['useCardBefore', 'respondBefore'],
                    global: ['xinfan_gehuanhuaChange'],
                },
                filter(event, player) {
                    if (['useCard', 'respond'].includes(event.name)) {
                        const cards = player.getCards('s', card => card.hasGaintag('xinfan_gehuanhua_tag'));
                        return event.cards && event.cards.some(card => cards.includes(card));
                    }
                    return player.getStorage('xinfan_gehuanhua_use').includes(event.player);
                },
                async content(event, trigger, player) {
                    const tag = 'xinfan_gehuanhua_tag';
                    if (['useCard', 'respond'].includes(trigger.name)) {
                        trigger.set('xinfan_gehuanhua', player);
                        const real = player.getStorage(event.name).reduce((cards, target) => {
                            const hs = target.isAlive() && target.countCards('h') ? target.getCards('h') : [];
                            return cards.addArray(hs);
                        }, []);
                        for (let i = 0; i < trigger.cards.length; i++) {
                            const card = trigger.cards[i];
                            const cardx = real.find(cardx => cardx.cardid == card._cardid);
                            if (cardx) {
                                trigger.cards[i] = cardx;
                                trigger.card.cards[i] = cardx;
                            }
                        }
                    } else {
                        game.deleteFakeCards(player.getCards('s', card => trigger.toRemove.find(cardx => cardx.cardid == card._cardid)));
                        player.directgains(game.createFakeCards(trigger.toAdd), null, tag);
                    }
                },
            },
        },
    },
        xinfan_geheshou: {
        trigger: {
            global: 'roundStart',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/geye:2",
        limited: true,
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(`###合守###是否防止一名角色本轮内受到的所有伤害？`)
                .set('ai', target => {
                    const player = get.player();
                    if (!player.getFriends().length && player != target) {
                        return get.rank(target.name1, true) + (target.name2 ? get.rank(target.name2, true) : 0);
                    }
                    if (get.attitude(player, target) > 2 && target.hp <= 2) {
                        return 5;
                    }
                    return 0;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            player.awakenSkill('xinfan_geheshou');
            const target = event.targets[0];
            target.addTempSkill('mianyi', 'roundStart');
            if (player != target) {
                const skills = target.skills.filter(skill => {
                    const info = get.info(skill);
                    return info && !info.limited && !info.unique && !info.unique;
                });
                if (!skills.length) {
                    return;
                }
                const { links } = await player
                    .chooseButton(['选择获得一个技能', [skills, 'skill']])
                    .set('displayIndex', false)
                    .set('ai', button => {
                        const player = get.player();
                        let info = get.info(button.link);
                        if (info?.ai?.neg || info?.ai?.halfneg) {
                            return 0;
                        }
                        return get.skillRank(button.link, 'in');
                    })
                    .forResult();
                if (!links?.length) {
                    return;
                }
              await player.addSkills(links);
            }
        },
    },
          //辉夜姬
              xinfan_huiyuejing: {
        trigger: {
            global: ['phaseBegin', 'damageBegin2'],
        },
        intro: {
            content: 'mark',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/huiyeji:2",
        marktext: '辉',
        forced: true,
        priority:15,
        async content(event, trigger, player) {
            player.addMark('xinfan_huiyuejing', 1);
        },
    },
    xinfan_huihuiye: {
        trigger: {
            global: ['phaseBegin', 'damageAfter'],
        },
        filter(event, player, name) {
            return player.countMark('xinfan_huiyuejing') >= 2;
        },
                audio: "ext:新繁/fenbao/yys/juesebao/huiyeji:2",
        async cost(event, trigger, player) {
            player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/huiye.png`,[100,100])
            const controls = ['选项一', '选项二', 'cancel2'];
            const list = [`弃置2枚“辉”标记，令${get.translation(trigger.player)}摸2张牌`, `弃置3枚“辉”标记，令${get.translation(trigger.player)}自选一张牌获得`];
            if (player.countMark('xinfan_huiyuejing') < 3) {
                controls.remove('选项二');
                list[1] = '<span style="opacity:0.5">' + list[1] + '</span>';
            }
            const result = await player
                .chooseControl(controls)
                .set('choiceList', list)
                .set('prompt', `辉夜：请选择执行一项`)
                .set('goon', get.attitude(player, trigger.player) <= 0 ? 'cancel2' : controls.filter(i => i != 'cancel2').randomGet())
                .set('ai', () => _status.event.goon)
                .forResult();
            event.result = {
                bool: result.control != 'cancel2',
                cost_data: result.control,
                targets: [trigger.player],
            };
        },
        async content(event, trigger, player) {
            const num = event.cost_data == '选项一' ? 2 : 3;
            player.removeMark('xinfan_huiyuejing', num);
            if (event.cost_data == '选项一') {
                await trigger.player.draw(2);
            } else {
                const vcard = get.inpileVCardList();
                const result = await trigger.player
                    .chooseButton(1, ['###辉夜###请自选一张牌获得', [vcard, 'vcard']], false)
                    .set('ai', function (button) {
                        return get.value({ name: button.link[2], nature: button.link[3] }, get.player()) + 3 * Math.random();
                    })
                    .forResult();
                if (result.bool) {
                    const next1 = await trigger.player
                        .chooseControl(lib.suits)
                        .set('prompt', '###辉夜###请选择获得牌的花色')
                        .set('ai', () => _status.event.controls.randomGet())
                        .forResult();
                    const next2 = await trigger.player
                        .chooseNumbers('辉夜', [{ prompt: '请选择你要获得的点数', min: 0, max: 13 }], true)
                        .set('processAI', () => {
                            return [Array.from({ length: 14 }, (_, i) => i).randomGet()];
                        })
                        .forResult();
                    await trigger.player.gain(game.createCard(result.links[0][2], next1.control, next2.numbers[0], result.links[0][3]));
                }
            }
        },
        ai: {
            combo: 'xinfan_huiyuejing',
        },
    },
          //追月神
                                    xinfan_zhuiqinghui: {
                        trigger: {
                          target: "useCardToBefore",
                        },
                        usable: 1,
                        audio: "ext:新繁/fenbao/yys/juesebao/zhuiyueshen:1",
                        filter: function (event,player){
                                return event.player!=player;
                            },
                        async content(event, trigger, player) {
	                        	 trigger.cancel();                
	                  await player.useSkill('xinfan_zhuiyaoyue');	     
                              },
                                },

    xinfan_zhuiyaoyue: {
        zhuanhuanji: true,
        usable: 1,
        forced: true,
        mark: true,
        marktext: '☯',
                 audio: "ext:新繁/fenbao/yys/juesebao/zhuiyueshen:2",
                trigger: {
                      global: "phaseEnd",
                 },
        check: () => Math.random() > 0.5,
        async content(event, trigger, player) {
            player.changeZhuanhuanji('xinfan_zhuiyaoyue');
            if (player.storage.xinfan_zhuiyaoyue) {
                     player.draw(2);
            } else {
                const  result  = await player.chooseTarget(`###邀月###令一名角色摸一张牌`)
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                         await result.targets[0].draw(1);
                }
            }
        },
    },
 
          //因幡辉夜姬
                               xinfan_fanyuanman: {
                     trigger: {
                      global: 'phaseBegin',
                   },
                        marktext: '愿',
                         intro: {
                                   content: 'mark',
                                   name: '愿',
                                 },
                    check(event, player) {
							return get.attitude(player, event.player) > 0;
						},
                          audio: "ext:新繁/fenbao/yys/juesebao/yinfanhuiyeji:2",
                async content(event, trigger, player) {
                    await player.addMark('xinfan_fanyuanman', 1);
                            const num = player.countMark('xinfan_fanyuanman');                           
             const choiceList = ['摸两张牌','回复1点体力','造成1点伤害','增加1点体力上限',];
             const choices = ['选项一','选项二','选项三','选项四','cancel2',];
            if(num == 0){
               choiceList[0] = '<span style="opacity:0.5">' + choiceList[0] + "</span>";
                 choices.remove('选项一');
                };
            if(num < 2){
                 choiceList[1] = '<span style="opacity:0.5">' + choiceList[1] + "</span>";
                 choices.remove('选项二');
                };
            if(num < 3){
               choiceList[2] = '<span style="opacity:0.5">' + choiceList[2] + "</span>";
                 choices.remove('选项三');
                };
            if(num < 4){
                 choiceList[3] = '<span style="opacity:0.5">' + choiceList[3] + "</span>";
                 choices.remove('选项四');
                };
            var result = await trigger.player
            .chooseControl()
            .set('controls', choices)
            .set('choiceList', choiceList)
            .set('prompt','愿满： 请选择其中一项')
            .set("ai", () => {
                if (player.countMark('xinfan_fanyuanman') > 1 && trigger.player.isDamaged()) {
                    return "选项二";
                }
                if (player.countMark('xinfan_fanyuanman') > 3 && !trigger.player.isDamaged()) {
                    return "选项四";
                }
                if (player.countMark('xinfan_fanyuanman') > 2 && !trigger.player.countCards("h") > 3) {
                    return "选项三";
                }
                return "选项一";
            })
              .forResult();
            if (result.control == '选项一'){
            trigger.player.draw(2);
            }else if (result.control == '选项二'){
            trigger.player.recover();
            }else if (result.control == '选项三'){
                           const  result  = await trigger.player.chooseTarget(`###愿满###造成一点伤害`)
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);      
                        }).forResult();
                         if(result.bool){
                         await result.targets[0].damage(1);
                }
            }else if (result.control == '选项四'){
            trigger.player.gainMaxHp();
            }else if (result.control == 'cancel2'){
            return;
            } 
                   },  
                }, 
                        xinfan_fanyueying: {
          trigger: {
            global: ['damageBegin', 'recoverBegin'],
                      },
                audio: "ext:新繁/fenbao/yys/juesebao/yinfanhuiyeji:3",  
                                  filter(event, player) {
                                    return player.countMark('xinfan_fanyuanman') > 0;
                                        }, 
            check(event, player) {
                if(event.name == 'damage'){
                       return get.attitude(player, event.player) < 0;
                }
                if(event.name == 'recover' && event.player.getDamagedHp() > 1){
                        return get.attitude(player, event.player) > 0;
                }	
						},
                                        async content(event, trigger, player) {
                        await player.removeMark('xinfan_fanyuanman', 1);      
                                trigger.num++;
                                            },
                },
            //寻香行
    xinfan_xunxiangyin: {
        trigger: {
            global: 'phaseEnd',
        },
        priority:15,
        audio: "ext:新繁/fenbao/yys/juesebao/xunxiangxing:2",       
        getDiscardedCards() {
            const cards = [];
            game.getGlobalHistory('cardMove', evt => {
                if (evt.name == 'cardsDiscard' && evt.parent.name == 'orderingDiscard') return;
                for (const i of evt.cards) {
                    if (get.position(i, true) == 'd') cards.push(i);
                }
            });
            return cards;
        },
        filter(event, player) {
            return lib.skill.xinfan_xunxiangyin.getDiscardedCards().length > 0;
        },
        async cost(event, trigger, player) {
            const result = await player
                .chooseCardButton(lib.skill.xinfan_xunxiangyin.getDiscardedCards(), '选择一张本回合内进入弃牌堆的牌获得')
                .set('ai', button => get.buttonValue(button))
                .forResult();
            event.result = {
                bool: result.bool,
                cards: result.links,
            };
        },
        async content(event, trigger, player) {
            await player.gain(event.cards, 'gain2');
        },
    },
    xinfan_xunmingxiang: {
        intro: {
            content: 'mark',
        },
        forced: true,
        trigger: {
            player: 'phaseEnd',
            global: 'damageEnd',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/xunxiangxing:2", 
        async content(event, trigger, player) {
            async function effect(player, target) {
                const result = await player
                    .chooseControl('回复一点体力', '失去一点体力')
                    .set('prompt', `明香：选择一项令${get.translation(target)}执行`)
                    .set('ai', () => _status.event.match)
                    .set('match', get.attitude(player, target) > 0 ? '回复一点体力' : '失去一点体力')
                    .forResult();
                if (result.control == '回复一点体力') {
                    await target.recover();
                } else {
                    await target.loseHp();
                }
            }
            if (event.triggername == 'damageEnd') {
                trigger.player.addMark('xinfan_xunmingxiang', 1);
                if (trigger.player.countMark('xinfan_xunmingxiang') >= 3) {
                    trigger.player.clearMark('xinfan_xunmingxiang');
                    await effect(player, trigger.player);
                }
            } else {
                for (const target of game.filterPlayer()) {
                    target.addMark('xinfan_xunmingxiang', 1);
                    if (target.countMark('xinfan_xunmingxiang') >= 3) {
                        target.clearMark('xinfan_xunmingxiang');
                        await effect(player, target);
                    }
                }
            }
        },
    },
          //稻荷神御馔津
        xinfan_daofengmou: {
        trigger: {
            player: 'useCardToPlayered',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/daoheshenyuzhuanjing:2",        
        filter(event, player) {
            return get.name(event.card) == 'sha';
        },
        logTarget: 'target',
        frequent: true,
        async content(event, trigger, player) {
            trigger.target.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/feng.png`,[100,100])
            const result = await player.judge().forResult();

            if (['heart', 'diamond', 'club', 'spade'].includes(result.suit)) {
                const suit = result.suit;
                trigger.target.addSkill('xinfan_daofengmou_' + suit);
                trigger.target.addMark('xinfan_daofengmou_' + suit, 1, false);
            }
        },
        subSkill: {
            heart: {
                trigger: {
                    player: ['recoverBegin'],
                },
                intro: {
                    content: '下#次回复体力时，取消之',
                },
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    player.removeMark('xinfan_daofengmou_heart', 1, false);
                    trigger.cancel();
                    if (!player.countMark('xinfan_daofengmou_heart')) {
                        player.removeSkill('xinfan_daofengmou_heart');
                    }
                },
            },
            diamond: {
                trigger: {
                    player: ['drawBegin'],
                },
                intro: {
                    content: '下#次摸牌时，取消之',
                },
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    player.removeMark('xinfan_daofengmou_diamond', 1, false);
                    trigger.cancel();
                    if (!player.countMark('xinfan_daofengmou_diamond')) {
                        player.removeSkill('xinfan_daofengmou_diamond');
                    }
                },
            },
            spade: {
                trigger: {
                    source: 'damageBegin',
                },
                intro: {
                    content: '下#次造成伤害时，取消之',
                },
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    player.removeMark('xinfan_daofengmou_spade', 1, false);
                    trigger.cancel();
                    if (!player.countMark('xinfan_daofengmou_spade')) {
                        player.removeSkill('xinfan_daofengmou_spade');
                    }
                },
            },
            club: {
                trigger: {
                    player: 'useCard2',
                },
                intro: {
                    content: '下#次使用牌时，取消之',
                },
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    player.removeMark('xinfan_daofengmou_club', 1, false);
                    trigger.cancel();
                    if (!player.countMark('xinfan_daofengmou_club')) {
                        player.removeSkill('xinfan_daofengmou_club');
                    }
                },
            },
        },
    },
        xinfan_daoriyao: {
        trigger: {
           global: "phaseEnd",
        },
        audio: "ext:新繁/fenbao/yys/juesebao/daoheshenyuzhuanjing:2",
          filter(event, player) {
           return event.player != player;
                                },
       check: function (event, player) {
					return get.attitude(player, event.player) < 0;
				},
     prompt2(event, player) {
                    return `视为对${get.translation(event.player)}使用一张【杀】？`;
                },
    async content(event, trigger, player) {
        player.useCard({ name: "sha" }, trigger.player);
    },
       },
    xinfan_daoyueying: {
        filterTarget: true,
        enable: 'phaseUse',
        usable: 1,
        audio: "ext:新繁/fenbao/yys/juesebao/daoheshenyuzhuanjing:2",
        ai: {
            order: 9,
            result: {
                target: 9,
            },
        },
        async content(event, trigger, player) {
            const target = event.target;
            await target.draw(2);
            await target
                .chooseToUse(`###月影###是否无距离次数限制的使用一张牌？`)
                .set('filterCard', card => {
                    const player = _status.event.player;
                    return game.hasPlayer(i => player.canUse(card, i, false, false));
                })
                .set('filterTarget', (card, player, target) => {
                    return player.canUse(card, target, false, false);
                })
                .set('addCount', false);
        },
    },

          //本真三尾狐
        xinfan_huhuying: {
        trigger: {
           global: 'damageEnd',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/benzhensanweihu:2",
          filter(event, player) {
           return event.player != player && player.hujia > 0;
                                },
       check: function (event, player) {
					return get.attitude(player, event.player) < 0;
				},
     prompt2(event, player) {
                    return `视为对${get.translation(event.player)}使用一张【杀】？`;
                },
    async content(event, trigger, player) {
        player.changeHujia(-1);
        player.useCard({ name: "sha" }, trigger.player);
    },
       },

       						xinfan_hushexin: {
                            audio: "ext:新繁/fenbao/yys/juesebao/benzhensanweihu:2",
        trigger: {
            source: "damageEnd",
        },
        priority:15,
               forced: true,
    async content(event, trigger, player) {
        if(_status.currentPhase != player){
    player.gainPlayerCard(true, trigger.player,"he");
        }else{
            player.recover();
        }
       },
       },
                                 xinfan_hulinghe: {
                trigger: {
                     player: "phaseEnd",
                 },
                 forced: true,
        audio: "ext:新繁/fenbao/yys/juesebao/benzhensanweihu:1",
              async content(event,trigger,player){
                if(player.hujia > 0){
           await player.changeHujia(1);    
                }else{
                  await player.changeHujia(2);  
                }          
    },
    },


          //月读
                                  xinfan_yuehuang: {
        trigger: {
            player: 'damageEnd',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/yuedu:1",
               forced: true,
		getIndex: event => event.num,
    async content(event, trigger, player) {
        player.draw();
       },
       },
       xinfan_yuexvdan: {
                        mark: true,
                        marktext: '☯',
                        zhuanhuanji: true,
                        forced: true,
                        trigger: {
                            player: 'useCard2',
                            target: 'useCardToTargeted',
                        },
                        audio: "ext:新繁/fenbao/yys/juesebao/yuedu:2",
                        filter(event, player) {
                            return get.is.virtualCard(event.card) == Boolean(player.storage.xinfan_yuexvdan);
                        },
                        check(event, player, name) {
                            if (name == 'useCard2') {
                                return player.getUseValue(event.card) < 0;
                            }
                            if (name == 'useCardToTargeted') {
                                return get.effect(player, event.card, event.player, player) < 0;
                            }
                            return false;
                        },
                        prompt2(event) {
                            return `令${get.translation(event.card)}的无效？`;
                        },
                        content() {
                            if (!get.tag(trigger.card, 'damage')) {
                                const name = trigger.card.name;
                                game.broadcastAll(
                                    function (cardName, next) {
                                        _status.xinfan_yuexvdan = [cardName, lib.card[cardName]];
                                        lib.card[cardName] = next;
                                    },
                                    name,
                                    {
                                        audio: lib.card[name].audio,
                                        fullskin: lib.card[name].fullskin,
                                        fullimage: lib.card[name].fullimage,
                                        cardcolor: lib.card[name].cardcolor,
                                        image: lib.card[name].image,
                                        type: lib.card[name].type,
                                        subtype: lib.card[name].subtype,
                                        content() {
                                            player.logSkill('xinfan_yuehuang');
                                        },
                                    }
                                );
                            } else {
                                if (event.triggername == 'useCard2') {
                                    trigger.xinfan_yuexvdan = true;
                                } else {
                                    trigger.getParent('useCard').xinfan_yuexvdan = true;
                                }
                            }
                            player.changeZhuanhuanji('xinfan_yuexvdan');
                        },
                        group: ['xinfan_yuexvdan_remove','xinfan_yuexvdan_damage','xinfan_yuexvdan_hui'],
                        subSkill: {
                            remove: {
                                trigger: {
                                    global: 'useCardAfter',
                                },
                                silent: true,
                                filter(event) {
                                    return _status.xinfan_yuexvdan;
                                },
                                content() {
                                    game.broadcastAll(function () {
                                        lib.card[_status.xinfan_yuexvdan[0]] = _status.xinfan_yuexvdan[1];
                                        delete _status.xinfan_yuexvdan;
                                    });
                                },
                            },
                            damage: {
                                trigger: {
                                    global: 'damageBegin',
                                },
                                filter(event) {
                                    return event.getParent('useCard')?.xinfan_yuexvdan;
                                },
                                silent: true,
                                content() {
                                    trigger.cancel();
                                    player.logSkill('xinfan_yuehuang');
                                },
                            },
                                                                                    hui: {
        trigger: {
            player: 'xinfan_yuexvdanAfter',
        },
               forced: true,
                     async content(event, trigger, player) { 
              if(!player.hasMark('xinfan_yuexvdan_hui')){
                      player.addMark('xinfan_yuexvdan_hui');
                      player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/yuedu/xinfan_yuedu2.jpg"); 
              }else{
                      player.clearMark('xinfan_yuexvdan_hui');
                      player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/yuedu/xinfan_yuedu.jpg");                
              }
 },
                                 },
                        },
                    },
    xinfan_yuetianji: {
        audio: "ext:新繁/fenbao/yys/juesebao/yuedu:2",
        enable: 'chooseToUse',
        zhuanhuanji: true,
        mark: true,
        marktext: '☯',
        usable: 2,
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name)) return false;
            if (!player.storage.xinfan_yuetianji && player.hasSkill('xinfan_yuetianji_yang')) return false;
            if (player.storage.xinfan_yuetianji && player.hasSkill('xinfan_yuetianji_yin')) return false;
            return get.type(name) == 'basic' || get.type(name) == 'trick';
        },
        filter(event, player) {
            for (const name of lib.inpile) {
                const type = get.type(name);
                if (type == 'basic' || type == 'trick') {
                    if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) return true;
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j }, 'unsure'), player, event)) return true;
                        }
                    }
                }
            }
            return false;
        },
        chooseButton: {           
            dialog(event, player) {
                const list = [];
                for (const name of lib.inpile) {
                    const type = get.type(name);
                    if (!(type == 'basic' || type == 'trick')) continue;
                    if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) list.push([get.translation(get.type(name)), '', name]);
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j }, 'unsure'), player, event)) list.push(['基本', '', 'sha', j]);
                        }
                    }
                }
                player.logSkill('xinfan_yuetianji');
                return ui.create.dialog('天极', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                const player = _status.event.player;
                if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
                return player.getUseValue({ name: button.link[2], nature: button.link[3] });
            },
            backup(links, player) {
                return {
                    filterCard: true,
                    selectCard: 0,
                    position: 'hes',
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    precontent() {
                        player.changeZhuanhuanji('xinfan_yuetianji');
                        if (!player.storage.xinfan_yuetianji) {
                            const card = get.cardPile(c => get.name(c) == event.result.card.name && (!event.result.card.nature || get.nature(event.result.card) == event.result.card.nature));
                            if (!card) {
                                game.log('牌堆中没有符合条件的牌');
                                const evt = event.parent;
                                if (evt?.respondTo) {
                                    delete evt.result.used;
                                    evt.goto(0);
                                } else {
                                    event.parent.cancel();
                                }
                            } else {
                                event.result.cards = [card];
                                event.result.card = card;
                            }
                        }
                    },
                };
            },
        },
        ai: {
            order: 10,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
    },
    xinfan_yuehuoxing: {
        audio: "ext:新繁/fenbao/yys/juesebao/yuedu:2",
        zhuanhuanji: true,
        usable: 1,
        mark: true,
        marktext: '☯',
        trigger: {
            player: 'useCardAfter',
        },
        check: () => Math.random() > 0.5,
        prompt2(event, player) {
            return player.storage.xinfan_yuehuoxing ? '转换“天极”？' : '转换“虚诞”？';
        },
        content() {
            player.changeZhuanhuanji('xinfan_yuehuoxing');
            if (player.storage.xinfan_yuehuoxing) {
                player.changeZhuanhuanji('xinfan_yuexvdan');
                player.useSkill('xinfan_yuexvdan_hui');
            } else {
                player.changeZhuanhuanji('xinfan_yuetianji');
            }
        },
    },
                    //泷夜叉姬
                   xinfan_chalongyue: {
                                audio: "ext:新繁/fenbao/yys/juesebao/longyechaji:2",
            mod: {
                aiOrder(player, card, num) {
            if (num <= 0 || get.itemtype(card) !== "card" || get.type(card) !== "equip") {
                return num;
            }
            let eq = player.getEquip(get.subtype(card));
            if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
                return 0;
            }
        },
    },
    locked: false,
    enable: "phaseUse",
    usable: 1,
    position: "he",
    filterCard: true,
    selectCard: [1,2],
    allowChooseAll: true,
    check(card) {
        let player = _status.event.player;
        if (get.position(card) == "e") {
            let subs = get.subtypes(card);
            if (subs.includes("equip2") || subs.includes("equip3")) {
                return player.getHp() - get.value(card);
            }
        }
        return 6 - get.value(card);
    },   
    filter(event, player) {
		return player.countCards("he") >= 1;
	},
                            async content(event, trigger, player) {
                        const num = event.cards.length;
                        if(num > 0){
                                        const  result  = await player.chooseTarget(`###胧月###对一名角色造成1点伤害`)
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);      
                        }).forResult();
                         if(result.bool){
                         await result.targets[0].damage(1);
                }  
                        }
                        if(num > 1){
                             await player.recover();
                        }
                            },
            
                ai:{
    order:4,
    result:{
        player(player) {
            return 2;
        },
        target:-1,
    },
           },
           },
                                xinfan_chayueheng: {
    enable: "phaseUse",
    usable: 1,
                async content(event, trigger, player) {   
                const choiceList = ['侵略：造成伤害时，获得对方一张牌。','飞流：造成的伤害加一。','风疾：造成或受到的伤害视为体力流失。','不动：造成或受到伤害时，摸一张牌。',];
             const choices = ['侵略','飞流','风疾','不动'];
            var result = await player
            .chooseControl()
            .set('controls', choices)
            .set('choiceList', choiceList)
            .set('prompt','月恒： 请选择其中一项')
              .forResult();
            if (result.control == '侵略'){
            player.addTempSkill("xinfan_chayueheng_qin", { player: "xinfan_chayuehengBegin" });
            }else if (result.control == '飞流'){
            player.addTempSkill("xinfan_chayueheng_liu", { player: "xinfan_chayuehengBegin" });
            }else if (result.control == '风疾'){
            player.addTempSkill("xinfan_chayueheng_feng", { player: "xinfan_chayuehengBegin" });
            }else if (result.control == '不动'){
            player.addTempSkill("xinfan_chayueheng_dong", { player: "xinfan_chayuehengBegin" });
            }
                   },
        group: ['xinfan_chayueheng_kai'], 
        subSkill: {
            kai: { 
                 trigger: {
                    global: 'phaseBefore',
                    player: 'phaseEnd',
            },
        forced: true,
                             filter(event, player) {
                                    return game.phaseNumber == 0;
                                },
		async content(event, trigger, player) {
                 await player.useSkill('xinfan_chayueheng');
},
},
            qin: {
                audio: "ext:新繁/fenbao/yys/juesebao/longyechaji:1",
				mark: true,
                intro: {
                    content: '造成伤害后，获得目标一张牌',
					 name: '侵略',
                },
                charlotte: true,
        trigger: {
            source: "damageBegin",
        },
               forced: true,
                async content(event, trigger, player) {         
             player.gainPlayerCard(true, trigger.player,"he");
             player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/qinlue.png`,[100,100])
            },
            },
            liu: {
                audio: "ext:新繁/fenbao/yys/juesebao/longyechaji:1",
								mark: true,
                intro: {
                                   content: '造成的伤害加1',
                                   name: '飞流',
                },
                charlotte: true,
        trigger: {
            source: "damageBegin",
        },
               forced: true,
                async content(event, trigger, player) {   
                    player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/feiliu.png`,[100,100])      
                    trigger.num++;
            },
                      },  
            feng: {
                audio: "ext:新繁/fenbao/yys/juesebao/longyechaji:1",
												mark: true,
                intro: {
                                   content: '造成或受到的伤害视为体力流失',
                                   name: '风疾',
                },
                charlotte: true,
        trigger: {
            player: 'damageBegin',
            source: "damageBegin",
        },
               forced: true,
                async content(event, trigger, player) { 
                    player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/fengji.png`,[100,100])
                    trigger.cancel();
                    const num = trigger.num;
                    trigger.player.loseHp(num);
            },
                     },   
            dong: {
                audio: "ext:新繁/fenbao/yys/juesebao/longyechaji:1",
																mark: true,
                intro: {
                                   content: '造成或受到伤害时，摸一张牌',
                                   name: '不动',
                },
                charlotte: true,
        trigger: {
            player: 'damageBegin',
            source: "damageBegin",
        },
               forced: true,
                async content(event, trigger, player) {  
                    player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/budong.png`,[100,100])       
                    player.draw();
            },
                     
        },
    },
    },
                    
                    //伊邪娜美
                                 xinfan_meifenzheng: {
           forced: true,
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
                audio: "ext:新繁/fenbao/yys/juesebao/yixienamei:2",
                priority:15,
              async content(event,trigger,player){
        game.broadcastAll(function () {
                        ui.background.setBackgroundImage('extension/新繁/fenbao/yys/beijing/yixienamei.jpg');
                    })
                    if(_status.tempMusic != "ext:新繁/fenbao/yys/yinyue/zhanyushijiejintou.mp3"){
                      game.playBgmOL("ext:新繁/fenbao/yys/yinyue/zhanyushijiejintou.mp3"); 
                    }            
    },
            global: ['xinfan_meifenzheng_zheng'],
        subSkill: {   
                       zheng: {
                                          trigger: {
                    global: 'xinfan_meifenzhengAfter',
                },    
                                             filter(event, player) {
                                    return _status.currentPhase != player;
                                        }, 
                                              forced: true, 
                               async content(event,trigger,player){
               const  result  = await player.chooseTarget(`###纷争###对一名角色造成一点伤害`,
                function (card, player, target) {
return target.name != "xinfan_yixienamei";
},true)
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);      
                        }).forResult();
                         if(result.bool){
                         await result.targets[0].damage(1,);
                }                            
    },    
    },                                
        },   
                },  
xinfan_meichenlun: {
                        enable: "phaseUse",
                            marktext: '沉沦',
                         intro: {
                                   content: '跳过下一个回合',
                                   name: '沉沦',
                                 },
                                 audio: "ext:新繁/fenbao/yys/juesebao/yixienamei:2",
            filterTarget(card, player, target) {
               return target != player && !target.hasMark('xinfan_meichenlun') && !target.hasMark('xinfan_meichenlun_dikang');

             },
            selectTarget:1,
            async content(event, trigger, player) {
                        const target = event.target;
                        await target.addMark('xinfan_meichenlun', 1);     
                            },
            ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
        target(player, target) {
                return get.damageEffect(target, player, target);
            },
    },
           },
            global: ['xinfan_meichenlun_skip','xinfan_meichenlun_dikang'],
        subSkill: { 
            skip: {
                trigger: {
                    player: 'phaseBefore',
                },
                filter(event, player) {
                  return player.hasMark('xinfan_meichenlun');
                             }, 
                forced: true,
                async content(event, trigger, player) {
                    player.logSkill('xinfan_meichenlun');
                      await player.clearMark('xinfan_meichenlun');
                      await player.addMark('xinfan_meichenlun_dikang', 1); 
                    trigger.cancel();
                },
            },
            dikang: {
                  trigger: {
                    player: "phaseEnd",
               },
                                    marktext: '抵抗',
                         intro: {
                                   content: '不能成为“沉沦”的目标',
                                   name: '抵抗',
                                 },
                filter(event, player) {
                  return player.hasMark('xinfan_meichenlun_dikang');
                             }, 
                forced: true,
                async content(event, trigger, player) {
                   await player.clearMark('xinfan_meichenlun_dikang');
                },
            },
},
    },
                    //孔雀明王
    xinfan_quemili: {
        trigger: {
            global: 'useCard2',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/kongquemingwang:2",
        marktext: '翎',
        intro: {
            content: 'mark',
            name: '翎',
        },
        filter(event, player) {
            return event.card.name == 'sha' && event.player != player;
        },
        	check(event, player) {
							return get.attitude(player, event.player) < 0;
						},
        logTarget: 'player',
        prompt2(event, player) {
            return `你可以获得一枚“翎”标记。并进行判定，若为基本牌则取消之。`;
        },
        async content(event, trigger, player) {
            player.addMark('xinfan_quemili');
            const  result  = await player.judge(c => (get.type(c) == 'basic' ? 2 : -1)).forResult();
            if (get.type(result.card, player) == 'basic') {
                trigger.cancel();
                trigger.player.getStat('card').sha--;
            }
        },
                        group: ['xinfan_quemili_use'],
        subSkill: {
        use: {
                trigger: {
                      player: "phaseEnd",
                 },
                 forced: true,
     async content(event, trigger, player) {
          player.addMark('xinfan_quemili');
        },
             },
             },
    },
    xinfan_quekaiping: {
    audio: "ext:新繁/fenbao/yys/juesebao/kongquemingwang:1",
        forced: true,
        derivation: 'xinfan_quequewu',
        trigger: {
            player: ['xinfan_quemiliAfter', 'xinfan_quequewuAfter', 'xinfan_quemili_useAfter','xinfan_quequewu_useAfter'],
        },
        filter(event, player) {
            return player.countMark('xinfan_quemili') >= 5 || !player.countMark('xinfan_quemili');
        },
        async content(event, trigger, player) {
            if (player.countMark('xinfan_quemili') >= 5) {
                await player.recover(player.countMark('xinfan_quemili'));
                await player.draw(player.countMark('xinfan_quemili'));
                await player.changeSkills(['xinfan_quequewu'], ['xinfan_quemili']);
                player.markSkill('xinfan_quemili');
                player.tempBanSkill('xinfan_quequewu_use');
                player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/kongquemingwang/xinfan_kongquemingwang_jie.jpg");
                await player.addTempBackGroundOL("/extension/新繁/fenbao/yys/beijing/kongquemingwang.jpg", 0, {player: "phaseJieshuEnd"})
                if(_status.tempMusic != "ext:新繁/fenbao/yys/yinyue/jingjimeigui.mp3"){
                  game.playBgmOL("ext:新繁/fenbao/yys/yinyue/jingjimeigui.mp3"); 
                }
            } else {
                player.changeSkills(['xinfan_quemili'], ['xinfan_quequewu']);
                player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/kongquemingwang/xinfan_kongquemingwang.jpg");
            }
        },
    },
    xinfan_quequewu: {
     audio: "ext:新繁/fenbao/yys/juesebao/kongquemingwang:2",
        mod: {
            targetInRange(card, player, target) {
                if (card.name == 'sha') return true;
            },
            cardUsable(card, player, num) {
                if (card.name == 'sha') return Infinity;
            },
        },
        ai: {
            unequip: true,
        },
        trigger: {
            player: 'useCardAfter',
        },
        filter(event, player) {
            return event.card.name == 'sha' && player.countMark('xinfan_quemili') > 0;
        },
        async cost(event, trigger, player) {
            event.result = { bool: true };
        },
        async content(event, trigger, player) {
            player.removeMark('xinfan_quemili', 1);
        },
                group: ['xinfan_quequewu_use'],
        subSkill: {
        use: {
                trigger: {
                      player: "phaseEnd",
                 },
                 forced: true,
                            filter(event, player) {
            return player.hasMark('xinfan_quemili');
        }, 
     async content(event, trigger, player) {
         const num = player.countMark('xinfan_quemili');
         player.clearMark('xinfan_quemili');
           player.draw(num);
        },
             },

             },
    },
                    //言灵
    xinfan_yanyuzui: {
        trigger: {
            global: 'roundStart',
        },
                  audio: "ext:新繁/fenbao/yys/juesebao/yanling:2",
        async cost(event, trigger, player) {
            const vcard = get.inpileVCardList(i => !i[3]);
            const result = await player
                .chooseButton(['###语罪###请选择你要记录或删除的牌名（最多三张，已记录会自动删除）', [vcard, 'vcard']], [1, 3])
                .set('ai', button => {
                    const name = button.link[2];
                    let base = ['sha', 'shan', 'tao'].includes(name) ? 0.3 : 0;
                    return base + Math.random();
                })
                .forResult();
            const links = result.links.map(i => i[2]);
            event.result = {
                bool: result.bool,
                cost_data: {
                    do: links.filter(i => !player.getStorage('xinfan_yanyuzui_recorded').includes(i)),
                    undo: links.filter(i => player.getStorage('xinfan_yanyuzui_recorded').includes(i)),
                },
            };
        },
        content() {
            player.markAuto('xinfan_yanyuzui_recorded', event.cost_data.do);
            player.unmarkAuto('xinfan_yanyuzui_recorded', event.cost_data.undo);
        },
        ai: {
            combo: 'xinfan_yukuangmo',
        },
        group: ['xinfan_yanyuzui_use'],
        subSkill: {
            use: {
                trigger: {
                    player: ['useCardAfter', 'respondAfter'],
                },
                filter(event, player) {
                    return event.card && !player.getStorage('xinfan_yanyuzui_recorded').includes(event.card.name);
                },
                direct: true,
                content() {
                    player.markAuto('xinfan_yanyuzui_recorded', trigger.card.name);
                },
            },
            recorded: {
                charlotte: true,
                intro: {
                    content: '已记录牌名：$',
                },
            },
        },
    }, 
         xinfan_yankuangmo: {
          audio: "ext:新繁/fenbao/yys/juesebao/yanling:3",
        trigger: {
            global: 'useCard2',
        },
        filter(event, player) {
            return player != event.player && player.getStorage('xinfan_yanyuzui_recorded')?.includes(event.card.name);
        },
        check(event, player) {
            return (
                (event.targets || []).reduce((p, c) => {
                    p + get.effect(c, event.card, event.player, player);
                    return p;
                }, 0) < 0
            );
        },
        async content(event, trigger, player) {
            player.unmarkAuto('xinfan_yanyuzui_recorded', trigger.card.name);
            trigger.cancel();
            trigger.excluded.addArray(game.players);
        },
    },
    xinfan_yanzhenyan: {
                   audio: "ext:新繁/fenbao/yys/juesebao/yanling:2",
        usable: 1,
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name) || player.getStorage('xinfan_yanyuzui_recorded')?.includes(name)) return false;
            return true;
        },
        filter(event, player) {
            for (const name of lib.inpile) {
                if (player.getStorage('xinfan_yanyuzui_recorded')?.includes(name)) continue;
                if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) return true;
                if (name == 'sha') {
                    for (const j of lib.inpile_nature) {
                        if (event.filterCard(get.autoViewAs({ name: name, nature: j }, 'unsure'), player, event)) return true;
                    }
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                const list = [];
                for (const name of lib.inpile) {
                    if (player.getStorage('xinfan_yanyuzui_recorded')?.includes(name)) continue;
                    if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) list.push([get.type(name), '', name]);
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j }, 'unsure'), player, event)) list.push(['basic', '', 'sha', j]);
                        }
                    }
                }
                return ui.create.dialog('真言', [list, 'vcard']);
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                const player = _status.event.player;
                return player.getUseValue({ name: button.link[2], nature: button.link[3] });
            },
            filter: (button, player) => _status.event.getParent().filterCard({ name: button.link[2], nature: button.link[3] }, player, _status.event.getParent()),
            backup: links => {
                return {
                    selectCard: 0,
                    filterCard: false,
                    async precontent(event, trigger, player) {
                        player.logSkill('xinfan_yanzhenyan');
                        const links = event.parent.name == '_wuxie' ? event.parent._result.result.links[0] : event.parent._result.links[0];
                        const card = get.cardPile(links[2]);
                        if (card) {
                            await player.gain(card, 'draw');
                            event.result.card = card;
                            event.result.cards = [card];
                        } else {
                            game.log(player, '未能从牌堆顶获得指定牌');
                            player.popup('杯具');
                            const evt = event.parent;
                            if (evt?.respondTo) {
                                delete evt.result.used;
                                evt.goto(0);
                            } else {
                                event.parent.cancel();
                            }
                        }
                    },
                    viewAs: { name: links[0][2], nature: links[0][3] },
                };
            },
            prompt: links => '视为使用或打出' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]),
        },
        ai: {
            order: 7,
            result: {
                player: player => (_status.event.dying ? get.attitude(player, _status.event.dying) : 1),
            },
            fireAttack: true,
            respondSha: true,
            respondShan: true,
            save: true,
            skillTagFilter(player, tag) {
                const storage = player.getStorage('xinfan_yanyuzui_recorded');
                if (tag == 'fireAttack' && storage.includes('sha') && !storage.includes('huogong')) return false;
                if (tag == 'respondSha' && storage.includes('sha')) return false;
                if (tag == 'respondShan' && storage.includes('shan')) return false;
                if (tag == 'save' && storage.includes('tao')) return false;
                return true;
            },
        },
    },               
                    //聆海金鱼姬
                          xinfan_yulinghai: {
                                audio: "ext:新繁/fenbao/yys/juesebao/linghaijinyuji:3",
        enable: 'phaseUse',
        usable: 1,
                                    	marktext: '聆',
                         intro: {
                                   content: 'mark',
                                   name: '聆',
                                 },  
                          filter(event, player) {
							return player.countCards("he") >= 2 || player.hasMark('xinfan_yulinghai');
						},
                            async content(event, trigger, player) {
                        const num = player.countMark('xinfan_yulinghai');
            if (num > 0){
           await player.draw(2);
           await player.removeMark('xinfan_yulinghai', 1); 
            }else{
           await player.chooseToDiscard(2, true, "he");
           await player.addMark('xinfan_yulinghai', 3);
           }
        },
        group: ['xinfan_yulinghai_huihe'],                    
                subSkill: {   
                       huihe: {
                           trigger: {
                    player: ['xinfan_yulinghaiAfter','xinfan_yulingboAfter'],
                },  
                priority:25,
                audio: "ext:新繁/fenbao/yys/juesebao/linghaijinyuji:1",
                              forced: true,
                        filter(event, player) {
							return !player.hasMark('xinfan_yulinghai');
						},
                            async content(event, trigger, player) {
                            player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/linghai.png`,[100,100])    
                            player.insertPhase().skill=event.name;
                               },   
                               },                   
                                                             },                              
                                                                    
            ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
    },
           },
           },             
    xinfan_yulingbo: {
                trigger: {
                      global: "phaseEnd",
                 },
        filter(event, player) {
            return player.hasMark('xinfan_yulinghai');
        }, 
        			check(event, player) {
							return get.attitude(player, event.player) > 0;
						},
        audio: "ext:新繁/fenbao/yys/juesebao/linghaijinyuji:3",
              async content(event,trigger,player){
           await player.removeMark('xinfan_yulinghai', 1); 
                 const choiceList = ['对一名其他角色造成1点伤害','回复1点体力',];
                       const choices = ['选项一','选项二'];
                        var result = await trigger.player
                         .chooseControl()
                    .set('controls',choices)
                    .set('choiceList',choiceList)
                    .set("ai", () => {
                        if (trigger.player.isDamaged() && trigger.player.hp <= trigger.player.isDamaged()) {
                            return "选项二";
                        }else{
                            return "选项一";
                        }  
                        })
                                 .forResult();
                        if(result.control=="选项一"){
               const  result  = await trigger.player.chooseTarget(`###凌波###对一名其他角色造成1点伤害`,lib.filter.notMe)
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target,trigger.player,trigger.player,);      
                        }).forResult();
                         if(result.bool){
                         await result.targets[0].damage(1);
                }
                    }else if(result.control=="选项二"){
                        await trigger.player.recover();
                }                                               
    },
                },   
                    //骁浪荒川之主
                        xinfan_chuanxiaolang:{
                        enable: "phaseUse",
                        usable: 1,
                              audio: "ext:新繁/fenbao/yys/juesebao/xiaolanghuangchuanzhizhu:1",
                          filter(event, player) {
							return player.countCards("he") >= 1;
						},
                            async content(event, trigger, player) {
                            await player.chooseToDiscard(1, true, "he");
               const  result  = await player.chooseTarget(`###骁浪###对一名其他角色造成1点伤害`,lib.filter.notMe)
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);      
                        }).forResult();
                         if(result.bool){
         result.targets[0].addTempSkill('xinfan_chuanxiaolang_start');
                         await result.targets[0].damage();
                }
                            },
                                    subSkill: {   
                       start: {
                trigger: {
                                    target: 'useCardToTargeted',
                                    player: 'recoverBegin',
                                },
                                 mark: true,
                intro: {
                    content: '当前回合角色以外的其他角色对你使用牌或令你回复体力时,防止之',
                },
                charlotte: true,
filter(event, player) {
             if(event.source == player || event.source ==_status.currentPhase) return false;
                 return true;
                                },
                forced: true,
                content() {
          trigger.cancel();
          trigger.num = 0;
                },
            },
                        },
                                        ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
    },
           },
                                     },    
                                     
                                 xinfan_chuanchuannu: {
           forced: true,
    priority:15,
               audio: "ext:新繁/fenbao/yys/juesebao/xiaolanghuangchuanzhizhu:1",
                                                 trigger: {
            global: 'damageEnd',
        },
                                    marktext: '川',
                         intro: {
                                   content: 'mark',
                                   name: '川',
                                 },
              filter(event, player) {
                                    return event.source != player;
                                },
     getIndex: event => event.num,                           
        async content(event, trigger, player) {
                    player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/chuannu.png`,[100,100])
                    await player.addMark('xinfan_chuanchuannu', 1);
                    if(player.countMark('xinfan_chuanchuannu') > 3){
                    await player.clearMark('xinfan_chuanchuannu');       
                    player.insertPhase().skill=event.name;
                    }
       },   
              },   
                                             
    xinfan_chuanyili: {
                   audio: "ext:新繁/fenbao/yys/juesebao/xiaolanghuangchuanzhizhu:1",
                        forced: true,
                        trigger: {
                            global: 'roundStart',
                        },
                        filter(event, player) {
                            return player.isDead();
                        },
                        forceDie: true,
                        async content(event, trigger, player) {
                            const  result  = await player.chooseTarget('###屹立###对任意名其他角色造成一点伤害', [1, Infinity]).set('ai', target => {
                                const player = get.player();
                                return get.damageEffect(target, player, player);
                            }).forResult();
                            if (result.bool) {
                                for (const target of result.targets) {
                                    await target.damage();
                                }
                            }
                        },
                        group: ['xinfan_chuanyili_die'],
                        subSkill: {
                            die: {
                                trigger: {
                                    player: 'dieBegin',
                                },
                                forced: true,
                                async content(event, trigger, player) {
                                    let num = player.maxHP;
                                    if (num > 0) {
                                        const maps = {};
                                        while (num > 0) {
                                            const  result  = await player
                                                .chooseTarget(`###屹立###请选择分配的生命回复（剩余${num}点）`, (card, player, target) => target.isDamaged() && player != target)
                                                .set('ai', target => {
                                                    const player = get.player();
                                                    return get.recoverEffect(target, player, player);
                                                }).forResult();
                                            if (result.bool) {
                                                const next2 =
                                                    num == 1
                                                        ? {
                                                              bool: true,
                                                              numbers: [1],
                                                          }
                                                        : await player
                                                              .chooseNumbers('屹立', [{ prompt: '请选择你要分配数值', min: 1, max: num }], true)
                                                              .set('processAI', () => {
                                                                  return [get.event().numz];
                                                              })
                                                              .set('numz', num)
                                                              .forResult();
                                                if (next2.bool) {
                                                    const num2 = next2.numbers?.[0];
                                                    maps[result.targets[0].playerid] = (maps[result.targets[0].playerid] || 0) + num2;
                                                    num -= num2;
                                                }
                                            } else {
                                                break;
                                            }
                                        }
                                        if (Object.keys(maps).length) {
                                            for (const target of game.filterPlayer()) {
                                                if (maps[target.playerid]) {
                                                    await target.recover(maps[target.playerid]);
                                                }
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },      
                                                                        
                    //空相面灵气
      xinfan_miankongxiang: {
                        zhuanhuanji: true,
                        marktext: '☯',
                        mark: true,
                        forced: true, 
                        trigger: {
                            player: 'useCardToPlayered',
                            target: 'useCardToTargeted',
                        },
                       audio: "ext:新繁/fenbao/yys/juesebao/kongxiangmianlingqi:4",
                        filter(event, player) {
                            return !event.getParent('useCard').zhuanhuanji && event.targets.length == 1;
                        },
                        firstDo: true,
                        check(event, player) {
                            const card = event.card;
                            if (!player.storage.xinfan_miankongxiang) {
                                return get.effect(event.player, card, event.player, player) > 0;
                            } else {
                                return get.effect(event.target, card, event.target, player) > 0;
                            }
                        },
                        prompt2(event, player) {
                            const card = event.card;
                            if (!player.storage.xinfan_miankongxiang) {
                                return `令${get.translation(event.player)}视为对自己使用此牌（${get.translation(card)}）？`;
                            } else {
                                return `令${get.translation(event.target)}视为对自己使用此牌（${get.translation(card)}）？`;
                            }
                        },
                        intro: {
                            content(storage) {
                                if (storage) {
                                    return '当你不因此技能，使用牌指定目标或成为牌的目标时，目标视为对自己使用此牌';
                                }
                                return '当你不因此技能，使用牌指定目标或成为牌的目标时，来源视为对自己使用此牌';
                            },
                        },
                        async content(event, trigger, player) {
                            player.changeZhuanhuanji('xinfan_miankongxiang');
                            trigger.getParent('useCard').zhuanhuanji = true;
                            if (player.storage.xinfan_miankongxiang) {
                                trigger.getParent('useCard').targets = [trigger.player];
                                trigger.target = trigger.player;
                            player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/kongxiangmianlingqi/xinfan_kongxiangmianlingqi_hei.jpg");
                            } else {
                                trigger.getParent('useCard').player = trigger.target;
                                player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/kongxiangmianlingqi/xinfan_kongxiangmianlingqi_bai.jpg");
                            }
                        },
                    },
    xinfan_mianweiwo: {
        forced: true,
        trigger: {
            player: ['useCardAfter', 'damageBegin2'],
        },
        audio: "ext:新繁/fenbao/yys/juesebao/kongxiangmianlingqi:2",        
        filter(event, player, name) {
            return name == 'useCardAfter' ? event.targets.includes(player) : event.source != player;
        },
        async content(event, trigger, player) {
            if (event.triggername == 'useCardAfter') {
                await player.draw();
            } else {
                trigger.cancel();
            }
        },
    },             
                    //流光追月神
    xinfan_zhuiliuguang: {
        trigger: {
            global: 'roundStart',
        },
                            	marktext: '流光',
                         intro: {
                                   content: 'mark',
                                   name: '流光',
                                 },  
                audio: "ext:新繁/fenbao/yys/juesebao/liuguangzhuiyueshen:2",
              forced: true, 
        async content(event, trigger, player) {
            const num = player.countMark('xinfan_zhuiliuguang');
            if (num > 0){
                await player.recover(num);
                await player.clearMark('xinfan_zhuiliuguang');
            }
           await player.addMark('xinfan_zhuiliuguang', 3);
        },
    },
                        xinfan_zhuiqiwu: {
                trigger: {
                      global: "phaseBegin",
                 },
                            filter(event, player) {
            return player.hasMark('xinfan_zhuiliuguang');
        }, 
        audio: "ext:新繁/fenbao/yys/juesebao/liuguangzhuiyueshen:3",
              async content(event,trigger,player){
                 const choiceList = ['令一名角色摸2张牌','弃置场上2张牌',];
                       const choices = ['选项一','选项二'];
                        var result = await player
                         .chooseControl()
                     .set('controls',choices)
                      .set('choiceList',choiceList)
                                 .forResult();
                        if(result.control=="选项一"){
               const  result  = await player.chooseTarget(`###绮舞###令一名角色摸2张牌`)
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                         await result.targets[0].draw(2);
                         await player.removeMark('xinfan_zhuiliuguang', 1); 
                }
                    }else if(result.control=="选项二"){
                    let num = 2;
                    while (num > 0) {
                   const  result  = await player.chooseTarget(`###绮舞###弃置场上一张牌`)
               .set('ai', target => {
                                 const player = get.player();
                                        return get.effect(target, { name: 'guohe_copy' }, player, player);
                                    }).forResult();
                         if(result.bool){
                         await player.discardPlayerCard(result.targets[0], 'ej', true);
                        num -= 1;
                }
                }  
                         await player.removeMark('xinfan_zhuiliuguang', 1); 
                }                                
    },
    },

                                           xinfan_zhuininghui: {
                                audio: "ext:新繁/fenbao/yys/juesebao/liuguangzhuiyueshen:1",
       enable: 'phaseUse',
        usable: 1,
  
                    filter(event, player) {
            return player.countCards("he") >= 2;
        },                
		        filterCard: true,
                position: "he",
                selectCard:2,
                async content(event, trigger, player) {         
                     await player.addMark('xinfan_zhuiliuguang', 2);
            },
            },



                    //禅心云外镜
                                       xinfan_chanjiekong: {
                                audio: "ext:新繁/fenbao/yys/juesebao/chanxinyunwaijing:2",
       enable: 'phaseUse',
        usable: 1,
                    	marktext: '皆',
                         intro: {
                                   content: 'mark',
                                   name: '皆',
                                 },    
                    filter(event, player) {
            return !player.hasMark('xinfan_chanjiekong');
        },                
                async content(event, trigger, player) {         
                     const  result  = await player.chooseTarget(`###皆空###令一名角色将体力值流失至1点，然后其获得已损失体力值点护甲，你的下两个回合结束后，其交换体力值和已损失体力值，期间其手牌上限增加其护甲数量点。`)
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){   
                            await result.targets[0].addMark('xinfan_chanjiekong_kong');
                            await result.targets[0].loseHp(result.targets[0].hp -1);
                            await result.targets[0].changeHujia(result.targets[0].getDamagedHp());
                            await player.addMark('xinfan_chanjiekong', 3);
                }
            },
        group: ['xinfan_chanjiekong_kong'],
        global: ['xinfan_chanjiekong_mod'],
        subSkill: {   
                       kong: {
                           trigger: {
                    player: 'phaseEnd',
                },           
                        audio: "ext:新繁/fenbao/yys/juesebao/chanxinyunwaijing:2",
                                	marktext: '空',
                         intro: {
                                   content: 'mark',
                                   name: '空',
                                 },  
                     forced: true,           
                    filter(event, player) {
            return player.countMark('xinfan_chanjiekong') > 0;
        },                                                        
                       async content(event, trigger, player) {                                  
                 await player.removeMark('xinfan_chanjiekong', 1);           
                 if (player.countMark('xinfan_chanjiekong') == 0){
                  for (const target of game.filterPlayer()) {
                    if (target.hasMark('xinfan_chanjiekong_kong')) {
                        target.clearMark('xinfan_chanjiekong_kong');
            if (target.hp > target.getDamagedHp()) {
                await target.loseHp(target.hp - target.getDamagedHp());
            }else{
                await target.recover(target.getDamagedHp() - target.hp);
            }
                    }
                }  
                    
                    }
                    },    
            },
                        mod: {
                charlotte: true,
                mod: {
                    maxHandcard(player, num) {
                    if (player.hasMark('xinfan_chanjiekong_kong')) {
                        return num + player.hujia;
                        }
                    },
                },
            },
            
                        },           
                              ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
           target:2,
    },
           },          
                        },         
                    xinfan_chanjingming: {
        round: 1,
        trigger: {
            player: "phaseBegin",
        },
        audio: "ext:新繁/fenbao/yys/juesebao/chanxinyunwaijing:2",
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt2(event.skill))
                .set('ai', target => get.attitude(get.player(), target))
                .forResult();
        },
        async content(event, trigger, player) {
        const evt = event.getParent("phase", true);
        if (evt) {
        game.log(player, "结束了回合");
        evt.num = evt.phaseList.length;
        evt.goto(11);
       }
       const evtx = event.getParent("phaseUse", true);
       if (evtx) {
        evtx.skipped = true;
       } 
                        player.draw(2);
        if(event.targets[0] == player ){
                  player.tempBanSkill('xinfan_chanjiekong_kong');
        }                
        if(event.targets[0].countCards("j") > 0){
                    const cards = event.targets[0].getCards("j");
                    event.targets[0].discard(cards);
        }else{
            event.targets[0].insertPhase().skill=event.name;
         } 
        },
                                      ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
        target:2,
    },
           },  
    },            
                    //季
                        xinfan_jisiji: {
        trigger: {
            global: 'roundStart'
        },
                            forced: true,
        async content(event, trigger, player) {
                if(player.getStorage('xinfan_jisiji_used').includes("xinfan_xia")){         
                await player.setStorage('xinfan_jisiji_used',"xinfan_qiu");   
                await player.useSkill('xinfan_jisiji_xia'); 
                }else if(player.getStorage('xinfan_jisiji_used').includes("xinfan_qiu")){         
                await player.setStorage('xinfan_jisiji_used',"xinfan_dong");   
                await player.useSkill('xinfan_jisiji_qiu');  
                }else if(player.getStorage('xinfan_jisiji_used').includes("xinfan_dong")){         
                await player.setStorage('xinfan_jisiji_used',"xinfan_chun");     
                await player.useSkill('xinfan_jisiji_dong');           
                await player.addMark('xinfan_jiliuzhuan', 1); 
                }else{
                await player.setStorage('xinfan_jisiji_used',"xinfan_xia");
                await player.useSkill('xinfan_jisiji_chun'); 
                if(game.phaseNumber == 1){
                await player.addMark('xinfan_jiliuzhuan', 1);
                }
                }
        },
        subSkill: {
            dong: {
            	marktext: '冬',
                         intro: {
                                   content: 'mark',
                                   name: '冬',
                                 },                       
                        forced: true,
                   audio: "ext:新繁/fenbao/yys/juesebao/ji:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###冬###令任意名角色失去1点体力`, [1, Infinity])
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);      
                        }).forResult();
                         if(result.bool){
                     for (const target of result.targets) {
                                target.loseHp();
                }
                }
          player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/ji/xinfan_ji_chun.jpg");
            },
                        },
            xia: {
            	marktext: '夏',
                         intro: {
                                   content: 'mark',
                                   name: '夏',
                                 },
                        forced: true,
                   audio: "ext:新繁/fenbao/yys/juesebao/ji:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
        async content(event, trigger, player) {
               const  result  = await player.chooseTarget(`###夏###令任意名角色弃置2张牌`, [1, Infinity])
               .set('ai', target => {
                                        const player = get.player();
                                        return get.effect(target, { name: 'guohe_copy' }, player, player);
                                    }).forResult();
                         if(result.bool){
                     for (const target of result.targets) {
                                target.chooseToDiscard(2, true, "he");
                }
                }
          player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/ji/xinfan_ji_qiu.jpg");
            },
                      },  
            qiu: {
            	marktext: '秋',
                         intro: {
                                   content: 'mark',
                                   name: '秋',
                                 },
                        forced: true,
                   audio: "ext:新繁/fenbao/yys/juesebao/ji:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###秋###令任意名角色摸2张牌`, [1, Infinity])
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                     for (const target of result.targets) {
                            target.draw(2);
                }
                }
                player.draw();
          player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/ji/xinfan_ji_dong.jpg");
                             }, 
                     },   
            chun: {
            	marktext: '春',
                         intro: {
                                   content: 'mark',
                                   name: '春',
                                 },
                        forced: true,
                   audio: "ext:新繁/fenbao/yys/juesebao/ji:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###春###令任意一名角色回复1点体力`, [1, Infinity])
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                     for (const target of result.targets) {
                            target.recover();
                }
                }
                	await player.changeHujia();
          player.changeAvatarImageOL("extension/新繁/fenbao/yys/juesebao/ji/xinfan_ji_xia.jpg");    
        },
                },
 },
 },
 			xinfan_jiliuzhuan: {
 			            	marktext: '流转',
                         intro: {
                                   content: 'mark',
                                   name: '流转',
                                 },
                        forced: true,
				      audio: "ext:新繁/fenbao/yys/juesebao/ji:2",
						trigger: {
							player: "dying",
						},
				      filter(event, player) {
                            return player.countMark('xinfan_jiliuzhuan') > 0;
                        },
						async content(event, trigger, player) {						
					        await player.removeMark('xinfan_jiliuzhuan');				       
					        await player.recoverTo(player.maxHp)
					        await player.useSkill('xinfan_jisiji'); 
						},
					},
             
                    //平将门
                xinfan_pingluanzhen: {
                                audio: "ext:新繁/fenbao/yys/juesebao/pingjiangmen:1",
        enable: 'phaseUse',
		filterTarget(card, player, target) {
               return target != player && !player.getStorage('xinfan_pingluanzhen_used').includes(target);

             },
            selectTarget:1,
                async content(event, trigger, player) {        
					     const target = event.target;
                 await player.useCard({ name: 'juedou' },target, false);
            },
            group: ['xinfan_pingluanzhen_luan'],
                                subSkill: {
                                    luan: {
        trigger: {
            source: 'damageAfter',
        },
        priority:15,
               forced: true,
        filter(event, player) {
            return !player.getStorage('xinfan_pingluanzhen_used').includes(event.player) && _status.currentPhase == player;
                    },
                async content(event, trigger, player) { 
                                player.markAuto('xinfan_pingluanzhen_used',  trigger.player);
                                player.addTempSkill('xinfan_pingluanzhen_used');
                    },
                                        },

                            used: {
                                onremove: true,
                                intro: {
                                    content: '本回合指定过的目标：$',
                                },
                                mark: true,
                                charlotte: true,
                            },
                        },
            ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
        target(player, target) {
                return get.damageEffect(target, player, target);
            },
    },
           },
           },
              xinfan_pingbudu: {
  trigger: {
                    player: 'phaseEnd',
            },
    usable: 1,
    forced: true,
    audio: "ext:新繁/fenbao/yys/juesebao/pingjiangmen:1",
                async content(event, trigger, player) {   
                const choiceList = ['烈日：每回合每名角色首次受到你造成的伤害加1。','暖阳：每回合首次受到伤害后，你令你在内任意名角色回复1点体力。',];
             const choices = ['烈日','暖阳'];
            var result = await player
            .chooseControl()
            .set('controls', choices)
            .set('choiceList', choiceList)
            .set('prompt','布都： 请选择其中一项')
            .set("ai", () => {
                if (player.hp < 4) {
                    return "暖阳";
                }else{
                 return "烈日";
                }  
            })
              .forResult();
            if (result.control == '烈日'){
            player.addTempSkill("xinfan_pingbudu_lie", { player: "xinfan_pingbuduBegin" });
            }else if (result.control == '暖阳'){
            player.addTempSkill("xinfan_pingbudu_nuan", { player: "xinfan_pingbuduBegin" });
            }
                   },
        group: ['xinfan_pingbudu_kai'], 
        subSkill: {
            kai: { 
                 trigger: {
                    global: 'phaseBefore',
                    player: 'phaseEnd',
            },
        forced: true,
                             filter(event, player) {
                                    return game.phaseNumber == 0;
                                },
		async content(event, trigger, player) {
                 await player.useSkill('xinfan_pingbudu');
},
},
            lie: {
                audio: "ext:新繁/fenbao/yys/juesebao/pingjiangmen:1",
				mark: true,
                intro: {
                    content: '每回合每名角色首次受到你造成的伤害加1。',
					 name: '烈日',
                },
                charlotte: true,
        trigger: {
            source: "damageBegin",
        },
        filter(event, player) {
            return !player.getStorage('xinfan_pingbudu_used').includes(event.player);
                    },
               forced: true,
                async content(event, trigger, player) {
            player.markAuto('xinfan_pingbudu_used',  trigger.player);
            player.addTempSkill('xinfan_pingbudu_used');                     
             trigger.num++;
            },
            },
            nuan: {
                audio: "ext:新繁/fenbao/yys/juesebao/pingjiangmen:1",
								mark: true,
                intro: {
                                   content: '每回合首次受到伤害后，你令你在内任意名角色回复1点体力。',
                                   name: '暖阳',
                },
                charlotte: true,
                usable: 1,
        trigger: {
            player: "damageAfter",
        },
               forced: true,
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###暖阳###与任意名角色回复1点体力`, [1, Infinity],lib.filter.notMe)
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                     for (const target of result.targets) {
                        target.recover();
                }
                }
                player.recover();
            },
                      },  
                                                  used: {
                                onremove: true,
                                intro: {
                                    content: '本回合发动过的目标：$',
                                },
                                mark: true,
                                charlotte: true,
                            },
},  
},  
            xinfan_pingjiaoyang: {
                audio: "ext:新繁/fenbao/yys/juesebao/pingjiangmen:2",
                intro: {
                content: '造成或受到的伤害次数不小于你的体力上限后，平将门获得额外回合',
                name: '骄阳',
                },
        trigger: {
            player: 'damageEnd',
            source: "damageEnd",
        },
               forced: true,
                async content(event, trigger, player) {          
            await player.addMark('xinfan_pingjiaoyang', 1);
            if(player.countMark('xinfan_pingjiaoyang') >= player.maxHp){
            await player.clearMark('xinfan_pingjiaoyang'); 
            const next = player.insertPhase("xinfan_shixi");
            next.set("phaseList", ["phaseDraw", "phaseUse"]);
            player.tempBanSkill(event.name, "roundStart", false);
            }                   
            },
                     
        },
                    //须佐之男
    xinfan_xushenyou: {
        trigger: {
            global: 'roundStart',
            player: 'phaseZhunbeiBegin',
        },
                 audio: "ext:新繁/fenbao/yys/juesebao/xuzuozhinan:1",
            priority:15,
        async cost(event, trigger, player) {
            event.result =
                event.triggername == 'roundStart'
                    ? await player
                          .chooseTarget(`###神佑###是否庇护任意名其他角色？`, [1, Infinity], lib.filter.notMe)
                          .set('ai', target => {
                              const player = get.player();
                              return get.attitude(player, target);
                          })
                          .forResult()
                    : await player
                          .chooseTarget(`###神佑###对一名其他角色造成一点伤害并获得一点护甲？`, 1, lib.filter.notMe)
                          .set('ai', target => {
                              const player = get.player();
                              return get.damageEffect(target, player, player);
                          })
                          .forResult();
        },
        async content(event, trigger, player) {
            for (const target of event.targets) {
                if (event.triggername == 'phaseZhunbeiBegin') {
                    await target.damage(1);
                    await player.changeHujia(1);
                } else {
                    target.addTempSkill('xinfan_xushenyou_shelter', { player: 'phaseZhunbeiAfter' });
                }
            }
        },
        subSkill: {
            shelter: {
                mark: true,
                marktext: '庇护',
                intro: {
                    content: '庇护',
                },
                trigger: {
                    player: 'phaseZhunbeiBegin',
                },
                        audio: "ext:新繁/fenbao/yys/juesebao/xuzuozhinan:2",
                    priority:15,
                forced: true,
                async content(event, trigger, player) {
                    const filter =
                        game.countPlayer(i => i.hasSkill('xinfan_xushenyou')) > 1
                            ? lib.filter.all
                            : function (card, player, target) {
                                  return !target.hasSkill('xinfan_xushenyou');
                              };
                    debugger;
                    const result = await player
                        .chooseTarget(filter, `###神佑###令 须佐之男  对一名其他角色造成一点伤害并获得一点护甲，然后你本回合内造成伤害时，防止之？`, 1)
                        .set('ai', target => {
                            const player = get.player();
                            return get.damageEffect(target, player, player);
                        })
                        .forResult();
                    if (result.bool) {
                        const sources = game.filterPlayer(i => i.hasSkill('xinfan_xushenyou'));
                        if (sources.length == 1) {
                            await result.targets[0].damage(1, sources[0]);
                            await sources[0].changeHujia(1);
                        } else {
                            const sources2 = sources.filter(i => !result.targets.includes(i));
                            for (const target of sources2) {
                                await result.targets[0].damage(1, target);
                                await target.changeHujia(1);
                            }
                        }
                        player.addTempSkill('xinfan_xushenyou_undamage');
                    }
                },
            },
            undamage: {
                mark: true,
                marktext: '庇护',
                intro: {
                    content: '本回合无法造成伤害',
                },
                trigger: {
                    source: 'damageBegin',
                },
                forced: true,
                content() {
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        player(card) {
                            if (get.tag(card, 'damage')) {
                                return 'zeroplayertarget';
                            }
                        },
                    },
                },
            },
        },
    },
    xinfan_xushenfa: {
        trigger: {
            source: 'damageBegin',
        },
        filter(event, player) {
            return event.card?.name == 'sha' || event.num >= event.player.hp;
        },
                   audio: "ext:新繁/fenbao/yys/juesebao/xuzuozhinan:1",
        forced: true,
        async content(event, trigger, player) {                 
            if (trigger.card?.name == 'sha') trigger.nature = 'thunder';
            if (trigger.num >= trigger.player.hp) {
            trigger.cancel();
            const target = trigger.player;
                target.storage.xinfan_xuxingjian = {
                    name1: target.name1,
                };
                await target.reinitCharacter(target.name1, 'xinfan_tianyuyuzhan');
                if (target.name2) {
                    await target.reinitCharacter(target.name2, 'xinfan_tianyuyuzhan');
                    target.storage.xinfan_xuxingjian.name2 = target.name2;
                }
                const next = target.discard(target.getCards('hej'));
                next.discarder = player;
                await next;
                target.recoverTo(2);
            }
        },
    },
    
                    //天羽羽斩
    xinfan_xuxingjian: {
        init(player) {
            if (typeof game.checkResult === 'function') {
                const origin_checkResult = game.checkResult;
                const origin_gamePlayers = game.players.slice();
                const origin_gameDead = game.dead.slice();
                game.checkResult = function () {
                    game.players = origin_gamePlayers.filter(i => !i.hasSkill('xinfan_xuxingjian'));
                    game.dead = origin_gameDead.concat(origin_gamePlayers.filter(i => i.hasSkill('xinfan_xuxingjian')));
                    origin_checkResult.apply(this, arguments);
                    game.players = origin_gamePlayers;
                    game.dead = origin_gameDead;
                };
            }
            if (typeof game.checkOnlineResult === 'function') {
                const origin_checkResult = game.checkResult;
                const origin_gamePlayers = game.players.slice();
                const origin_gameDead = game.dead.slice();
                game.checkOnlineResult = function () {
                    game.players = origin_gamePlayers.filter(i => !i.hasSkill('xinfan_xuxingjian'));
                    game.dead = origin_gameDead.concat(origin_gamePlayers.filter(i => i.hasSkill('xinfan_xuxingjian')));
                    origin_checkResult.apply(this, arguments);
                    game.players = origin_gamePlayers;
                    game.dead = origin_gameDead;
                };
            }
            game.checkResult();
        },
        group: ['xinfan_xuxingjian_skip'],
        subSkill: {
            skip: {
                trigger: {
                    player: 'phaseBefore',
                },
                forced: true,
                content() {
                    trigger.cancel();
                },
            },
        },
        trigger: {
            player: 'dieBegin',
        },
        filter(event, player) {
            return player.storage.xinfan_xuxingjian;
        },
        forced: true,
        async content(event, trigger, player) {
            trigger.cancel();
            await player.reinitCharacter(player.name1, player.storage.xinfan_xuxingjian.name1);
            if (player.storage.xinfan_xuxingjian.name2) {
                await player.reinitCharacter(player.name2, player.storage.xinfan_xuxingjian.name2);
            }
             player.recoverTo(1);
            delete player.storage.xinfan_xuxingjian;
        },
    },

                    //雪御前
                        xinfan_xueqianxue: {
                   audio: "ext:新繁/fenbao/yys/juesebao/xueyuqian:3",
        forced: true,
        mod: {
            cardnature(card) {
                if (card.name == 'sha') return 'ice';
            },
        },
        trigger: {
            player: 'useCardToPlayered',
        },
        filter(event, player) {
            return event.card.name == 'sha';
        },
        content() {
            trigger.getParent().directHit.add(trigger.target);
        },
    },
       xinfan_xuexuezhan: {
                        forced: true,
        trigger: {
            player: 'useCardAfter',
        },
                filter(event, player) {
            return event.card?.name == 'sha'&& event.targets.some(i => i.isAlive());
        },
                            priority:15,
                            audio: "ext:新繁/fenbao/yys/juesebao/xueyuqian:2",
                        marktext: '雪',
                        intro: {
                            content: 'mark',
                        },
                        async content(event, trigger, player) {
                          const targets = trigger.targets.filter(i => i.isAlive());
                                    for (const target of targets) {
                                  await target.addMark('xinfan_xuexuezhan', 2);
                                  if(target.countMark('xinfan_xuexuezhan') >= target.hp){
                                    target.clearMark('xinfan_xuexuezhan');
                                    target.loseHp();
                                  }
                                   }
                            },
                        global: ['xinfan_xuexuezhan_check'],
                        subSkill: {
                            check: {
                                 trigger: {
                                  player: ['damageEnd','loseHpEnd'],
                                   },
                                filter(event, player) {
                                    return event.num < 0 && player.countMark('xinfan_xuexuezhan') >= player.hp;
                                },
                                forced: true,
                                async content(event, trigger, player) {
                                    player.clearMark('xinfan_xuexuezhan');
                                    player.loseHp();
                                },
                            },
                            },
                    },
    
           xinfan_xuelongli: {
           forced: true,
    priority:15,
                            audio: "ext:新繁/fenbao/yys/juesebao/xueyuqian:2",
                                                 trigger: {
            global: 'phaseBefore',
            player: 'phaseBegin',
        },
              filter(event, player) {
                                    return game.phaseNumber == 0 || _status.currentPhase == player;
                                },
        async content(event, trigger, player) {
                         if(!player.hujia){
                            await player.changeHujia(2);
                         }else {
                    await player.draw(2);
                }
       },     
              },
       
       
       
                    //荒骷髅
    xinfan_kuhaixi: {
    forceDie: true,
          audio: "ext:新繁/fenbao/yys/juesebao/huangkulou:2",
        enable: 'phaseUse',
        usable: 1,
        hiddenCard(player, name) {
            return name == 'sha';
        },
        filter(event, player) {
            if (
                event.filterCard(
                    get.autoViewAs(
                        {
                            name: 'sha',
                            storage: {
                                xinfan_kuhaixi: true,
                            },
                        },
                        'unsure'
                    ),
                    player,
                    event
                )
            )
                return true;
            for (const j of lib.inpile_nature) {
                if (
                    event.filterCard(
                        get.autoViewAs(
                            {
                                name: 'sha',
                                nature: j,
                                storage: {
                                    xinfan_kuhaixi: true,
                                },
                            },
                            'unsure'
                        ),
                        player,
                        event
                    )
                )
                    return true;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                const list = [];
                if (
                    event.filterCard(
                        get.autoViewAs(
                            {
                                name: 'sha',
                                storage: {
                                    xinfan_kuhaixi: true,
                                },
                            },
                            'unsure'
                        ),
                        player,
                        event
                    )
                )
                    list.push(['basic', '', 'sha']);
                for (var j of lib.inpile_nature) {
                    if (
                        event.filterCard(
                            get.autoViewAs(
                                {
                                    name: 'sha',
                                    nature: j,
                                    storage: {
                                        xinfan_kuhaixi: true,
                                    },
                                },
                                'unsure'
                            ),
                            player,
                            event
                        )
                    )
                        list.push(['basic', '', 'sha', j]);
                }
                return ui.create.dialog('骸袭', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard(
                    {
                        name: button.link[2],
                        nature: button.link[3],
                        storage: {
                            xinfan_kuhaixi: true,
                        },
                    },
                    player,
                    _status.event.getParent()
                );
            },
            check(button) {
                const player = _status.event.player;
                return player.getUseValue({
                    name: button.link[2],
                    nature: button.link[3],
                    storage: {
                        xinfan_kuhaixi: true,
                    },
                });
            },
            backup(links, player) {
                return {
                    filterCard: false,
                    selectCard: 0,
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        storage: {
                            xinfan_kuhaixi: true,
                        },
                    },
                    async precontent(event, trigger, player) {
                        player.logSkill('xinfan_kuhaixi');
                        await player.loseHp();
                        event.getParent().addCount = false;
                        if (player.isDead()) {
                            player.useResult(event.result, event.getParent()).forceDie = true;
                        }
                    },
                };
            },
            prompt(links, player) {
                return '流失一点体力视为使用' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]);
            },
        },
        mod: {
                        targetInRange(card) {
                if (card.storage && card.storage.xinfan_kuhaixi) {
                    return true;
                }
            },
                        cardUsable(card, player, num) {
                if (card.storage && card.storage.xinfan_kuhaixi) {
                    return Infinity;
                }
            },
        },
                group: ['xinfan_kuhaixi_direct'],
        subSkill: {
            direct: {
            forceDie: true,
                trigger: {
                    player: 'useCardToPlayered',
                },
                filter(event, player) {
                    return event.card?.storage?.xinfan_kuhaixi;
                },
                direct: true,
                content() {
                    trigger.getParent().directHit.add(trigger.target);
                },
            },
        },

        ai: {
            order: 4.3,
            result: {
                player(player) {
                    return player.hp - 2;
                },
            },
        },
    },
    xinfan_kuliehun: {
          audio: "ext:新繁/fenbao/yys/juesebao/huangkulou:1",
        forced: true,
        trigger: {
            source: 'damageBegin',
        },
        usable: 1,
        init() {
            game.addGlobalSkill('xinfan_kuliehun_die');
        },
        filter(event, player) {
            return player.isDamaged();
        },
        content() {
            trigger.num++;
        },
        subSkill: {
            die: {
            forceDie: true,
                trigger: {
                    player: 'damageBegin',
                },
                usable: 1,
                filter(event, player) {
                    const source = event.getParent('useCard').player;
                    if (!source) return false;
                    if (source.hasSkill('xinfan_kuliehun') && game.dead.includes(source)) return true;
                    return false;
                },
                forced: true,
                async content(event, trigger, player) {
              game.playVideoOL("/extension/新繁/fenbao/yys/shipin/liehun.MP4",999);
                     await new Promise(r => setTimeout(r, 7000));
                    trigger.num+=2;
                },
            },
        },
    },
			xinfan_kuzhanqi: {
				      audio: "ext:新繁/fenbao/yys/juesebao/huangkulou:1",
						trigger: {
							global: "dying",
						},
						check(event, player) {
							return player.countCards("sh", { name: "tao" }) == 0 && get.attitude(player, event.player) > 0;
						},
                        limited: true,
						mark: true,
						intro: {
							content: "limited",
						},
						init: (player, skill) => (player.storage[skill] = false),
						prompt2(event) {
							return `是否令${get.translation(event.player)}回复至1点体力，并获得你已损失体力值点护甲？`;
						},
						async content(event, trigger, player) {
                                    game.broadcastAll(function () {
                        ui.background.setBackgroundImage('extension/新繁/fenbao/yys/beijing/huangkulou.jpg');
                    })
                    game.playBgmOL("ext:新繁/fenbao/yys/yinyue/kugushizhang.mp3");  
                            player.awakenSkill('xinfan_kuzhanqi');
							trigger.player.recoverTo(1);
							await trigger.player.changeHujia(2);
                            const next = player.insertPhase("xinfan_shixi");
                            next.set("phaseList", ["phaseDraw", "phaseUse"]);
						},
					},
					
                    //神堕八岐大蛇
	xinfan_sheqiying: {
		subSkill: {
			cards: {
				sub:true,
				name: "虚空",
				mark: true,
				marktext: "蛇",
				intro: {
					markcount:"expansion",
					mark(dialog, content, player) {
						let cards = player.getExpansions("xinfan_sheqiying_cards");
						if (player.isUnderControl(true)) {
							if (cards.length) dialog.addAuto(cards);
							else dialog.addText("虚空中没有牌");
							dialog.addText(`虚空中有${player.countMark("xinfan_sheqiying_hp")}点体力`);
						} else {
							if (cards.length) dialog.addText("虚空中共有" + get.cnNumber(cards.length) + "张牌");
							else dialog.addText("虚空中没有牌");
							dialog.addText(`虚空中有${player.countMark("xinfan_sheqiying_hp")}点体力`);
						}
					},
				},
			},
		},
    priority:15,
		audio: "ext:新繁/fenbao/yys/juesebao/shenduobaqidashe:2",
        trigger: {
            global: 'phaseBefore',
            player: 'phaseEnd',
        },
        forced: true,
                             filter(event, player) {
                                    return game.phaseNumber == 0 || _status.currentPhase == player;
                                },
		async content(event, trigger, player) {
			let next = player.addToExpansion(player.getCards('h'), "giveAuto", player)
			next.gaintag.add("xinfan_sheqiying_cards");
			await next;
			player.setMark("xinfan_sheqiying_hp", player.hp, false)
			player.maxHp = 2;
			player.update();
            await player.reinitCharacter(player.name1 == 'xinfan_shenduobaqidashe' ? player.name1 : player.name2, 'xinfan_wunvzhiyuan');
        },
    },
    xinfan_shezhongyan: {
                           audio: "ext:新繁/fenbao/yys/juesebao/shenduobaqidashe:1",
        init(player, skill) {
            const next = game.createEvent(skill);
            next.player = player;
            next.setContent(lib.skill[skill].content);
        },
        async content(event, trigger, player) {
			player.logSkill('xinfan_shezhongyan');
			let num = player.countMark("xinfan_shezhongyan") || 0;
			player.clearMark("xinfan_shezhongyan", false);
			if (player.countMark("xinfan_sheqiying_hp")) {
				player.hp = player.countMark("xinfan_sheqiying_hp");
				player.clearMark("xinfan_sheqiying_hp", false);
				player.update();
			}
			let cards = player.getExpansions("xinfan_sheqiying_cards")
			player.directgain(cards, "gain2");
			player.removeGaintag("xinfan_sheqiying_cards", cards);
            if (num > 0) {
              await player.recover(num);
                const maps = {};
                while (num > 0) {
                    const  result  = await player.chooseTarget(`###終焉###请选择分配伤害的目标（剩余${num}点）`, 1).set('ai', target => {
                        const player = get.player();
                        return get.damageEffect(target, player, player);
                    }).forResult();
                    if (result.bool) {
                        const next2 =
                            num == 1
                                ? {
                                      bool: true,
                                      numbers: [1],
                                  }
                                : await player
                                      .chooseNumbers('終焉', [{ prompt: '请选择你要分配数值', min: 1, max: num }], true)
                                      .set('processAI', () => {
                                          return [get.event().numz];
                                      })
                                      .set('numz', num)
                                      .forResult();
                        if (next2.bool) {
                            const num2 = next2.numbers?.[0];
                            maps[result.targets[0].playerid] = (maps[result.targets[0].playerid] || 0) + num2;
                            num -= num2;
                        }
                    } else {
                        break;
                    }
                }
                if (Object.keys(maps).length) {
                    for (const target of game.filterPlayer()) {
                        if (maps[target.playerid]) {
                            await target.damage(maps[target.playerid]);
                        }
                    }
                }
            }
        },
    },

                    //巫女之怨
    xinfan_shebeiming: {
                       audio: "ext:新繁/fenbao/yys/juesebao/wunvzhiyuan:2",
        init(player, skill) {
            const next = game.createEvent(skill);
            next.player = player;
            next.setContent(lib.skill[skill].content);
        },
        content() {
            player.logSkill('xinfan_shebeiming');
            player.draw(3);
            player.recoverTo(2);
        },
    },
    xinfan_shejishen: {
    audio: "ext:新繁/fenbao/yys/juesebao/wunvzhiyuan:2",
    priority:15,
		forced: true,
        trigger: {
            player: ['phaseZhunbeiBegin', 'dieBefore'],
        },
        async content(event, trigger, player) {
             if (event.triggername == 'dieBefore') {
                                trigger.cancel();
                            }
			player.maxHp = 4;
			player.update();
			player.setMark("xinfan_shezhongyan",player.hp),false;
            await player.reinitCharacter(player.name1 == 'xinfan_wunvzhiyuan' ? player.name1 : player.name2, 'xinfan_shenduobaqidashe');
        },
    },
                    //祸津神

                        xinfan_huohuozhou: {
                   audio: "ext:新繁/fenbao/yys/juesebao/huojingshen:2",
       trigger: {
            player: "phaseUseEnd",
        },
                   forced: true,
                        async content(event, trigger, player) {    
                    for (const target of game.filterPlayer()) {
                    if (target.hasSkill('xinfan_huohuozhou_mark')) {
                        target.removeSkill('xinfan_huohuozhou_mark');
                    }
                }  
                   const  result  = await player.chooseTarget(`###祸咒###令一枚角色获得“祸咒”`,lib.filter.notMe)
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);      
                        }).forResult();
                         if(result.bool){
                         await result.targets[0].addSkill('xinfan_huohuozhou_mark');
                }
                         player.damage(1, 'nosource');   
            },
         group: ['xinfan_huohuozhou_damage'],
        subSkill: {
            mark: {
                mark: true,
                intro: {
                    content: '每回合一次,huojingshen受到伤害后，你受到1点伤害。',
                },
                charlotte: true,
            },
            damage: {
                usable: 1,
                forced: true,
                trigger: {
                    player: 'damageEnd',
                },
                audio: "ext:新繁/fenbao/yys/juesebao/huojingshen:2",
                priority:5,
                filter(event, player) {
             return game.hasPlayer(i => i.hasSkill('xinfan_huohuozhou_mark')) && event.num > 0;
                },
                 async content(event, trigger, player) {    
                    for (const target of game.filterPlayer()) {
                    if (target.hasSkill('xinfan_huohuozhou_mark')) {
                        target.damage(1, 'nosource');
                    }
                }  
                },
            },
             },
            },
                                xinfan_huodaogao: {
                   audio: "ext:新繁/fenbao/yys/juesebao/huojingshen:2",
        trigger: {
           global: 'damageEnd',
        },
        priority:15,
        filter(event, player) {
            return !player.getStorage('xinfan_huodaogao_used').includes(event.player);
        },
        	check(event, player) {
							return get.attitude(player, event.player) > 0;
						},
                prompt2(event, player) {
             return `${get.translation(event.player)}受到了伤害，是否令其获得一点护甲？`;
        },
        async content(event, trigger, player) {
            await trigger.player.changeHujia(1);
            player.markAuto('xinfan_huodaogao_used', trigger.player);
            player.addTempSkill('xinfan_huodaogao_used');
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true,
                intro: {
                    content: '已发动技能目标：$',
                },
            },
        },
 },

                    //蝉冰雪女
                               xinfan_xueyongdong: {
        enable: 'phaseUse',
        usable: 1,
        marktext: '永冻',
                         intro: {
                                   content: '下个回合改为摸2张牌并跳过回合',
                                   name: '永冻',
                                 },
                   audio: "ext:新繁/fenbao/yys/juesebao/chanbingxuenv:2",
  		filterTarget(card, player, target) {
               return target != player;
             },
            selectTarget:1,
            filter(event, player){
            return game.hasPlayer(function(current) {
            return current != player;
            });
            },
                async content(event, trigger, player) {        
					     const target = event.target;  
                await player.changeHujia(1);
                await player.addTempBackGroundOL("/extension/新繁/fenbao/yys/beijing/chanbingxuenv.jpg", 0, {player: "phaseBefore"})
                  if(_status.tempMusic != "ext:新繁/fenbao/yys/yinyue/xueyu.mp3"){ 
                    game.playBgmOL("ext:新繁/fenbao/yys/yinyue/xueyu.mp3");   
                    }
                          await player.addMark('_xinfan_yongdong', 1);
                          await target.addMark('_xinfan_yongdong', 1);        
                },                           
                ai:{
    order:1,
    result:{
        player(player) {
            return 2;
        },
        target:-1,
    },
           },
},

               xinfan_xueshuanghan: {
                                    audio: "ext:新繁/fenbao/yys/juesebao/chanbingxuenv:2",
                        trigger: {
                            global: ["phaseEnd","_xinfan_yongdongAfter"],
                        },
                                marktext: '霜寒',
                         intro: {
                                   content: '此标记数量大于2后清除,蝉冰雪女会分配一点伤害或弃置场上一张牌',
                                   name: '霜寒',
                                 },
               forced: true,
    async content(event, trigger, player) {
         player.addMark('xinfan_xueshuanghan', 1);
       },
               group: ['xinfan_xueshuanghan_shang'],
        subSkill: {                  
          shang: {
                      trigger: {
                            player: 'xinfan_xueshuanghanAfter',
                        },
                        forced: true,
                        filter(event, player) {
                            let num = game.filterPlayer().reduce((sum, cur) => sum + cur.countMark('xinfan_xueshuanghan'), 0);
                            return num > 2;
                        },
               async content(event, trigger, player) {
               await trigger.player.clearMark('xinfan_xueshuanghan');
                                         const choiceList = ['造成一点伤害','弃置场上一张牌',];
                       const choices = ['选项一','选项二'];
                        var result = await player
                         .chooseControl()
                     .set('controls',choices)
                      .set('choiceList',choiceList)
                                 .forResult();
                        if(result.control=="选项一"){
                         const  result  = await player.chooseTarget(`对一名角色造成一点伤害`).set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);	  
                        }).forResult();
                
                        if (result.bool) {
                              await result.targets[0].damage(1,);
                                 }
                    }else if(result.control=="选项二"){
               const  result  = await player.chooseTarget(`弃置场上一张牌`)
               .set('ai', target => {
                                        const player = get.player();
                                        return get.effect(target, { name: 'guohe_copy' }, player, player);
                                    }).forResult();
                         if(result.bool){
                         await player.discardPlayerCard(result.targets[0], 'ej', true);
                }
                }
},
},
},
},
    xinfan_xuechungao: {
    audio: "ext:新繁/fenbao/yys/juesebao/chanbingxuenv:1",
        limited: true,
        enable: 'phaseUse',
        skillAnimation: true,
        filterTarget(card, player, target) {
            return game.dead.includes(target);
        },
        fitler(event, player) {
            return game.dead.length > 0;
        },
        deadTarget: true,
        async content(event, trigger, player) {
           await player.awakenSkill('xinfan_xueshuanghan');
            player.awakenSkill(event.name);
            const target = event.target;
            await target.reviveEvent(target.maxHp);
            await target.drawTo(target.maxHp);
        },
                ai:{
            order:99,
            result:{
                target:10,
            },
        },
    },

                     //初翎山风
    xinfan_shanchuling: {
        enable: "phaseUse",
        usable: 1,
        audio: "ext:新繁/fenbao/yys/juesebao/chulingshanfeng:3",
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog(get.translation("xinfan_shanchuling"), [
                    [
                        ["damage", "令一名角色受到1点伤害"],
                        ["changeHujia", "令一名角色获得1点护甲"],
                    ],
                    "textbutton",
                ]);
            },
            check(button) {
                const player = get.player();
                if (button.link == "changeHujia") {
                    return Math.max(
                        ...game.filterPlayer().map(target => {
                            return get.recoverEffect(target, player, player);
                        })
                    );
                } else {
                    return Math.max(
                        ...game.filterPlayer().map(target => {
                            return get.damageEffect(target, player, player);
                        })
                    );
                }
            },
            backup(links, player) {
                return {
                    choice: links[0],
                    filterTarget: true,
                    ai1: () => 1,
                    ai2(target) {
                        const player = get.player();
                        const sgn = get.sgnAttitude(player, target);
                        const { choice } = get.info("xinfan_shanchuling_backup");
                        if (choice == "changeHujia") {
                            return get.recoverEffect(target, player, player) * sgn;
                        }
                        return get.damageEffect(target, player, player);
                    },
                    async content(event, trigger, player) {
                        player.logSkill('xinfan_shanchuling');
                        const {
                            targets: [target],
                        } = event;
                        const { choice } = get.info(event.name);
                        await target[choice]();
                    },
                };
            },
            prompt(links, player) {
                if (links[0] == "damage") {
                    return "令一名角色受到1点伤害";
                } else {
                    return "令一名角色获得1点护甲";
                }
            },
        },
        subSkill: {
            backup: {

            },
        },
        ai: {
            order: 1,
            result: {
                player: 1,
            },
        },
    },
               xinfan_shanxunyu: {
                                    audio: "ext:新繁/fenbao/yys/juesebao/chulingshanfeng:3",
                        trigger: {
                            global: "phaseEnd",
                        },
                                marktext: '迅',
                         intro: {
                                   content: '此标记数量大于3后清除，初翎山风获得一个额外的回合。',
                                   name: '迅',
                                 },
               forced: true,
    async content(event, trigger, player) {
         player.addMark('xinfan_shanxunyu', 1);
       },
               group: ['xinfan_shanxunyu_shang','xinfan_shanxunyu_he'],
        subSkill: {
            shang: {
                        trigger: {
                   player: 'damageEnd',
                        },
                        forced: true,
               usable: 1,
        async content(event, trigger, player) {
            player.logSkill('xinfan_shanxunyu'); 
         player.addMark('xinfan_shanxunyu', 1);
},
},
          he: {
                      trigger: {
                            player: ['xinfan_shanxunyuAfter','xinfan_shanxunyu_shangAfter'],
                        },
                        forced: true,
                        filter(event, player) {
                            let num = game.filterPlayer().reduce((sum, cur) => sum + cur.countMark('xinfan_shanxunyu'), 0);
                            return num > 3;
                        },
               async content(event, trigger, player) {
                        player.addMark('xinfan_shanxunyu', 1);
                                  player.insertPhase().skill=event.name;
                            await player.clearMark('xinfan_shanxunyu');


},
},
},
},



                     //天韧剑心鬼切
                         xinfan_qietianren: {
        trigger: {
            target: 'useCardToTargeted',
        },
                           audio: "ext:新繁/fenbao/yys/juesebao/tianrenjianxinguiqie:2",
        filter(event, player) {
            return event.player != player;
        },
        check(event, player) {
            return get.effect(player, event.card, event.player, player) < 0;
        },
        async content(event, trigger, player) {
            const type1 = get.type2(trigger.card, player);
            const result = await player
                .judge(card => {
                    return get.type2(card, get.player()) == get.event().typez ? 1 : -1;
                })
                .set('typez', type1)
                .forResult();
            if (result.bool) {
                trigger.getParent().excluded.add(player);
            }
        },
    },
    xinfan_qieduane: {
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
                priority:15,
                  audio: "ext:新繁/fenbao/yys/juesebao/tianrenjianxinguiqie:2",
        intro: {
            content: '危',
            nocount: true,
        },
        marktext: '危',
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(`###断恶###标记一名其他角色为“危”角色。`, 1, true, lib.filter.notMe)
                .set('ai', target => {
                    const player = get.player();
                    return get.effect(target, { name: 'sha' }, player, player);
                })
                .forResult();
        },
        async content(event, trigger, player) {
            for (const target of game.filterPlayer()) {
                if (target.hasMark('xinfan_qieduane')) {
                    target.clearMark('xinfan_qieduane');
                }
            }
            event.targets[0].addMark('xinfan_qieduane', 1, false);
            player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/duane.png`,[100,100])
        },
        global: ['xinfan_qieduane_ban'],
        group: ['xinfan_qieduane_sha'],
        subSkill: {
                            ban: {
                                ai: {
                                    unequip2: true,
                                    skillTagFilter(player, tag) {
                                        if (tag == 'unequip2' && player.hasMark('xinfan_qieduane')) return true;
                                        return false;
                                    },
                                },
                            },
            sha: {
                trigger: {
                    global: 'phaseEnd',
                },
                filter(event, player) {
                    if (event.player == player) return game.hasPlayer(i => i.hasMark('xinfan_qieduane'));
                    return event.player.hasMark('xinfan_qieduane');
                },
                async cost(event, trigger, player) {
                    event.result = {
                        bool: true,
                        targets: game.filterPlayer(i => i.hasMark('xinfan_qieduane')),
                    };
                },
                async content(event, trigger, player) {
                    player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/duane.png`,[100,100])
                    player.logSkill('xinfan_qieduane');
                    await player.useCard({ name: 'sha' }, event.targets, false);
                },
            },
        },
    },
              //茨木童子
                                     xinfan_cihaoyi: {
        enable: 'phaseUse',
        usable: 1,
                   audio: "ext:新繁/fenbao/yys/juesebao/cimutongzi:2",
				   						filterTarget(card, player, target) {
               return target != player;
             },
            selectTarget:1,
            filter(event, player){
            return game.hasPlayer(function(current) {
            return current != player;
            });
            },
                async content(event, trigger, player) {   
					const target = event.target;
                    const num1 = player.countMark('xinfan_ciqiannu') + 1;
                          await target.damage(num1,);
                },
                ai:{
    order:1,
    result:{
        player(player) {
            return 2;
        },
        target:-1,
    },
           },
},
   xinfan_ciqiannu: {
        forced: true,
        trigger: {
            source: 'damageAfter',
        },
        marktext: '怒',
        intro: {
            content: 'mark',
        },
        audio: "ext:新繁/fenbao/yys/juesebao/cimutongzi:2",
        filter(event, player) {
            if (!event.player.isAlive()) return player.countMark('xinfan_ciqiannu') > 0;
            return player.countMark('xinfan_ciqiannu') < 3;
        },
        async content(event, trigger, player) {
            if (trigger.player.isAlive()) {
                player.addMark('xinfan_ciqiannu', 1);
            } else {
                let num = player.countMark('xinfan_ciqiannu');
                player.clearMark('xinfan_ciqiannu');

                const maps = {};
                while (num > 0) {
                    const  result  = await player.chooseTarget(`###迁怒###请选择分配伤害的目标（剩余${num}点）`, 1).set('ai', target => {
                        const player = get.player();
                        return get.damageEffect(target, player, player);
                    }).forResult();
                    if (result.bool) {
                        const next2 = await player
                            .chooseNumbers('迁怒', [{ prompt: '请选择你要分配数值', min: 1, max: num }], true)
                            .set('processAI', () => {
                                return [get.event().numz];
                            })
                            .set('numz', num)
                            .forResult();
                        if (next2.bool) {
                            const num2 = next2.numbers?.[0];
                            maps[result.targets[0].playerid] = (maps[result.targets[0].playerid] || 0) + num2;
                            num -= num2;
                        }
                    } else {
                        break;
                    }
                }
                if (Object.keys(maps).length) {
                    for (const target of game.filterPlayer()) {
                        if (maps[target.playerid]) {
                            await target.damage(maps[target.playerid], 'nosource');
                        }
                    }
                }
            }
        },
    },
                    //源赖光
                    xinfan_guangxueqi: {
            audio: "ext:新繁/fenbao/yys/juesebao/yuanlaiguang:1",
        priority:15,
        forced: true,
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
                        async content(event, trigger, player) {    
                    for (const target of game.filterPlayer()) {
                    if (target.hasSkill('xinfan_guangxueqi_mark')) {
                        target.removeSkill('xinfan_guangxueqi_mark');
                    }
                }  
                   const  result  = await player.chooseTarget(`###血契###令一枚角色获得“血契”`)
                   .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                         await result.targets[0].addSkill('xinfan_guangxueqi_mark');
                         result.targets[0].playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/yuanshi.png`,[100,100])
                }
            },
        subSkill: {
            mark: {
                mark: true,
                intro: {
                    content: '每回合首次受到的伤害-1',
                },
                charlotte: true,
                usable: 1,
                forced: true,
                trigger: {
                    global: 'damageBegin4',
                },
                charlotte: true,
                filter(event, player) {
                    return event.player.hasSkill('xinfan_guangxueqi_mark') && event.num > 0;
                },
                async content(event, trigger, player) {
                    player.logSkill('xinfan_guangxueqi');
                    trigger.player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/yuanshi.png`,[100,100])
                    trigger.num--;
                },
            },                             
        },
},
                   xinfan_guangbuwu: {
                                audio: "ext:新繁/fenbao/yys/juesebao/yuanlaiguang:1",
        enable: 'phaseUse',
        usable: 1,
		filterTarget(card, player, target) {
               return target != player;
             },
            selectTarget:1,
            filter(event, player){
            return game.hasPlayer(function(current) {
            return current != player;
            });
            },
                async content(event, trigger, player) {        
					     const target = event.target;
                         player.discardPlayerCard(target, 'e', true);
                         player.discardPlayerCard(target, 'h', true);
                         target.damage(1,player);
            },
                ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
        target:-1,
    },
           },
           },
                            xinfan_guangzhuijiao: {  
                                        round: 1,              
                      trigger: {
                    global: ['damageAfter',"loseHpAfter"],
                },
                            filter(event, player) {
                    return event.player.hp < event.player.getDamagedHp() && event.player != player;
                },      
                        async cost(event, trigger, player) {
            event.result = await player
                .chooseBool(`###追剿###是否对 ${get.translation(trigger.player)} 发动“布武”？`)
                .set('ai', () => {
                    const trigger = _status.event.getTrigger();
                    return get.attitude(_status.event.player, trigger.player) < 0;
                })
                .forResult();
        },
                async content(event, trigger, player) {  
                        player.logSkill('xinfan_guangbuwu');
                        await trigger.player.damage(1);
                                   },
                                     },
                //帝释天
    xinfan_dizhanfang: {
        enable: "phaseUse",
        usable: 1,
        audio: "ext:新繁/fenbao/yys/juesebao/dishitian:2",
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog(get.translation("xinfan_dizhanfang"), [
                    [
                        ["loseHp", "令一名角色流失1点体力"],
                        ["recover", "令一名角色回复1点体力"],
                    ],
                    "textbutton",
                ]);
            },
            check(button) {
                const player = get.player();
                if (button.link == "recover") {
                    return Math.max(
                        ...game.filterPlayer().map(target => {
                            return get.recoverEffect(target, player, player);
                        })
                    );
                } else {
                    return Math.max(
                        ...game.filterPlayer().map(target => {
                            return get.damageEffect(target, player, player);
                        })
                    );
                }
            },
            backup(links, player) {
                return {
                    choice: links[0],
                    filterTarget: true,
                    ai1: () => 1,
                    ai2(target) {
                        const player = get.player();
                        const sgn = get.sgnAttitude(player, target);
                        const { choice } = get.info("xinfan_dizhanfang_backup");
                        if (choice == "recover") {
                            return get.recoverEffect(target, player, player) * sgn;
                        }
                        return get.damageEffect(target, player, player);
                    },
                    async content(event, trigger, player) {
                        player.logSkill('xinfan_dizhanfang');
                        const {
                            targets: [target],
                        } = event;
                        const { choice } = get.info(event.name);
                        await target[choice]();
                    },
                };
            },
            prompt(links, player) {
                if (links[0] == "loseHp") {
                    return "令一名角色流失1点体力";
                } else {
                    return "令一名角色回复1点体力";
                }
            },
        },
        subSkill: {
            backup: {

            },
        },
        ai: {
            order: 1,
            result: {
                player: 1,
            },
        },
    },
    xinfan_dilianhua: {
    audio: "ext:新繁/fenbao/yys/juesebao/dishitian:2",
        group: ['xinfan_dilianhua_remove'],
        subSkill: {
            remove: {
                trigger: {
                    player: 'dying',
                },
                filter(event, player) {
                    return game.hasPlayer(i => i.hasMark('xinfan_dilianhua'));
                },
                frequent: true,
                content() {
                    const targets = game.filterPlayer(i => i.hasMark('xinfan_dilianhua'));
                    for (const targetz of targets) {
                        targetz.clearMark('xinfan_dilianhua');
                    }
                    player.useSkill('xinfan_dizhanfang');
                },
            },
        },
        enable: 'phaseUse',
        usable: 1,
        filterTarget(card, player, target) {
            return !target.hasMark('xinfan_dilianhua');
        },
        intro: {
            content: 'mark',
            nocount: true,
        },
        marktext: '莲',
        content() {
            const targets = game.filterPlayer(i => i.hasMark('xinfan_dilianhua'));
            for (const targetz of targets) {
                targetz.clearMark('xinfan_dilianhua');
            }
            target.addMark('xinfan_dilianhua');
        },
        ai: {
            order: 11,
            result: {
                target: -1,
            },
        },
    },
    xinfan_dijinlian: {
    audio: "ext:新繁/fenbao/yys/juesebao/dishitian:2",
        trigger: {
            global: ['damageBegin2', 'recoverBegin', 'useCard'],
        },
        usable: 1,
        filter(event, player) {
            if (event.name == 'damage') {
                return event.source && event.source.hasMark('xinfan_dilianhua');
            }
            return event.player.hasMark('xinfan_dilianhua');
        },
        prompt2(event, player) {
            if (event.name == 'damage') {
                return `${get.translation(event.source)}即将对${get.translation(event.player)}造成伤害，是否取消之？`;
            } else if (event.name == 'useCard') {
                return `${get.translation(event.player)}即将使用${get.translation(event.card)}，是否取消之？`;
            }
            return `${get.translation(event.player)}即将回复体力，是否取消之？`;
        },
        logTarget(event, player) {
            if (event.name == 'damage') {
                return event.source;
            }
            return event.player;
        },
        check(event, player) {
            if (event.name == 'damage') {
                return get.attitude(player, event.player) > 0;
            }
            return get.attitude(player, event.player) < 0;
        },
        content() {
            trigger.cancel();
            trigger.num = 0;
        },
    },

          //寻森小鹿男
    xinfan_lusenxin: {
        trigger: {
            player: 'phaseEnd',
        },
             audio: "ext:新繁/fenbao/yys/juesebao/xunsenxiaolunan:2",
        filter(event, player) {
            return game.hasPlayer(i => !i.hasMark('xinfan_lusenxin_sen') && i != player);
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(`###森心###是否令一名未持有“森”标记的其他角色获得“森”标记？`, (card, player, target) => {
                    return !target.hasMark('xinfan_lusenxin_sen') && target != player;
                }).set('ai', target => {
                    const player = get.player();
                    return get.damageEffect(target, player, player);
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            target.addMark('xinfan_lusenxin_sen', 1);
        },
        global: ['xinfan_lusenxin_qin'],
        group: ['xinfan_lusenxin_start'],
        subSkill: {   
                       start: {
                trigger: {
                                    global: 'phaseBefore',
                                    player: 'enterGame',
                                },
                                filter(event, player) {
                                    return game.phaseNumber == 0;
                                },
                lastDo: true,
                forced: true,
                content() {
                    player.addMark('xinfan_lusenxin_sen', 1);
                },
            },
            sen: {
                intro: {
                    content: 'mark',
                },
                charlotte: true,
                marktext: '森',
            },
            qin: {
                intro: {
                    content: 'mark',
                },
                        forced: true,
                trigger: {
                    source: 'damageAfter',
                },
                filter(event, player) {
                    return player.hasMark('xinfan_lusenxin_sen') && player.name != 'xinfan_xunsenxiaolunan';
                },
                charlotte: true,
                marktext: '侵',
                content() {
                    player.addMark('xinfan_lusenxin_qin', 1);
                },
            },
        },
    },
    xinfan_lusenqi: {
        priority:15,
        forced: true,
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
         audio: "ext:新繁/fenbao/yys/juesebao/xunsenxiaolunan:2",
        filter(event, player) {
            return game.hasPlayer(i => i.hasMark('xinfan_lusenxin_sen') || i.hasMark('xinfan_lusenxin_qin'));
        },
        async content(event, trigger, player) {
            const num = game.countPlayer(i => i.hasMark('xinfan_lusenxin_sen'));
            await player.recover(num);
            await player.draw(num);
            for (const target of game.filterPlayer(i => i.hasMark('xinfan_lusenxin_qin'))) {
                while (target.countMark('xinfan_lusenxin_qin') > 0) {
                    if (target.countCards('he')) {
                        await player.discardPlayerCard(target, 'he', true);
                    } else {
                        await target.damage(1,player);
                    }
                    target.removeMark('xinfan_lusenxin_qin', 1);
                }
            }
        },

      },

       //鬼童丸
    xinfan_guiyueyin: {
     audio: "ext:新繁/fenbao/yys/juesebao/guitongwan:1",
        forced: true,
        trigger: {
            global: 'gameDrawAfter',
        },
        async content(event, trigger, player) {
            await player.addTempBackGroundOL("/extension/新繁/fenbao/yys/beijing/guitongwan.jpg", 0, {player:"phaseBegin"})
            if(_status.tempMusic != "ext:新繁/fenbao/yys/yinyue/shayushenghua.mp3"){
            game.playBgmOL("ext:新繁/fenbao/yys/yinyue/shayushenghua.mp3"); 
            }
            await player.changeHujia(1);
            player.addTempSkill('xinfan_guiyueyin_out', { player: 'phaseBegin' });
        },
        subSkill: {
            out: {
                charlotte: true,
                init(player) {
                    if (player.isIn()) {
                        game.broadcastAll(function (player) {
                            player.classList.add('out');
                        }, player);
                        game.log(player, '移出了游戏');
                    }
                },
                onremove(player) {
                    if (player.isOut()) {
                        game.broadcastAll(function (player) {
                            player.classList.remove('out');
                        }, player);
                        game.log(player, '移回了游戏');
                    }
                },
            },
        },
    },
    xinfan_guihaisuo: {
         audio: "ext:新繁/fenbao/yys/juesebao/guitongwan:2",
        forced: true,
        trigger: {
            source: 'damageAfter',
            player: 'damageAfter',
        },
        filter(event, player) {
            if (event.source == player) return event.player.isAlive();
            return event.source && event.source.isAlive();
        },
        logTarget(event, player) {
            const target = event.source == player ? event.player : event.source;
            return target;
        },
        content() {
            const target = trigger.source == player ? trigger.player : trigger.source;
            target.addMark('xinfan_guihaisuo', 1);
        },
        marktext: '锁',
        intro: {
            content: 'mark',
        },
    },
    xinfan_guikuanglie: {
     audio: "ext:新繁/fenbao/yys/juesebao/guitongwan:2",
        trigger: {
            player: 'xinfan_guihaisuoAfter',
        },
        filter(event, player) {
            return game.filterPlayer().reduce((p, c) => p + c.countMark('xinfan_guihaisuo'), 0) >= player.maxHp;
        },
        forced: true,
        async content(event, trigger, player) {
            let num = 0;
            for (const target of game.filterPlayer()) {
                let num2 = target.countMark('xinfan_guihaisuo');
                if (num2 > 0) {
                    num += num2;
                    target.clearMark('xinfan_guihaisuo');
                }
            }
            const maps = {};
            while (num > 0) {
                const  result  = await player.chooseTarget(`###骸猎###请选择分配伤害的目标（剩余${num}点）`, 1).set('ai', target => {
                    const player = get.player();
                    return get.damageEffect(target, player, player);
                }).forResult();
                if (result.bool) {
                    const next2 = await player
                        .chooseNumbers('骸猎', [{ prompt: '请选择你要分配数值', min: 1, max: num }], true)
                        .set('processAI', () => {
                            return [get.event().numz];
                        })
                        .set('numz', num)
                        .forResult();
                    if (next2.bool) {
                        const num2 = next2.numbers?.[0];
                        maps[result.targets[0].playerid] = (maps[result.targets[0].playerid] || 0) + num2;
                        num -= num2;
                    }
                } else {
                    break;
                }
            }
            await player.useSkill('xinfan_guiyueyin');
            if (Object.keys(maps).length) {
                for (const target of game.filterPlayer()) {
                    if (maps[target.playerid]) {
                        await target.damage(maps[target.playerid], 'nosource');
                    }
                }
            }
        },
    },

                //鬼切
        xinfan_guijianshan: {
        forced: true,
    audio: "ext:新繁/fenbao/yys/juesebao/guiqie:2",
             trigger: {
                 player: "phaseEnd"
             },
        async content(event, trigger, player) {
                await player.chooseUseTarget({ name: 'sha' }, false, 'nodistance');
        },            
                            },
            
    xinfan_guiguiren: {
    audio: "ext:新繁/fenbao/yys/juesebao/guiqie:2",
        forced: true,
        trigger: {
            player: 'useCardAfter',
        },
                filter(event, player) {
            return event.card?.name == 'sha' && event.targets.some(i => i.isAlive() && i.isDamaged());
        },
        async content(event, trigger, player) {
            const targets = trigger.targets.filter(i => i.isAlive() && i.isDamaged());
            for (const target of targets) {
                await target.loseHp();
            }
        },
    },
                //紧那罗
                     xinfan_zouxu: {
                                             forced: true,
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                          audio: "ext:新繁/fenbao/yys/juesebao/jinnaluo:2",
                                     filter(event, player) {
                       return player.countMark('xinfan_zouxu_gong') == 0 || player.countMark('xinfan_zouxu_shang') == 0 || player.countMark('xinfan_zouxu_jiao') == 0 || player.countMark('xinfan_zouxu_hui') == 0;         
                          },
                async content(event, trigger, player) {        
                const choiceList = ['宫：令一名角色受到一点伤害','商：弃置一名角色区域内一张牌','角：令一名角色摸一张牌','徽：令一名角色回复一点体力',];
             const choices = ['宫','商','角','徽','cancel2',];
            if(player.countMark('xinfan_zouxu_gong') != 0){
               choiceList[0] = '<span style="opacity:0.5">' + choiceList[0] + "</span>";
                 choices.remove('宫');
                };
            if(player.countMark('xinfan_zouxu_shang') != 0){
                 choiceList[1] = '<span style="opacity:0.5">' + choiceList[1] + "</span>";
                 choices.remove('商');
                };
            if(player.countMark('xinfan_zouxu_jiao') != 0){
               choiceList[2] = '<span style="opacity:0.5">' + choiceList[2] + "</span>";
                 choices.remove('角');
                };
            if(player.countMark('xinfan_zouxu_hui') != 0){
                 choiceList[3] = '<span style="opacity:0.5">' + choiceList[3] + "</span>";
                 choices.remove('徽');
                };
            var result = await player
            .chooseControl()
            .set('controls', choices)
            .set('choiceList', choiceList)
            .set('prompt','奏序： 请选择其中一项')
              .forResult();
            if (result.control == '宫'){
            await player.useSkill('xinfan_zouxu_gong');
            }else if (result.control == '商'){
            await player.useSkill('xinfan_zouxu_shang');
            }else if (result.control == '角'){
            await player.useSkill('xinfan_zouxu_jiao');
            }else if (result.control == '徽'){
            await player.useSkill('xinfan_zouxu_hui');
            }else if (result.control == 'cancel2'){
            return;
            }
                   },
        subSkill: {
            gong: {
            	marktext: '宫',
                         intro: {
                                   content: 'mark',
                                   name: '宫',
                                 },
                        forced: true,
                        audio: "ext:新繁/fenbao/yys/juesebao/jinnaluo:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###宫###令一名角色受到一点伤害`)
                       .set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player,);      
                        }).forResult();
                         if(result.bool){
                         await result.targets[0].damage(1,);
                          await player.addMark('xinfan_zouxu_gong', 1);
                }
            },
            },
            shang: {
            	marktext: '商',
                         intro: {
                                   content: 'mark',
                                   name: '商',
                                 },
                        forced: true,
                      audio: "ext:新繁/fenbao/yys/juesebao/jinnaluo:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###商###弃置一名角色一张牌`)
               .set('ai', target => {
                                        const player = get.player();
                                        return get.effect(target, { name: 'guohe_copy' }, player, player);
                                    }).forResult();
                         if(result.bool){
                         await player.discardPlayerCard(result.targets[0], 'hej', true);
                         await player.addMark('xinfan_zouxu_shang', 1);
                }
            },
                      },  
            jiao: {
            	marktext: '角',
                         intro: {
                                   content: 'mark',
                                   name: '角',
                                 },
                        forced: true,
                        audio: "ext:新繁/fenbao/yys/juesebao/jinnaluo:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###角###令一名角色摸一张牌`)
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                         await result.targets[0].draw(1);
                         await player.addMark('xinfan_zouxu_jiao', 1);
                }
            },
                     },   
            hui: {
            	marktext: '徽',
                         intro: {
                                   content: 'mark',
                                   name: '徽',
                                 },
                        forced: true,
                        audio: "ext:新繁/fenbao/yys/juesebao/jinnaluo:1",
                     trigger: {
                      player: ['useCardBegin', 'respondBegin'],
                   },
                async content(event, trigger, player) {         
               const  result  = await player.chooseTarget(`###徽###令一名角色回复一点体力`)
               .set('ai', function (tar) {
								return get.attitude(player, tar)
							}).forResult();
                         if(result.bool){
                         await result.targets[0].recover(1);
                         await player.addMark('xinfan_zouxu_hui', 1);
                }
            },
                     
        },
    },
    },

                   xinfan_jinyuyun: {
                  trigger: {
                            global: "phaseEnd",
                        },
                        audio: "ext:新繁/fenbao/yys/juesebao/jinnaluo:1",
                  filter(event, player) {
                       return player.countMark('xinfan_zouxu_gong') > 0 || player.countMark('xinfan_zouxu_shang') > 0 || player.countMark('xinfan_zouxu_jiao') > 0 || player.countMark('xinfan_zouxu_hui') > 0;                 
                        },
                        forced: true,
                async content(event, trigger, player) {        
                const choiceList = ['宫：令一名角色受到一点伤害','商：弃置一名角色区域内一张牌','角：令一名角色摸一张牌','徽：令一名角色回复一点体力',];
             const choices = ['宫','商','角','徽','cancel2',];
            if(player.countMark('xinfan_zouxu_gong') != 1){
               choiceList[0] = '<span style="opacity:0.5">' + choiceList[0] + "</span>";
                 choices.remove('宫');
                };
            if(player.countMark('xinfan_zouxu_shang') != 1){
                 choiceList[1] = '<span style="opacity:0.5">' + choiceList[1] + "</span>";
                 choices.remove('商');
                };
            if(player.countMark('xinfan_zouxu_jiao') != 1){
               choiceList[2] = '<span style="opacity:0.5">' + choiceList[2] + "</span>";
                 choices.remove('角');
                };
            if(player.countMark('xinfan_zouxu_hui') != 1){
                 choiceList[3] = '<span style="opacity:0.5">' + choiceList[3] + "</span>";
                 choices.remove('徽');
                };
            var result = await player
            .chooseControl()
            .set('controls', choices)
            .set('choiceList', choiceList)
            .set('prompt','奏序： 请选择其中一项')
              .forResult();
            if (result.control == '宫'){
            await player.useSkill('xinfan_zouxu_gong');
            }else if (result.control == '商'){
            await player.useSkill('xinfan_zouxu_shang');
            }else if (result.control == '角'){
            await player.useSkill('xinfan_zouxu_jiao');
            }else if (result.control == '徽'){
            await player.useSkill('xinfan_zouxu_hui');
            }
           await player.clearMark('xinfan_zouxu_gong');
           await player.clearMark('xinfan_zouxu_shang');
           await player.clearMark('xinfan_zouxu_jiao');
           await player.clearMark('xinfan_zouxu_hui');
                   },             
                 }, 

                //龙珏
            xinfan_longcuijian: {
                            audio: "ext:新繁/fenbao/yys/juesebao/longjue:3",
        trigger: {
            source: 'damageBegin',
        },
               priority:15,
               forced: true,
                filter(event, player) {
                       return !event.player.hasSkill('xinfan_longcuijian_xuan');
                        },
    async content(event, trigger, player) {
                 trigger.cancel();
                 trigger.player.addSkill('xinfan_longcuijian_xuan');  
       },
               group: ['xinfan_longcuijian_xuan'],
               subSkill: { 
                   xuan: {
                mark: true,
                intro: {
                    content: '受到的伤害增加自身体力上限点。',
                },
                charlotte: true,
                        trigger: {
                           player: 'damageBegin',
                        },
                        priority:2,
                        forced: true,
                        async content(event, trigger, player) {
                            player.logSkill('xinfan_longcuijian');
                            const num1 = trigger.player.maxHp;
                               trigger.num += num1;
                             await trigger.player.removeSkill('xinfan_longcuijian_xuan');
                        },
                    },
                    },
       },

                                       xinfan_longlongxi: {
                        marktext: '无畏',
                         intro: {
                                   content: '一轮后重置。',
                                   name: '无畏',
                                 },
                     audio: "ext:新繁/fenbao/yys/juesebao/longjue:2",
                          enable: 'phaseUse',
                                filter(event, player) {
                       return !player.hasMark('xinfan_longlongxi');
                        },
                async content(event, trigger, player) {  
                         player.addMark('xinfan_longlongxi');
                         player.insertPhase().skill=event.name;
                      },
                    group: ['xinfan_longlongxi_xuan','xinfan_longlongxi_use'],
                    subSkill: { 
                   xuan: {
                                            trigger: {
                           player: 'damageBegin',
                        },
                                            filter(event, player) {
                       return !player.hasMark('xinfan_longlongxi');
                        },
                        priority:5,
                        async content(event, trigger, player) {
                            player.logSkill('xinfan_longlongxi');
                            player.addMark('xinfan_longlongxi');
                            trigger.cancel();
                            player.insertPhase().skill=event.name;
                        },
                        },
            use: {
                trigger: {
                    global: 'roundEnd',
                },
                forced: true,
                filter(event, player) {
                    return player.hasMark('xinfan_longlongxi');
                },
                async content(event, trigger, player) {
                     player.clearMark('xinfan_longlongxi');
 },
  },
  },
                    },
                //缚骨清姬
                xinfan_du: {
                mark: true,
                intro: {
                    content: '回合开始时，移去一枚并流失1点体力',
                },
                charlotte: true,
                    },
    xinfan_qingchanxin: {
    audio: "ext:新繁/fenbao/yys/juesebao/fuguqingji:2",
        forced: true,
        trigger: {
            player: ["useCardToPlayered"],
        },
                filter(event, player) {
            return event.card.name === "sha";
        },
        async content(event, trigger, player) {
            trigger.target.addMark('xinfan_du');
        },
        },
        xinfan_qingshigu: {
    audio: "ext:新繁/fenbao/yys/juesebao/fuguqingji:2",
        forced: true,
        trigger: {
            global: 'loseHpEnd',
        },
            async content(event, trigger, player) {
            if(player.maxHp < 10){
            player.gainMaxHp();
            }else{
            player.draw(2);
            }    
            player.recover(); 
        },
        },
            xinfan_qingjianggu: {
				    audio: "ext:新繁/fenbao/yys/juesebao/fuguqingji:1",
                    enable: 'phaseUse',
        usable: 1,
		filterTarget(card, player, target) {
               return target != player;
             },
            selectTarget:1,
            filter(event, player){
            return game.hasPlayer(function(current) {
            return current != player;
            });
            },
                        limited: true,
						mark: true,
						intro: {
							content: "limited",
			},
			async content(event, trigger, player) {
                const target = event.target;
                    game.broadcastAll(function () {
                        ui.background.setBackgroundImage('extension/新繁/fenbao/yys/beijing/fuguqingji.jpg');
                    })
                    game.playBgmOL("ext:新繁/fenbao/yys/yinyue/huazuoqingyan.mp3"); 
                    target.addSkill('xinfan_qingjianggu_jian'); 
                    player.awakenSkill('xinfan_qingjianggu');                
			},
                            ai:{
    order:9,
    result:{
        player(player) {
            return 2;
        },
        target:-1,
    },
           },
         subSkill: {   
        jian: {
             trigger: {
                 global: "phaseBegin"
             },
             priority:15,
                  forced: true,
                  audio: "ext:新繁/fenbao/yys/juesebao/fuguqingji:2",
        filter(event, player) { 
           return event.player == player || event.player.name == "xinfan_fuguqingji";
        },
                  async content(event, trigger, player) {
                player.playGifOL(1000, lib.assetURL + `/extension/新繁/fenbao/yys/tubiao/ningshi.png`,[100,100])    
                player.addMark('xinfan_du');
                  },
            },
            },
			},
      //铃鹿御前
        xinfan_lulanggui: {
        enable: 'phaseUse',
        mod: {
                aiOrder(player, card, num) {
            if (num <= 0 || get.itemtype(card) !== "card" || get.type(card) !== "equip") {
                return num;
            }
            let eq = player.getEquip(get.subtype(card));
            if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
                return 0;
            }
        },
    },
    audio: "ext:新繁/fenbao/yys/juesebao/lingluyuqian:2",
    locked: false,
    enable: "phaseUse",
    position: "he",
    filterCard: true,
    selectCard: [1,2],
    allowChooseAll: true,
    filterTarget(card, player, target) {
        return target != player;
    },
    selectTarget:1,
    filter(event, player){
            return game.hasPlayer(function(current) {
            return current != player && player.countCards("he") >= 1;
    });
    },
    check(card) {
        let player = _status.event.player;
        if (get.position(card) == "e") {
            let subs = get.subtypes(card);
            if (subs.includes("equip2") || subs.includes("equip3")) {
                return player.getHp() - get.value(card);
            }
        }
        return 6 - get.value(card);
    },   
                            async content(event, trigger, player) {
                        const num = event.cards.length;
                        const target = event.target;
            await player.addTempBackGroundOL("/extension/新繁/fenbao/yys/beijing/lingluyuqian.jpg", 0, {global: "phaseJieshuEnd"})
            if(_status.tempMusic != "ext:新繁/fenbao/yys/yinyue/luhaiweiwang.mp3"){
                  game.playBgmOL("ext:新繁/fenbao/yys/yinyue/luhaiweiwang.mp3"); 
            }
                 const choiceList = ['获得等量点护甲,目标执行“义争”回合','目标受到等量点伤害'];
                       const choices = ['选项一','选项二'];
                        var result = await player
                         .chooseControl()
                     .set('controls',choices)
                      .set('choiceList',choiceList)
                      .set("ai", () => {
                if (target.countCards("he") <= 5) {
                    return "选项一";
                }else{
                 return "选项二";
                }  
            })
                                 .forResult();
                        if(result.control=="选项一"){
                    await player.changeHujia(num);
                    const next = target.insertPhase("xinfan_lulanggui");
                    target.addTempSkill("xinfan_lulanggui_mark", {target: "phaseEnd" });
                    }else if(result.control=="选项二"){
                  await target.damage(num);
                }
        const evt = event.getParent("phase", true);
        if (evt) {
        game.log(player, "结束了回合");
        evt.num = evt.phaseList.length;
        evt.goto(11);
       }
       const evtx = event.getParent("phaseUse", true);
       if (evtx) {
        evtx.skipped = true;
       }     
    },
                ai:{
    order:1,
    result:{
        player(player) {
            return 2;
        },
        target:-1,
    },
           },
		subSkill: {
			mark: {
				mark: true,
                intro: {
                    content: '使用牌无距离次数限制且仅能指定“铃鹿御前”为目标',
                },
                charlotte: true,
                                trigger: {
                    player: 'phaseEnd',
                },
                priority:500,
                forced: true,
                async content(event, trigger, player) {
                await player.turnOver();
                player.awakenSkill('xinfan_lulanggui_mark');
                    },
                                mod: {
                                    cardSavable(card, player, target) {
                                        if (target.name != "xinfan_lingluyuqian") {
                                            return false;
                                        }
                                    },
                                    playerEnabled(card, player, target) {
                                        if (target.name != "xinfan_lingluyuqian") {
                                            return false;
                                        }
                                    },
									targetInRange(card, player) {
                                        if (player == _status.currentPhase) {
                                            return true;
                                        }
                                    },
                                    cardUsable(card, player) {
                                        if (player == _status.currentPhase) {
                                            return Infinity;
                                        }
                                    },
                                },
                            },
							},
							},
           xinfan_luyili: {
          trigger: {
             player: "damageBegin4"
    },
    audio: "ext:新繁/fenbao/yys/juesebao/lingluyuqian:2",
           audio: "ext:新繁/fenbao/yys/juesebao/lingluyuqian:1",
             forced: true,
                  filter: function (event, player) {
		           	return event.num > 1 && player.hujia >0;
            		},
              content: function () {
			trigger.num = 1;
		  },
      },
                 //心友犬神
    xinfan_xinyou: {
        trigger: {
            global: 'roundStart',
        },
        filter(event, player) {
            return game.countPlayer(i => player.getStorage('xinfan_xinyou').includes(i)) < 2;
        },
                audio: "ext:新繁/fenbao/yys/juesebao/xinyouquanshen:2",
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(`###心友###请选择一名其他角色作为“心友”角色`, (card, player, target) => !player.getStorage('xinfan_xinyou').includes(target) && target != player)
                .set('ai', target => {
                    const player = get.event().player;
                    return get.attitude(player, target);
                })
                .forResult();
        },
        intro: {
            content: '心友角色：$',
        },
        async content(event, trigger, player) {
            player.markAuto('xinfan_xinyou', event.targets);
        },
        mod: {
            playerEnabled(card, player, target) {
                if (get.tag(card, 'damage')) {
                    if (player.getStorage('xinfan_xinyou').includes(target)) {
                        return false;
                    }
                }
            },
        },
    },
   xinfan_shouhu: {
        trigger: {
            global: 'useCardToTargeted',
        },
        filter(event, player) {
            return get.tag(event.card, 'damage') && (player.getStorage('xinfan_xinyou').includes(event.target) || event.target == player) && !player.getStorage('xinfan_xinyou').includes(event.player) && !player.getStorage('xinfan_shouhu_used').includes(event.target);
        },
        frequent: true,
        audio: "ext:新繁/fenbao/yys/juesebao/xinyouquanshen:2",
        async content(event, trigger, player) {
            const result = await trigger.player
                .chooseBool(`###守护###取消此牌对${get.translation(trigger.target)}的目标效果。否则此牌结算完成后，${get.translation(player)}视为对你使用一张【杀】。`)
                .set('ai', () => true)
                .forResult();
            let player2 = player;
            let target2 = trigger.player;
            player.markAuto('xinfan_shouhu_used', trigger.target);
            player.addTempSkill('xinfan_shouhu_used');
            if (result.bool) {
                trigger.getParent().excluded.add(trigger.target);
            } else {
                                     player
                                    .when({ global: 'useCardAfter' })
                                    .filter((evt, pl) => evt.card == trigger.getParent('useCard').card)
                                    .step(() => {
                                        player2.useCard({ name: 'sha' }, target2, false);
                                    });
            }
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true,
                mark: true,
                intro: {
                    content: '本回合已守护过：$',
                },
            },
        },
    },
    xinfan_youli: {
        forced: true,
         audio: "ext:新繁/fenbao/yys/juesebao/xinyouquanshen:1",
                        trigger: {
                            player: 'useCard',
                        },
                        content() {
                            trigger.effectCount += player.getStorage('xinfan_xinyou').length;
                        },
                        filter: (event, player) => player.getStorage('xinfan_xinyou').length && get.name(event.card) == 'sha',
                    },


               //千姬
 xinfan_chaoge:{
        forced: true,
        priority:1,
        trigger: {
            player: ['useCardBegin', 'respondBegin','damageEnd'],
        },
                        marktext: '潮歌',
                         intro: {
                                   content: '此标记数量大于4后清除，千姬摸3张牌并回复1点体力。',
                                   name: '潮歌',
                                 },
async content(event, trigger, player) {
                     player.addMark('xinfan_chaoge', 1);
		},
     group: ['xinfan_chaoge_ge'],
        subSkill: {
            ge: {
        trigger: {
            player: 'xinfan_chaogeAfter',
        },
		                 filter(event, player) {
            return player.countMark('xinfan_chaoge') > 4;
        },
								 audio: "ext:新繁/fenbao/yys/juesebao/qianji:2",
               forced: true,
    async content(event, trigger, player) {
        await player.recover();
		await player.draw(3);
       await player.clearMark('xinfan_chaoge');
       },
},
},
    },
        xinfan_ningshuang:{
                        enable: "phaseUse",
                        usable: 1,
                              audio: "ext:新繁/fenbao/yys/juesebao/qianji:2",
                            marktext: '霜',
                         intro: {
                                   content: '回合结束阶段弃置两张牌',
                                   name: '霜',
                                 },
                 filter(event, player) {
            return player.countCards("he") >= 1;
        },
				        filterCard: true,
                position: "he",
                selectCard:1,
						filterTarget(card, player, target) {
               return target != player;
             },
            selectTarget:1,
            filter(event, player){
            return game.hasPlayer(function(current) {
            return current != player;
            });
            },
                            async content(event, trigger, player) {
								const target = event.target;
                              await target.addMark('xinfan_ningshuang', 1);
                            },
                ai:{
    order:1,
    result:{
        player(player) {
            return 2;
        },
        target:-1,
    },
           },
     group: ['xinfan_ningshuang_jie'],
        subSkill: {
            jie: {
                        trigger: {
                            global: "phaseEnd",
                        },
                        forced: true,
                                        filter(event, player) {
                    return event.player.countMark('xinfan_ningshuang') > 0;
                },
				audio: "ext:新繁/fenbao/yys/juesebao/qianji:2",
     async content(event, trigger, player) {
        await trigger.player.clearMark('xinfan_ningshuang');
await trigger.player.chooseToDiscard(2, true, "h");
      const num = trigger.player.countCards("h");
      if(num ==0){
await trigger.player.addMark('_xinfan_yongdong', 1);
      }
},
},

},
},
             //神启荒
xinfan_qishenqi: {
        forced: true,
        trigger: {
            global: 'roundStart',
        },
        intro: {
            content(storage, player) {
                return `当前记录牌名：${get.translation(storage)}`;
            },
        },
        audio: "ext:新繁/fenbao/yys/juesebao/shenqihuang:2",
        logTarget: () => game.filterPlayer(),
        async content(event, trigger, player) {
        game.playVideoOL("/extension/新繁/fenbao/yys/juesebao/shenqihuang/xinfan_yvzhi.MP4",0);
           await new Promise(r => setTimeout(r, 10));
            const vcards = get.inpileVCardList(b => !b[3]);
            const targets = game.filterPlayer();
            for (const target of targets) {
                const storage = target.getStorage('xinfan_qishenqi');
                if (storage) {
                    const card = get.cardPile(c => c.name == storage);
                    if (card) {
                        await target.gain(card, 'gain2');
                    }
                }
            }
            for (const target of targets) {
                const result = await player
                    .chooseButton([`###神启###为${get.translation(target)}记录一张牌名`, [vcards, 'vcard']], true)
                    .set('ai', button => {
                        const name = button.link[2];
                        return name == 'sha' ? 0.35 : 0 + Math.random();
                    })
                    .forResult();
                if (result.bool) {
                    target.setStorage('xinfan_qishenqi', result.links[0][2]);
                    target.markSkill('xinfan_qishenqi');
                }
            }
        },
    },
    xinfan_qimingding: {
    audio: "ext:新繁/fenbao/yys/juesebao/shenqihuang:2",
        check(event, player) {
            return get.damageEffect(event.player, player, player) > 0;
        },
        trigger: {
            global: ['useCardAfter', 'respondAfter'],
        },
        filter(event, player) {
            return event.player.getStorage('xinfan_qishenqi') == get.name(event.card);
        },
        async content(event, trigger, player) {
        game.playVideoOL("/extension/新繁/fenbao/yys/juesebao/shenqihuang/xinfan_mingding.MP4",0);
           await new Promise(r => setTimeout(r, 10));
            await trigger.player.damage(1, 'nosource');
            if (!get.is.virtualCard(trigger.card)) {
                await player.loseToSpecial(trigger.cards, 'xinfan_qimingding');
            }
        },
        mod: {
            cardEnabled(card, player) {
                if (card.cards.some(i => i.hasGaintag('xinfan_qimingding')) && !player.hasSkill('xinfan_qixinggui')) {
                    return false;
                }
            },
        },
    },
xinfan_qixinggui: {
        trigger: {
            player: 'useCardToPlayered',
        },
            audio: "ext:新繁/fenbao/yys/juesebao/shenqihuang:2",
        filter(event, player) {
            if (event.getParent(3).name == 'xinfan_qixinggui') return false;
            const name = event.card.name;
            return name && player.countCards('s', card => card.name == name && card.hasGaintag('xinfan_qimingding')) > 0 && player.canUse({ name: name }, event.target, false, false);
        },
        frequent: true,
        async content(event, trigger, player) {
            const name = trigger.card.name;
            while (true) {
                const result = await player
                    .chooseToUse(`###星轨###是否对${get.translation(trigger.target)}使用一张${get.translation(name)}？`)
                    .set('filterCard', card => {
                        return card.name == get.event().pingName && card.hasGaintag('xinfan_qimingding');
                    })
                    .set('pingName', name)
                    .set('pingTarget', trigger.target)
                    .set('targetRequired', true)
                    .set('filterTarget', function (card, player, target) {
                        if (target != get.event().pingTarget) {
                            return false;
                        }
                        return lib.filter.filterTarget.apply(this, arguments);
                    })
                    .forResult();
                if (!result.bool) {
                    break;
                }
            }
        },
    },

};

export default skills;
