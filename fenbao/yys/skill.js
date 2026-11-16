import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

/** @type { importCharacterConfig['skill'] } */
const skills = {
    //阴阳师
    //海忍
    xinfan_haiyingren: {
        audio: "ext:阴阳师杀/fenbao/yys/juesebao/hairen:2",
        beginMarkCount: 1,
        getLimit: 4,
        enable: ["chooseToUse", "chooseToRespond"],
        viewAs: {
            name: "sha",
            isCard: true,
        },
        filter(event, player) {
            return player.hasMark("xinfan_haiyingren_mark");
        },
        filterCard: () => false,
        selectCard: -1,
        log: false,
        async precontent(event, trigger, player) {
            player.logSkill("xinfan_haiyingren");
            player.removeMark("xinfan_haiyingren_mark");
        },
        group: ["xinfan_haiyingren_init", "xinfan_haiyingren_charge"],
        subSkill: {
            init: {
                trigger: {
                    player: "enterGame",
                    global: "phaseBefore",
                },
                filter(event, player) {
                  return event.name != "phase" || game.phaseNumber == 0;
                },
                forced: true,
                locked: false,
                priority:15,
                async content(event, trigger, player) {
                  player.logSkill('xinfan_haiyingren');
                  const num = lib.skill.xinfan_haiyingren.beginMarkCount;
                  player.addMark("xinfan_haiyingren_mark", num);
                  await game.delayx();
                },
            },
            charge: {
                trigger: {
                    player: "phaseUseEnd",
                },
                popup: false,
                filter(event, player) {
                    return player.countMark("xinfan_haiyingren_mark") < lib.skill.xinfan_haiyingren.getLimit;
                },
                async cost(event, trigger, player) {
                    const num = Math.min(2, lib.skill.xinfan_haiyingren.getLimit - player.countMark("xinfan_haiyingren_mark"));
                    event.result = await player
                        .chooseToDiscard("he", [1, num], get.prompt(event.skill), "弃置至多两张牌并获得等量标记")
                        .set("logSkill", event.skill)
                        .set("ai", function (card) {
                            if (_status.event.goon) {
                                return 7 - get.value(card);
                            }
                            return 0;
                        })
                        .set(
                            "goon",
                            (() => {
                                if (player.needsToDiscard()) {
                                    return true;
                                }
                                return player.countMark("xinfan_haiyingren_mark") < lib.skill.xinfan_haiyingren.getLimit;
                            })()
                        )
                        .forResult();
                },
                async content(event, trigger, player) {
                    player.addMark("xinfan_haiyingren_mark", event.cards.length);
                    player.logSkill('xinfan_haiyingren');
                },
            },
            mark: {
                intro: {
                    content: "mark",
                },
            },
        },
    },
    xinfan_haihuiren: {
        audio: "ext:阴阳师杀/fenbao/yys/juesebao/hairen:2",
        beginMarkCount: 2,
        chargeSkill: 4,
        trigger: {
            global: "useCardAfter",
        },
        filter(event, player) {
            if (!player.countCharge()) {
                return false;
            }
            return event.card.name == "sha" && (event.player == player || event.targets.includes(player));
        },
        check(trigger, player) {
            const card = new lib.element.VCard({ name: "sha" });
            const targets = game.filterPlayer(target => {
                if (trigger.player == player) {
                    return trigger.targets.includes(target) && player.canUse(card, target, true, false);
                }
                return trigger.player == target && player.canUse(card, target, true, false);
            });
            return targets.reduce((sum, target) => sum + get.effect(target, card, player, player), 0) > 0;
        },
        async content(event, trigger, player) {
            player.removeCharge();
            await player.draw();
            const card = new lib.element.VCard({ name: "sha" });
            const targets = game.filterPlayer(target => {
                if (trigger.player == player) {
                    return trigger.targets.includes(target) && player.canUse(card, target, false, false);
                }
                return trigger.player == target && player.canUse(card, target, false, false);
            });
            if (!targets.length) {
                return;
            }
            await player
                .chooseToUse("是否对" + get.translation(targets) + "使用一张无视防具的杀？", function (card, player, event) {
                    if (get.name(card) != "sha") {
                        return false;
                    }
                    return lib.filter.filterCard.apply(this, arguments);
                })
                .set("targetRequired", true)
                .set("complexSelect", true)
                .set("complexTarget", true)
                .set("filterTarget", function (card, player, target) {
                    if (!get.event().targets.includes(target)) {
                        return false;
                    }
                    return lib.filter.targetEnabled.call(this, card, player, target) ?? false;
                })
                .set("targets", targets)
                .set("oncard", (card) => {
                    card.xinfan_haihuiren = true;
                })
                .set("addCount", false);
        },
        ai: {
            unequip: true,
            skillTagFilter (player, tag, arg) {
                if (!arg || !arg.card || !arg.card.xinfan_haihuiren) {
                    return false;
                }
            },
        },
        group: ["xinfan_haihuiren_init", "xinfan_haihuiren_charge"],
        subSkill: {
            init: {
                trigger: {
                    player: "enterGame",
                    global: "phaseBefore",
                },
                filter(event, player) {
                  if (!player.countCharge(true)) {
                    return false;
                  }
                  return event.name != "phase" || game.phaseNumber == 0;
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                  const num = lib.skill.xinfan_haihuiren.beginMarkCount;
                  player.addCharge(num);
                  await game.delayx();
                  player.logSkill('xinfan_haihuiren');
                },
            },
            charge: {
                trigger: {
                    global: "phaseEnd",
                },
                forced: true,
                locked: false,
                filter(event, player) {
                    if (!player.countCharge(true)) {
                        return false;
                    }
                    return !game.hasPlayer2(target => target.hasHistory("sourceDamage"));
                },
                async content(event, trigger, player) {
                    player.addCharge();
                    await game.delayx();
                    player.logSkill('xinfan_haihuiren');
                },
            },
        },
    },
    xinfan_haiqianying: {
        audio: "ext:阴阳师杀/fenbao/yys/juesebao/hairen:2",
        trigger: {
            source: "damageBegin1",
            player: "damageBegin3",
        },
        usable: 1,
        check(event, player, name) {
            if (name == "damageBegin1") {
                var target = event.player;
                if (get.attitude(player, target) >= 0) {
                    return true;
                }
                return get.damageEffect(target, player, player, event.nature) < 0;
            }
            return true;
        },
        async content(event, trigger, player) {
            trigger.num--;
            const next = game.createEvent("xinfan_haiqianying_effect", false);
            next.player = player;
            next.setContent(() => {
                player.addTempSkill("xinfan_haiqianying_effect");
                player.addMark("xinfan_haiqianying_effect", 1, false);
            });
            event.next.remove(next);
            trigger.after.push(next);
        },
        subSkill: {
            effect: {
                trigger: {
                    source: "damageBegin1",
                    player: "damageBegin3",
                },
                forced: true,
                charlotte: true,
                onremove: true,
                async content(event, trigger, player) {
                    trigger.num += player.countMark(event.name);
                    player.removeSkill(event.name);
                },
                mark: true,
                intro: {
                    content: "本回合你下一次造成或受到的伤害+#",
                },
            },
        },
    },
    //玉藻前
    xinfan_yuduotian: {
        audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuzaoqian:2",
        init(player, skill) {
            player.addSkill("xinfan_yuduotian_record");
            player.addTempSkill("xinfan_yuduotian_mark");
            const num = player.getHistory("sourceDamage").reduce((sum, evt) => sum + evt.num, 0);
            if (num > 0) {
                player.setMark("xinfan_yuduotian_mark", num, false);
            }
        },
        onremove(player, skill) {
            player.removeSkill("xinfan_yuduotian_record");
        },
        getNum(player) {
            return Math.max(0, 2 - player.countMark("xinfan_yuduotian_mark"));
        },
        enable: "phaseUse",
        usable: 1,
        chooseButton: {
            dialog(event, player) {
                const num = lib.skill.xinfan_yuduotian.getNum(player);
                const deslist = [
                    `令至多三名角色各摸${num}张牌，各受到1点火焰伤害`,
                    `你弃置${num}张牌，然后对一名角色造成2点火焰伤害`,
                ];
                const dialog = ui.create.dialog(get.translation("xinfan_yuduotian"));
                dialog.add([
                    deslist.map((item, i) => {
                        return [i == 0 ? "draw" : "discard", item];
                    }),
                    "tdnodes",
                ]);
                dialog.direct = true;
                return dialog;
            },
            backup(links) {
                const next = get.copy(lib.skill[`xinfan_yuduotian_${links[0]}`]);
                return next;
            },
            check(button) {
                const player = get.player();
                switch (button.link) {
                    case 0: {
                        return 1.2 + Math.random();
                    }
                        break;
                    case 1: {
                        return 1.1 + Math.random();
                    }
                        break;
                }
                return 1;
            },
            prompt(links) {
                const player = get.player();
                const num = lib.skill.xinfan_yuduotian.getNum(player);
                const deslist = [
                    `令至多三名角色各摸${num}张牌，各受到1点火焰伤害`,
                    `你弃置${num}张牌，然后对一名角色造成2点火焰伤害`,
                ];
                return deslist[links[0] == "draw" ? 0 : 1];
            },
        },
        ai: {
            order: 1,
            result: {
                player: 1,
            },
        },
        subSkill: {
            backup: {},
            draw: {
                filterTarget: true,
                selectTarget() {
                    return [1, 3];
                },
                multitarget: true,
                multiline: false,
                line: false,
                async content(event, trigger, player) {
                    player.logSkill('xinfan_yuduotian'); 
                    const num = lib.skill.xinfan_yuduotian.getNum(player);
                    await game.asyncDraw(event.targets, num);
                    for (const target of event.targets) {
                        if (!target.isIn()) {
                            continue;
                        }
                        await target.damage("fire");
                    }
                    if (
                        game.getGlobalHistory("everything", evt => {
                            if (evt.name != "die") {
                                return false;
                            }
                            return evt.getParent(event.name) == event;
                        }).length
                    ) {
                        const skill = "xinfan_yuduotian_discard";
                        const prompt2 = get.info("xinfan_yuduotian").chooseButton.prompt(["discard"]);
                        const result = await player
                            .chooseCardTarget({
                                prompt: get.translation(skill),
                                prompt2: prompt2,
                                forceDie: true,
                                filterCard(card) {
                                    return lib.skill.xinfan_yuduotian_discard.filterCard(card);
                                },
                                selectCard() {
                                    return lib.skill.xinfan_yuduotian_discard.selectCard();
                                },
                                filterTarget: true,
                                ai1(card) {
                                    return 7 - get.value(card);
                                },
                                ai2(target) {
                                    const player = get.player();
                                    return get.damageEffect(target, player, player, "fire") * 2;
                                },
                            })
                            .forResult();
                        if (result?.targets?.length) {
                            const next = game.createEvent(skill);
                            next.set("forceDie", true);
                            next.player = player;
                            next.cards = result.cards;
                            next.targets = result.targets;
                            next.setContent(lib.skill[skill].content);
                            await next;
                        }
                    }
                },
                ai: {
                    result: {
                        target(player, target) {
                            const draw = get.effect(target, { name: "draw" }, player, player);
                            const damage = get.damageEffect(target, player, target, "fire");
                            return draw + damage;
                        },
                    },
                },
            },
            discard: {
                filterTarget: true,
                filterCard: (card) => {
                    const player = get.player();
                    if (!lib.filter.cardDiscardable(card, player, "xinfan_yuduotian")) {
                        return false;
                    }
                    const num = lib.skill.xinfan_yuduotian.getNum(player);
                    if (num <= 0) {
                        return false;
                    }
                    return true;
                },
                selectCard() {
                    const player = get.player();
                    const num = lib.skill.xinfan_yuduotian.getNum(player);
                    if (num >= player.countDiscardableCards(player, "he")) {
                        return -1;
                    }
                    return num;
                },
                check(card) {
                    return 7 - get.value(card);
                },
                position: "he",
                lose: false,
                discard: false,
                delay: false,
                async content(event, trigger, player) {
                    player.logSkill('xinfan_yuduotian'); 
                    const target = event.targets[0];
                    if (event?.cards?.length) {
                        await player.discard(event.cards);
                    }
                    const next = target.damage(2, "fire");
                    await next;
                    if (
                        game.getGlobalHistory("everything", evt => {
                            if (evt.name != "die") {
                                return false;
                            }
                            return evt.getParent(2) == next;
                        }).length
                    ) {
                        const skill = "xinfan_yuduotian_draw";
                        const prompt2 = get.info("xinfan_yuduotian").chooseButton.prompt(["draw"]);
                        const result = await player
                            .chooseTarget({
                                prompt: get.translation(skill),
                                prompt2: prompt2,
                                forceDie: true,
                                selectTarget() {
                                    return lib.skill.xinfan_yuduotian_draw.selectTarget();
                                },
                                ai(target) {
                                    const player = get.player();
                                    const att = get.attitude(player, target);
                                    return att * lib.skill.xinfan_yuduotian_draw.ai.result.target(player, target);
                                },
                            })
                            .forResult();
                        if (result?.targets?.length) {
                            const next = game.createEvent(skill);
                            next.set("forceDie", true);
                            next.player = player;
                            next.targets = result.targets;
                            next.setContent(lib.skill[skill].content);
                            await next;
                        }
                    }
                },
                ai: {
                    result: {
                        target(player, target) {
                            return get.damageEffect(target, player, target, "fire") * 2;
                        },
                    },
                },
            },
            record: {
                charlotte: true,
                onremove: true,
                trigger: {
                    source: "damageSource",
                },
                forced: true,
                firstDo: true,
                silent: true,
                filter(event, player) {
                    return event.num > 0;
                },
                async content(event, trigger, player) {
                    player.addTempSkill("xinfan_yuduotian_mark");
                    player.addMark("xinfan_yuduotian_mark", trigger.num, false);
                },
            },
            mark: {
                charlotte: true,
                onremove: true,
            },
        },
    },
    //酒吞童子
        xinfan_guikuangqi: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/jiutuntongzi:2",
            trigger: {
                player: ["damageBegin4","phaseEnd"],
            },
            intro: {
                content: 'mark',
            },
            forced: true,
            filter: function (event, player) {
		        return !player.hasMark('xinfan_guiguishen');
            },
            async content(event, trigger, player) {
				player.addMark("xinfan_guikuangqi", 1, false);
                await player.draw(1);
                if(player.countMark('xinfan_guikuangqi') > 5){
                    player.addMark("xinfan_guiguishen", 1, false);
                }
		    },  
    },
    xinfan_guikuangxiao: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/jiutuntongzi:2",
            mod: {
                targetInRange(card, player, target) {
                    if (card.name == 'sha' && player.hasMark('xinfan_guiguishen')) return true;
                },
            },
            forced: true,
            trigger: {
                player: 'useCard',
            },
            filter(event, player) {
                return event.card.name == "sha" || event.card.name == "jiu";;
            },
            forced: true,
            async content(event, trigger, player) {
                if (trigger.card.name == "sha"){
                    trigger.effectCount += 1;
                } else {
                    player.addMark("xinfan_guikuangqi", 1, false);
                    if(player.hasMark('xinfan_guiguishen')){
                        await player.recover();
                    }
                }
            },      
            global: "xinfan_guikuangxiao_qie",
            subSkill: {
                qie: {
                    trigger: {
                        player: "useCardToTargeted",
                    },
                    filter(event, player) {
                        return event.card.name == "sha" && player.hasMark('xinfan_guiguishen');
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        trigger.target.addTempSkill("qinggang2");
                        trigger.target.storage.qinggang2.add(trigger.card);
                        trigger.target.markSkill("qinggang2");
                    },
                },
            },           
    },
    xinfan_guiguishen: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/jiutuntongzi:2",    
            trigger: {
                player: 'damageBegin',
            },
            intro: {
                content: 'mark',
            },
            usable: 1,
            forced: true,
            filter(event, player) {
                return player.hasMark('xinfan_guiguishen');
            },
		    async content(event, trigger, player) {   
                trigger.num--;
            },
            global: "xinfan_guiguishen_gui",
            subSkill: {
                gui: {
                    trigger: {
                        global: "phaseEnd",
                    },
                    filter(event, player) {
                        return player.hasMark('xinfan_guikuangqi') && player.hasMark('xinfan_guiguishen');
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        game.broadcastAll(function (player) {
						    game.playAudio(`../extension/阴阳师杀/fenbao/yys/juesebao/jiutuntongzi/xinfan_guiguishen${[1,2].randomGet()}.mp3`);
					    }, player);
                        player.removeMark('xinfan_guikuangqi', 1);
                        await player.draw(2);
                        await player.recover();
                        if(player.countMark('xinfan_guikuangqi') == 0){
                            player.removeMark("xinfan_guiguishen", 1, false);
                        }
                    },

                },
            },    
    },
    //狐妖
    xinfan_hujuqi: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yaohu:2",
            trigger: {
                player: "useCardAfter",
            },
            forced: true,
            locked: false,
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yaohu:1",
            trigger: {
                player: "useCardToPlayered",
            },
            filter(event, player) {
                return event.card.name == "sha";
            },
            logTarget: "target",
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yaohu:1",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shiyaolongyechaji:2",
            trigger: {
                player: "phaseBegin",
            },
            forced: true,
            async content(event, trigger, player) {
                await player[player.countMark(event.name) % 2 == 0 ? "gainMaxHp" : "recover"]();
            },
    },
    xinfan_chalunzhuan: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shiyaolongyechaji:2",
            trigger: {
                global: "phaseEnd",
            },
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shiyaolongyechaji:2",
            async content(event, trigger, player) {
                player.tempBanSkill(event.name, "roundStart", false);
                const next = player.insertPhase("xinfan_shixi");
                next.set("phaseList", ["phaseDraw", "phaseUse"]);
                player.addMark("xinfan_chashiyao", 1, false);
            },
    },
    xinfan_chashiji: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shiyaolongyechaji:2",
            filterx(event, player) {
                const evt = event?.getParent("phase");
                if (!evt || evt?.skill != "xinfan_shixi") {
                    return false;
                }
                return game.hasPlayer(target => {
                    return _status.currentPhase == target && target.hasSkill("xinfan_chashiji");
                });
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/beimihu:2",
            trigger: {
                global: "roundStart",
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xiuluoguitongwan:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xiuluoguitongwan:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xiuluoguitongwan:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/geliuduo:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/geliuduo:1",
            subSkill: {
                tag: {
                    intro: {
                        content: '已移除的花色：#',
                    },
                    onremove: true,
                    charlotte: true,
                },
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/geliuduo:2",
            trigger: {
                target: 'useCardToTargeted',
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/geliuduo:2",
            trigger: {
                player: 'damageEnd',
            },
            forced: true,
		    getIndex: event => event.num,
            async content(event, trigger, player) {
                player.draw();
            },
    },
    //不见岳
    xinfan_bushanxing: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/bujianyue:2",
            enable: "phaseUse",
            usable: 1,
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
                            game.broadcastAll(function (player) {
						    game.playAudio(`../extension/阴阳师杀/fenbao/yys/juesebao/bujianyue/xinfan_bushanxing${[1,2].randomGet()}.mp3`);
					    }, player);
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/bujianyue:2",
            trigger: {
            global: "damageBegin",
            },
            usable: 1, 
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
                            } else {
                                return "选项一";
                            }  
                        })
                        .forResult();
                    if(result.control=="选项一"){
                        trigger.num++;
                    } else if(result.control=="选项二"){
                        trigger.num--;
                    }    
            },
    },
    //御怨般若
    xinfan_boyuyuan: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuyuanbore:2",
            trigger: {
                player: 'useCardAfter',
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuyuanbore:2",
            forced: true,
            priority:15,
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
                            global: 'damageBefore',
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
                    filter(event, player){
                        return player.isAlive();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/guiwangjiutuntongzi:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/guiwangjiutuntongzi:2",    
            mark: true,
            intro: {
                content: '每回合1次，造成伤害加1或受到伤害减1。',
            },
            trigger: {
                player: 'damageBegin',
                source: 'damageBegin',
            },
            usable: 1,
            forced: true,
		    async content(event, trigger, player) {   
                if(trigger.source == player){
                    trigger.source.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/guiwang.png`,[100,100])
                    trigger.num++;
                } else {
                    trigger.player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/guiwang.png`,[100,100])
                    trigger.num--;
                }
            },
    },
    xinfan_tunnuyan: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/guiwangjiutuntongzi:2",
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
                player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/nuyan.png`,[100,100])
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/mengshanbaizangzhu:2",
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
                order:9,
                result:{
                player(player) {
                    return 2;
                },
                },
            },
    },
    xinfan_baiyushou: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/mengshanbaizangzhu:1",
            trigger: {
                global: 'roundStart'
            },
            forced: true,
            async content(event, trigger, player) {
                player.draw(2);
                const  result  = await player.chooseTarget(`###御守###令一名角色回复一点体力,若其未受伤则改为获得1点护甲。`)
                    .set('ai', function (tar) {
						return get.attitude(player, tar)
					})
                    .forResult();
                if(result.bool){
                    if(result.targets[0].isDamaged()){
                        result.targets[0].recover(1);
                    } else {
                        result.targets[0].changeHujia();
                    }
                }
            },
    },
    xinfan_baishanshi: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/mengshanbaizangzhu:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/fengyangjun:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/fengyangjun:2",
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
                    player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/fengyangjun/xinfan_fengyangjun2.jpg");
                } else {
                    player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/fengyangjun/xinfan_fengyangjun1.jpg");
                    await player.draw();
                    trigger.parent.baseDamage++;
                }
            },
    },
    xinfan_fengxunbu: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/fengyangjun:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/geye:2",
            trigger: {
                global: 'phaseBegin',
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/geye:2",
            enable: 'phaseUse',
            usable: 1,
	    	filterTarget: true,
            selectTarget:1,
            filter(event, player){
                return game.hasPlayer(function(current) {
                    return current != player;
                });
            },
            async content(event, trigger, player) { 
                const target = event.target;
                    if (!target.hasSkill('xinfan_geheshou_mark')) {	
                        target.addSkill("xinfan_geheshou_mark");
                    }
                target.useSkill("xinfan_geheshou_shou");
            },
            group: ['xinfan_geheshou_he'],
            subSkill: {
                mark: {
                    intro: {
                        content: '受到的伤害无效，当前剩余#次',
                    },
                    mark: true,
                    charlotte: true,
                    usable: 1,
                    forced: true,
                    trigger: {
                        global: 'damageBegin',
                    },
                    charlotte: true,
                    filter(event, player) {
                        return event.player.hasMark('xinfan_geheshou_mark') && event.num > 0;
                    },
                    async content(event, trigger, player) {
                        player.removeMark('xinfan_geheshou_mark', 1);
                        trigger.cancel();
                    },
                }, 
                shou: {
                    forced: true,
                    trigger: {
                        global: 'damageBegin',
                    },
                    charlotte: true,
                    filter(event, player) {
                        return event.player.hasMark('xinfan_geheshou_mark') && event.num > 0;
                    },
                    async content(event, trigger, player) {
                        player.addMark('xinfan_geheshou_mark', 1);
                    },
                },                            
            he: {
                trigger: {  
                    global: "xinfan_geheshou_shouEnd",
                },
                direct: true,
                borrowAsSelf: true,
            filter(event, player) {
                if (!event.player || !event.player.isIn()) return false;
                const source = event.player;
                const actor = this.borrowAsSelf ? player : source;
                if (!actor || !actor.isIn()) return false;
                return this.getOptions(actor, source).length > 0;
            },
            async content(event, trigger, player) {
                const info = lib.skill[event.name];
                if (!info) return;
                const source = trigger.player;
                const actor = info.borrowAsSelf ? player : source;
                const options = info.getOptions(actor, source);
                if (!options.length) return;
                    const buttons = options.map((item, index) => {
                        return [index, get.translation(item.skill) + "（" + item.text + "）"];
                });
                const result = await player
                        .chooseButton(["###" + get.prompt(event.name, source) + "###选择发动" + get.translation(source) + "武将牌上的一个技能", [buttons, "textbutton"]])
                        .set("options", options)
                        .set("ai", button => {
                                const option = get.event().options[button.link];
                                let rank = 1;
                                if (typeof get.skillRank == "function") {
                                        rank = get.skillRank(option.skill, "inout");
                                        if (typeof rank != "number") rank = 1;
                                }
                                return option.type == "phaseUse" ? rank + 0.5 : rank;
                        })
                        .forResult();
                if (!result || !result.bool || !result.links || !result.links.length) return;
                const option = options[result.links[0]];
                player.logSkill(event.name, source == player ? false : source);
                if (source != actor) {
                        game.log(player, "发动了", source, "武将牌上的", "【" + get.translation(option.skill) + "】");
                }
                if (option.type == "phaseUse") {
                        await info.runPhaseUse(event, actor, option.skill);
                }
                else {
                        await info.runStageBegin(event, actor, option.skill, option.triggername, option.role, source);
                }
            },
            getSourceSkills(source) {
                let skills = [];
                if (source && typeof source.getStockSkills == "function") {
                        skills = source.getStockSkills(false, false, false);
                }
                if ((!skills || !skills.length) && source && typeof source.getOriginalSkills == "function") {
                        skills = source.getOriginalSkills();
                }
                return (skills || []).filter(skill => this.isSkillAllowed(skill)).unique();
            },
            isSkillAllowed(skill) {
                const info = get.info(skill);
                if (!info) return false;
                if (!lib.translate[skill] || !lib.translate[skill + "_info"]) return false;
                if (info.limited || info.zhuSkill || info.juexingji || info.dutySkill) return false;
                if (info.persevereSkill || info.charlotte || info.hiddenSkill) return false;
                if (info.temp || info.sub || info.groupSkill || info.silent) return false;
                return true;
            },
            getBorrowableEntries(source, actor) {
                const entries = [];
                for (const skill of this.getSourceSkills(source)) {
                    if (this.isPhaseUseType(actor, skill)) {
                        entries.push({ skill, type: "phaseUse", text: "出牌阶段" });
                    }
                    for (const item of this.getStageBeginTriggers(skill)) {
                        entries.push({
                            skill,
                            type: "stageBegin",
                            triggername: item.name,
                            role: item.role,
                            text: this.getStageText(item.name)
                        });
                    }
                }
                return entries;
              },
            getOptions(actor, source) {
                const list = [];
                const entries = this.getBorrowableEntries(source, actor);
                for (const item of entries) {
                    if (item.type == "phaseUse") {
                        if (this.canPhaseUse(actor, item.skill)) list.push(item);
                    }
                    else if (this.canStageBegin(actor, source, item.skill, item.triggername, item.role)) {
                        list.push(item);
                    }
                }
                return list;
            },
            withEvent(evt, func) {
                const old = _status.event;
                _status.event = evt;
                try {
                    return func();
                }
                finally {
                    _status.event = old;
                }
            },
            borrowInit(actor, skill, func) {
                const info = get.info(skill);
                const owned = actor && actor.hasSkill && actor.hasSkill(skill, null, null, false);
                const hasStorage = actor && actor.storage && Object.prototype.hasOwnProperty.call(actor.storage, skill);
                const oldStorage = hasStorage ? actor.storage[skill] : undefined;
                let inited = false;
                if (actor && info && !owned && typeof info.init == "function") {
                    try {
                        info.init(actor, skill);
                        inited = true;
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                const restore = () => {
                    if (!inited || !actor || !actor.storage) return;
                    if (hasStorage) actor.storage[skill] = oldStorage;
                    else delete actor.storage[skill];
                };
                try {
                    const result = func();
                    if (result && typeof result.then == "function") {
                            return result.finally(restore);
                    }
                    restore();
                    return result;
                }
                catch (e) {
                    restore();
                    throw e;
                }
            },
            enableMatches(enable, evt) {
                if (typeof enable == "function") return enable(evt);
                if (Array.isArray(enable)) return enable.some(item => this.enableMatches(item, evt));
                if (enable == "phaseUse") return evt.type == "phase";
                if (typeof enable == "string") return enable == evt.name;
                return false;
            },
            makeChooseEvent(actor, skill) {
                const phaseUse = {
                    name: "phaseUse",
                    type: "phase",
                    player: actor,
                    getParent(level, forced) {
                        return forced ? undefined : {};
                    }
                };
                const choose = {
                    name: "chooseToUse",
                    type: "phase",
                    player: actor,
                    skill,
                    _aiexclude: [],
                    filterCard(card, player, event) {
                        return lib.filter.filterCard(card, player, event || choose);
                    },
                    filterTarget(card, player, target) {
                        return lib.filter.filterTarget(card, player, target);
                    },
                    getParent(level, forced, includeSelf) {
                        if ((includeSelf || level == 0) && (level == "chooseToUse" || level === 0)) return choose;
                        if (level == "phaseUse" || level === 1) return phaseUse;
                        if (typeof level == "function") {
                                if (level(choose)) return choose;
                                if (level(phaseUse)) return phaseUse;
                            }
                            return forced ? undefined : {};
                        },
                    getTrigger() {
                        return null;
                    }
                };
                return choose;
            },
            isPhaseUseType(actor, skill) {
                const info = get.info(skill);
                if (!info || !info.enable) return false;
                const evt = this.makeChooseEvent(actor, skill);
                return this.withEvent(evt, () => this.enableMatches(info.enable, evt));
            },
            canPhaseUse(actor, skill) {
                if (!actor || !actor.isIn()) return false;
                const info = get.info(skill);
                if (!info || !info.enable) return false;
                return this.borrowInit(actor, skill, () => {
                    const evt = this.makeChooseEvent(actor, skill);
                    return this.withEvent(evt, () => {
                        if (!this.enableMatches(info.enable, evt)) return false;
                        if (info.filter && !info.filter(evt, actor)) return false;
                        if (info.viewAs && typeof info.viewAs != "function") {
                                if (info.viewAsFilter && info.viewAsFilter(actor) === false) return false;
                                if (evt.filterCard && !evt.filterCard(get.autoViewAs(info.viewAs, "unsure"), actor, evt)) return false;
                        }
                        if (info.usable != undefined) {
                            let num = info.usable;
                            if (typeof num == "function") num = info.usable(skill, actor);
                            if (typeof num == "number" && get.skillCount(skill, actor) >= num) return false;
                        }
                        if (info.round && info.round - (game.roundNumber - actor.storage[skill + "_roundcount"]) > 0) return false;
                        if (this.isTempBanned(actor, skill)) return false;
                        return this.hasBasicCost(actor, info, evt);
                    });
                });
            },
            isTempBanned(actor, skill) {
                if (!actor || !actor.storage) return false;
                for (const item in actor.storage) {
                    if (!item.startsWith("temp_ban_") || actor.storage[item] !== true) continue;
                    const name = item.slice(9);
                    if (!lib.skill[name]) continue;
                    const list = [name];
                    game.expandSkills(list);
                    if (list.includes(skill)) return true;
                }
                return false;
            },
            hasBasicCost(actor, info, evt) {
                if (info.chooseButton) return true;
                let filterCard = info.filterCard ? get.filter(info.filterCard) : null;
                let selectCard = info.selectCard == undefined ? (filterCard ? 1 : 0) : info.selectCard;
                selectCard = this.withEvent(evt, () => get.select(selectCard));
                if (selectCard[1] >= 0 && selectCard[0] > selectCard[1]) return false;
                if (filterCard && (selectCard[0] > 0 || selectCard[0] < 0)) {
                    const position = info.position || "h";
                    let count = 0;
                    for (const card of actor.getCards(position)) {
                        let ok = false;
                        try {
                            ok = filterCard(card, actor, evt);
                        }
                        catch (e) {
                            ok = false;
                        }
                        if (ok) count++;
                        }
                        if (selectCard[0] > 0 && count < selectCard[0]) return false;
                        if (selectCard[0] < 0 && count <= 0) return false;
                }
                if (!this.hasTargetCost(actor, info, evt)) return false;
                return true;
            },
            hasTargetCost(actor, info, evt) {
                if (info.notarget) return true;
                const filterTarget = info.filterTarget ? get.filter(info.filterTarget, 2) : null;
                let selectTarget = info.selectTarget == undefined ? (filterTarget ? 1 : 0) : info.selectTarget;
                let card = null;
                if (info.viewAs && typeof info.viewAs != "function") {
                    card = get.autoViewAs(info.viewAs, "unsure");
                }
                evt._get_card = card;
                const range = this.withEvent(evt, () => get.select(selectTarget));
                delete evt._get_card;
                let min = range[0];
                if (min < 0) min = filterTarget ? 1 : 0;
                if (min <= 0) return true;
                if (!filterTarget) return true;
                let count = 0;
                for (const target of game.filterPlayer(current => current.isIn())) {
                    let ok = false;
                    try {
                        ok = filterTarget(card, actor, target);
                    }
                    catch (e) {
                        ok = false;
                    }
                    if (ok) count++;
                    if (count >= min) return true;
                }
                return false;
            },
            getStageBeginTriggers(skill) {
                const info = get.info(skill);
                const result = [];
                const names = ["phaseBegin", "phaseZhunbeiBegin", "phaseJudgeBegin", "phaseDrawBegin", "phaseUseBegin",
                "phaseDiscardBegin", "phaseJieshuBegin"];
                if (!info || !info.trigger) return result;
                for (const role in info.trigger) {
                    let list = info.trigger[role];
                    if (typeof list == "string") list = [list];
                    if (!Array.isArray(list)) continue;
                    for (const name of list) {
                        if (names.includes(name)) result.push({ name, role });
                    }
                }
                return result;
            },
            getStageText(name) {
                const map = {
                    phaseBegin: "回合开始",
                    phaseZhunbeiBegin: "准备阶段开始",
                    phaseJudgeBegin: "判定阶段开始",
                    phaseDrawBegin: "摸牌阶段开始",
                    phaseUseBegin: "出牌阶段开始",
                    phaseDiscardBegin: "弃牌阶段开始",
                    phaseJieshuBegin: "结束阶段开始"
                };
                return map[name] || name;
            },
            getPhaseEventName(triggername) {
                if (triggername == "phaseBegin") return "phase";
                if (triggername.endsWith("Begin")) return triggername.slice(0, -5);
                return triggername;
            },
            makeFakeTrigger(actor, source, triggername, role) {
                const name = this.getPhaseEventName(triggername);
                const phaseOwner = role == "player" ? actor : (source || actor);
                const fake = {
                    name,
                    player: phaseOwner,
                    source: actor,
                    target: actor,
                    triggername,
                    _notrigger: [],
                    finished: false,
                    getParent(level, forced, includeSelf) {
                        if ((includeSelf || level == 0) && (level == name || level == triggername || level === 0)) return fake;
                        if (level == name || level == triggername) return fake;
                        if (typeof level == "function" && level(fake)) return fake;
                        return forced ? undefined : {};
                    },
                    getTrigger() {
                            return fake;
                    },
                    finish() {
                            this.finished = true;
                    },
                    cancel() {
                            this.finished = true;
                    }
                };
                return fake;
            },
            canStageBegin(actor, source, skill, triggername, role) {
                if (!actor || !actor.isIn()) return false;
                const info = get.info(skill);
                if (!info || !info.trigger || !info.content) return false;
                return this.borrowInit(actor, skill, () => {
                    const fake = this.makeFakeTrigger(actor, source, triggername, role);
                    if (role != "global" && actor != fake[role]) return false;
                    if (info.filter && !info.filter(fake, actor, triggername)) return false;
                    if (fake._notrigger.includes(actor) && !lib.skill.global.includes(skill)) return false;
                    if (info.usable != undefined) {
                        let num = info.usable;
                        if (typeof num == "function") num = info.usable(skill, actor);
                        if (typeof num == "number" && (actor.getStat("triggerSkill")[skill] || 0) >= num) return false;
                    }
                    if (info.round && info.round - (game.roundNumber - actor.storage[skill + "_roundcount"]) > 0) return false;
                    if (this.isTempBanned(actor, skill)) return false;
                    return true;
                });
            },
            makeDetachedEvent(name) {
                const evt = game.createEvent(name, false);
                if (evt.parent && evt.parent.next && evt.parent.next.includes(evt)) evt.parent.next.remove(evt);
                if (evt.parent && evt.parent.after && evt.parent.after.includes(evt)) evt.parent.after.remove(evt);
                evt.parent = undefined;
                return evt;
            },
            reparentEvent(evt, parent) {
                if (!evt || !parent) return evt;
                if (evt.parent && evt.parent.next && evt.parent.next.includes(evt)) evt.parent.next.remove(evt);
                if (evt.parent && evt.parent.after && evt.parent.after.includes(evt)) evt.parent.after.remove(evt);
                evt.parent = undefined;
                parent.next.push(evt);
                return evt;
            },
            makeBorrowUseParent(actor, skill, cards, targets) {
                const phaseUse = this.makeDetachedEvent("phaseUse");
                phaseUse.player = actor;
                phaseUse.type = "phase";
                const chooseToUse = this.makeDetachedEvent("chooseToUse");
                chooseToUse.player = actor;
                chooseToUse.type = "phase";
                chooseToUse.skill = skill;
                chooseToUse.cards = cards || [];
                chooseToUse.targets = targets || [];
                chooseToUse._aiexclude = [];
                const skillEvent = this.makeDetachedEvent("useSkill");
                skillEvent.player = actor;
                skillEvent.skill = skill;
                skillEvent.cards = cards || [];
                skillEvent.targets = targets || [];
                skillEvent.num = 0;
                phaseUse.next.push(chooseToUse);
                chooseToUse.next.push(skillEvent);
                return { phaseUse, chooseToUse, skillEvent };
            },
            async runPhaseUse(parent, actor, skill) {
                await this.borrowInit(actor, skill, async () => {
                    const next = actor.chooseToUse();
                    next.set("type", "phase");
                    next.set("chooseonly", true);
                    next.set("prompt", "发动【" + get.translation(skill) + "】");
                    next.backup(skill);
                    const result = await next.forResult();
                    if (!result || !result.bool) return;
                    if (result._sendskill) {
                        lib.skill[result._sendskill[0]] = result._sendskill[1];
                    }
                    if (result.skill) {
                        const rinfo = get.info(result.skill);
                        if (rinfo && rinfo.onuse) rinfo.onuse(result, actor);
                    }
                    if (result.card || !result.skill) {
                        const card = result.card || (result.cards && result.cards[0]);
                        if (!card) return;
                        result.used = card;
                        const use = actor.useCard(card, result.cards || [], result.targets || [], result.skill);
                        if (result._apply_args) {
                            for (const key in result._apply_args) use[key] = result._apply_args[key];
                        }
                        await use;
                    }
                    else if (result.skill == "xinxuanbei") {
                         await this.executeXinxuanbei(parent, actor, result.targets || []);
                    }
                    else {
                        result.used = result.skill;
                        await this.executeEnabledSkill(parent, actor, result.skill, result.cards || [], result.targets || []);
                    }
                });
            },
            async runStageBegin(parent, actor, skill, triggername, role, source) {
                const info = get.info(skill);
                if (!info || !info.content) return;
                await this.borrowInit(actor, skill, async () => {
                    const fake = this.makeFakeTrigger(actor, source, triggername, role);
                    let result = { bool: true };
                    if (!info.forced && typeof info.cost == "function") {
                        const cost = game.createEvent(skill + "_cost");
                        cost.player = actor;
                        cost.forceDie = true;
                        cost.includeOut = true;
                        cost._trigger = fake;
                        cost.triggername = triggername;
                        cost.skill = skill;
                        if (info.forceDie) cost.forceDie = true;
                        if (info.forceOut) cost.includeOut = true;
                        cost.setContent(info.cost);
                        result = await cost.forResult();
                    }
                    if (result && result.control) result.bool = !String(result.control).includes("cancel");
                    if (!result || !result.bool) {
                        if (info.oncancel) info.oncancel(fake, actor);
                        return;
                    }
                    let targets = null;
                    if (result.targets && result.targets.length) targets = result.targets.slice(0);
                    else if (info.logTarget) {
                        if (typeof info.logTarget == "string") targets = fake[info.logTarget];
                        else if (typeof info.logTarget == "function") targets = info.logTarget(fake, actor, triggername);
                    }
                    if (get.itemtype(targets) == "player") targets = [targets];
                    if (info.popup != false && !info.direct && !("skill_popup" in result && !result.skill_popup)) {
                        actor.logSkill(typeof info.popup == "string" ? [skill, info.popup] : skill, info.logLine === false ? false : targets,
                        info.line, null, [fake, actor, triggername, null, result]);
                    }
                    if (info.usable != undefined) {
                        actor.getStat("triggerSkill")[skill] = (actor.getStat("triggerSkill")[skill] || 0) + 1;
                    }
                    if (info.round) {
                        const roundname = skill + "_roundcount";
                        actor.storage[roundname] = game.roundNumber;
                        actor.syncStorage(roundname);
                        actor.markSkill(roundname);
                    }
                    const next = game.createEvent(skill);
                    next.player = actor;
                    next._trigger = fake;
                    next.triggername = triggername;
                    next.skill = skill;
                    if (info.forceDie) next.forceDie = true;
                    if (info.forceOut) next.includeOut = true;
                    if (get.itemtype(targets) == "players") next.targets = targets.slice(0);
                    if (get.itemtype(result.cards) == "cards") next.cards = result.cards.slice(0);
                    if ("cost_data" in result) next.cost_data = result.cost_data;
                    next.setContent(info.content);
                    await next;
                });
            },
            async executeXinxuanbei(parent, actor, targets) {
                const target = targets && targets[0];
                if (!target || !target.isIn() || !target.hasCards("hej")) return;
                actor.logSkill("xinxuanbei", target);
                const result = await actor.choosePlayerCard({
                    target,
                    position: "hej",
                    forced: true
                }).forResult();
                if (!result.bool || !result.cards || !result.cards.length) return;
                const card = result.cards[0];
                const cardx = get.autoViewAs({ name: "sha" }, [card]);
                if (get.position(card) != "j" && !game.checkMod(card, target, "unchanged", "cardEnabled2", target) || !
                target.canUse(cardx, actor, false)) return;
                const damagedByThisSha = evt => {
                    if (!evt || evt.source != target || !evt.card) return false;
                    return evt.card.name == "sha" || get.name(evt.card) == "sha";
                };
                const before = actor.getHistory("damage", damagedByThisSha).length;
                await target.useCard({
                    card: cardx,
                    cards: [card],
                    targets: [actor],
                    addCount: false
                });
                const after = actor.getHistory("damage", damagedByThisSha).length;
                await actor.draw(after > before ? 2 : 1);
            },
            async executeEnabledSkill(parent, actor, skill, cards, targets) {
                const info = get.info(skill);
                if (!info || !info.content) return;
                cards = cards || [];
                targets = targets || [];
                if (get.itemtype(targets) == "player") targets = [targets];
                if (!Array.isArray(targets)) targets = [];
                const context = this.makeBorrowUseParent(actor, skill, cards, targets);
                const waitings = [];
                let losecard = null;
                if (cards.length) {
                    if (info.discard != false && info.lose != false && !info.viewAs) {
                        const next = actor.discard(cards);
                        next.delay = false;
                        this.reparentEvent(next, context.skillEvent);
                        waitings.push(next);
                    }
                    else if (info.lose != false) {
                        losecard = actor.lose(cards, ui.special);
                        this.reparentEvent(losecard, context.skillEvent);
                        if (info.losetrigger == false) losecard._triggered = null;
                        if (info.visible) losecard.visible = true;
                        if (info.loseTo) losecard.position = ui[info.loseTo];
                        if (info.insert) losecard.insert_card = true;
                        if (losecard.position == ui.special && info.toStorage) losecard.toStorage = true;
                        waitings.push(losecard);
                        if (!info.prepare && info.viewAs) {
                            actor.$throw(cards);
                            losecard.visible = true;
                        }
                    }
                }
                if (info.line != false && targets.length) {
                    let line = {};
                    if (get.is.object(info.line)) line = info.line;
                    else if (info.line == "fire") line.color = "fire";
                    else if (info.line == "thunder") line.color = "thunder";
                    else if (info.line === undefined || info.line == "green") line.color = "green";
                    if (info.multitarget && !info.multiline && targets.length > 1) actor.line2(targets, line);
                    else actor.line(targets, line);
                }
                if (!info.direct && info.log !== false) {
                    actor.logSkill(info.sourceSkill || skill, info.log == "notarget" ? false : targets, info.line);
                }
                if (actor.getStat) {
                    const stat = actor.getStat("skill");
                    stat[skill] = (stat[skill] || 0) + 1;
                    if (info.sourceSkill) stat[info.sourceSkill] = (stat[info.sourceSkill] || 0) + 1;
                    const allStat = actor.getStat();
                    allStat.allSkills = (allStat.allSkills || 0) + 1;
                }
                if (info.prepare) {
                    if (info.prepare == "give") {
                            if (losecard) losecard.visible = true;
                            actor.$give(cards, targets[0]);
                    }
                    else if (info.prepare == "give2") actor.$give(cards.length, targets[0]);
                    else if (info.prepare == "throw") {
                            if (losecard) losecard.visible = true;
                            actor.$throw(cards);
                    }
                    else if (info.prepare == "throw2") actor.$throw(cards.length);
                    else info.prepare(cards, actor, targets);
                }
                if (info.round) {
                    const roundname = skill + "_roundcount";
                    actor.storage[roundname] = game.roundNumber;
                    actor.syncStorage(roundname);
                    actor.markSkill(roundname);
                }
                if (waitings.length) await Promise.all(waitings);
                if (info.contentBefore) {
                    const before = game.createEvent(skill + "ContentBefore");
                    this.reparentEvent(before, context.skillEvent);
                    before.player = actor;
                    before.skill = skill;
                    before.cards = cards;
                    before.targets = targets;
                    if (info.forceDie) before.forceDie = true;
                    if (info.forceOut) before.includeOut = true;
                    before.setContent(info.contentBefore);
                    await before;
                }
                const list = info.multitarget ? [targets[0]] : (targets.length ? targets.slice(0) : [undefined]);
                if (!info.multitarget && targets.length > 1) {
                    lib.tempSortSeat = actor;
                    targets.sort(lib.sort.seat);
                    delete lib.tempSortSeat;
                }
                for (let i = 0; i < list.length; i++) {
                    const target = list[i];
                    if (target && target.isDead && target.isDead() && !info.deadTarget) continue;
                    if (target && target.isOut && target.isOut() && !info.includeOut) continue;
                    const next = game.createEvent(skill);
                    this.reparentEvent(next, context.skillEvent);
                    next.player = actor;
                    next.skill = skill;
                    next.cards = cards;
                    next.targets = targets;
                    next.target = target;
                    next.num = i;
                    next.multitarget = info.multitarget;
                    if (info.forceDie) next.forceDie = true;
                    if (info.forceOut) next.includeOut = true;
                    next.setContent(info.content);
                    await next;
                    if (info.multitarget) break;
                    }
                    if (info.contentAfter) {
                        const after = game.createEvent(skill + "ContentAfter");
                        this.reparentEvent(after, context.skillEvent);
                        after.player = actor;
                        after.skill = skill;
                        after.cards = cards;
                        after.targets = targets;
                        if (info.forceDie) after.forceDie = true;
                        if (info.forceOut) after.includeOut = true;
                        after.setContent(info.contentAfter);
                        await after;
                    }
                },
            },   
        },    
        ai:{
                order:9,
                result:{
                    player(player) {
                        return 2;
                    },
                    target(player, target) {
                        if (target == player) return 2;
                        return 4;
                    },
                    },
            },
    },

    //辉夜姬
    xinfan_huiyuejing: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/huiyeji:2",
            trigger: {
                global: 'phaseBegin',
            },
            intro: {
                content: 'mark',
            },
            marktext: '辉',
            forced: true,
            priority:15,
            async content(event, trigger, player) {
                player.addMark('xinfan_huiyuejing', 1);
            },
            group: ['xinfan_huiyuejing_damage'],
            subSkill: {
                damage: {
                    trigger: {
                        global: 'damageBegin',
                    },
                    usable: 1,
                    forced: true,
                    async content(event, trigger, player) {
                        player.addMark('xinfan_huiyuejing', 1);
                        game.broadcastAll(function (player) {
						    game.playAudio(`../extension/阴阳师杀/fenbao/yys/juesebao/huiyeji/xinfan_huiyuejing${[1,2].randomGet()}.mp3`);
					    }, player);
                    },
                },
            },    
    },
    xinfan_huihuiye: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/huiyeji:2",
            trigger: {
                global: ['phaseBegin', 'damageAfter'],
            },
            filter(event, player, name) {
                return player.countMark('xinfan_huiyuejing') >= 2 && event.player.isAlive();
            },
            async cost(event, trigger, player) {
                player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/huiye.png`,[100,100])
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/zhuiyueshen:1",
            trigger: {
                target: "useCardToBefore",
            },
            usable: 1,
            check(event, player) {
                return get.effect(player, event.card, event.player, player) < 0;
            },
            filter: function (event,player){
                return event.player!=player;
            },
            async content(event, trigger, player) {
	            trigger.cancel();                
	            await player.useSkill('xinfan_zhuiyaoyue');	     
            },
    },
    xinfan_zhuiyaoyue: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/zhuiyueshen:2",
            zhuanhuanji: true,
            usable: 1,
            forced: true,
            mark: true,
            marktext: '☯',
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
							})
                            .forResult();
                        if(result.bool){
                            await result.targets[0].draw(1);
                        }
                    }
            },
    },
    //因幡辉夜姬
    xinfan_fanyuanman: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yinfanhuiyeji:2",
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
                        })
                        .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yinfanhuiyeji:3",
            trigger: {
                global: ['damageBegin', 'recoverBegin'],
            },  
            filter(event, player) {
                return player.countMark('xinfan_fanyuanman') > 1;
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
                await player.removeMark('xinfan_fanyuanman', 2);      
                trigger.num++;
            },
    },
    //寻香行
    xinfan_xunxiangyin: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xunxiangxing:2",
            trigger: {
                global: 'phaseEnd',
            },
            priority:15,       
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xunxiangxing:2",
            intro: {
                content: 'mark',
            },
            forced: true,
            trigger: {
                player: 'phaseEnd',
                global: 'damageEnd',
            }, 
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/daoheshenyuzhuanjing:2",
            trigger: {
                player: 'useCardToPlayered',
            },        
            filter(event, player) {
                return get.name(event.card) == 'sha';
            },
            logTarget: 'target',
            frequent: true,
            async content(event, trigger, player) {
                trigger.target.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/feng.png`,[100,100])
                const result = await player
                    .judge()
                    .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/daoheshenyuzhuanjing:2",
            trigger: {
               global: "phaseEnd",
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/daoheshenyuzhuanjing:2",
            filterTarget: true,
            enable: 'phaseUse',
            usable: 1,
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
            ai: {
                order: 9,
                result: {
                    target: 9,
                },
            },
    },
    //本真三尾狐
    xinfan_huhuying: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/benzhensanweihu:2",
            trigger: {
                global: 'damageEnd',
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/benzhensanweihu:2",
            trigger: {
                source: "damageEnd",
            },
            priority:15,
            forced: true,
        async content(event, trigger, player) {
            if(_status.currentPhase != player){
                player.gainPlayerCard(true, trigger.player,"he");
            } else {
                player.recover();
            }
        },
    },
    xinfan_hulinghe: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/benzhensanweihu:1",
            trigger: {
                player: "phaseEnd",
            },
            forced: true,
            async content(event,trigger,player){
                if(player.hujia > 0){
                   await player.changeHujia(1);    
                } else {
                    await player.changeHujia(2);  
                }          
            },
    },
    //月读
    xinfan_yuexvdan: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuedu:2",
            mark: true,
            marktext: '☯',
            zhuanhuanji: true,
            forced: true,
            trigger: {
                player: 'useCard2',
                target: 'useCardToTargeted',
                },
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
            async content(event,trigger,player){
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
                                async content(event,trigger,player){
                                    game.broadcastAll(function (player) {
						                game.playAudio(`../extension/阴阳师杀/fenbao/yys/juesebao/yuedu/xinfan_yuehuang${[1].randomGet()}.mp3`);
					                }, player);
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
                    async content(event,trigger,player){
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
                    async content(event,trigger,player){
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
                            player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/yuedu/xinfan_yuedu2.jpg"); 
                        } else {
                            player.clearMark('xinfan_yuexvdan_hui');
                            player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/yuedu/xinfan_yuedu.jpg");                
                        }
                    },
                },
            },
    },
    xinfan_yuetianji: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuedu:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuedu:2",
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
            async content(event, trigger, player) {
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/longyechaji:2",
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
                            })
                        .forResult();
                    if(result.bool){
                    await result.targets[0].damage(1);
                    }  
                }
                if(num > 1){
                    await player.recover();
                }
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
    xinfan_chayueheng: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/longyechaji:2",
            enable: "phaseUse",
            usable: 1,
            mark: true,
            onremove: true,
                intro: {
                    content: '当前招式：$',
                },
            async content(event, trigger, player) {   
            const choiceList = ['侵略：造成伤害时，获得对方一张牌。','飞流：造成的伤害加一。','风疾：造成或受到的伤害视为体力流失。','不动：造成或受到伤害时，摸一张牌。',];
            const choices = ['侵略','飞流','风疾','不动'];
            var result = await player
                .chooseControl()
                .set('controls', choices)
                .set('choiceList', choiceList)
                .set('prompt','月恒： 请选择其中一项')
                .set("ai", () => {
                            if (player.getSeatNum() != 1 && game.phaseNumber == 0) {
                                return "不动";
                            } else {
                                return "飞流";
                            }  
                        })
                .forResult();
            if (result.control == '侵略'){
                await player.setStorage('xinfan_chayueheng',"xinfan_chayueheng_qin");
            }else if (result.control == '飞流'){
                await player.setStorage('xinfan_chayueheng',"xinfan_chayueheng_liu");
            }else if (result.control == '风疾'){
                await player.setStorage('xinfan_chayueheng',"xinfan_chayueheng_feng");
            }else if (result.control == '不动'){
                await player.setStorage('xinfan_chayueheng',"xinfan_chayueheng_dong");
            }
            },
            group: ['xinfan_chayueheng_kai','xinfan_chayueheng_qin','xinfan_chayueheng_liu','xinfan_chayueheng_feng','xinfan_chayueheng_dong'], 
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
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/longyechaji:1",
                    trigger: {
                        source: "damageBegin",
                    },
                    forced: true,
                    filter(event, player) {
                        return player.getStorage('xinfan_chayueheng').includes('xinfan_chayueheng_qin');
                    },
                    async content(event, trigger, player) {         
                        player.gainPlayerCard(true, trigger.player,"he");
                        player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/qinlue.png`,[100,100])
                    },
                },
                liu: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/longyechaji:1",
                    trigger: {
                    source: "damageBegin",
                    },
                    forced: true,
                    filter(event, player) {
                        return player.getStorage('xinfan_chayueheng').includes('xinfan_chayueheng_liu');
                    },
                    async content(event, trigger, player) {   
                        player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/feiliu.png`,[100,100])      
                        trigger.num++;
                    },
                },  
                feng: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/longyechaji:1",
                    trigger: {
                    player: 'damageBefore',
                    source: "damageBefore",
                    },
                    forced: true,
                    filter(event, player) {
                        return player.getStorage('xinfan_chayueheng').includes('xinfan_chayueheng_feng');
                    },
                    async content(event, trigger, player) { 
                        player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/fengji.png`,[100,100])
                        trigger.cancel();
                        const num = trigger.num;
                        trigger.player.loseHp(num);
                    },
                },   
                dong: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/longyechaji:1",
                    trigger: {
                        player: 'damageBegin',
                        source: "damageBegin",
                    },
                    forced: true,
                    filter(event, player) {
                        return player.getStorage('xinfan_chayueheng').includes('xinfan_chayueheng_dong');
                    },
                    async content(event, trigger, player) {  
                        player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/budong.png`,[100,100])       
                        player.draw();
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
    //伊邪娜美
    xinfan_meifenzheng: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yixienamei:2",
            trigger: {
            player: 'phaseZhunbeiBegin',
            },
            forced: true,
            priority:15,
            async content(event,trigger,player){
                game.broadcastAll(function () {
                    ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/zhanyushijiejintou.jpg');
                    })
                if(_status.tempMusic != "ext:阴阳师杀/fenbao/yys/yinyue/zhanyushijiejintou.mp3"){
                    game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/zhanyushijiejintou.mp3"); 
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
                        const  result  = await player.chooseTarget(`###纷争###对一名角色造成一点伤害`,function (card, player, target) {
                            return target != _status.currentPhase;
                        },true)
                           .set('ai', target => {
                                const player = _status.event.player;
                                return get.damageEffect(target, player, player,);      
                            })
                            .forResult();
                        if(result.bool){
                            await result.targets[0].damage(1,);
                        }                            
                    },    
                },                                
            },   
    },  
    xinfan_meichenlun: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yixienamei:2",
            enable: "phaseUse",
            filterTarget(card, player, target) {
                return target != player && !target.hasSkill('xinfan_meichenlun_skip') && !player.getStorage('xinfan_meichenlun').includes(target);
            },
            selectTarget:1,
                onremove: true,
                intro: {
                    content: '不能成为目标的角色有：$',
                },
            charlotte: true,
            async content(event, trigger, player) {
                const target = event.target;
                target.addTempSkill("xinfan_meichenlun_skip", { player: "xinfan_meichenlun_skipAfter" }); 
                player.markAuto('xinfan_meichenlun',  target);   
            },
            group: ['xinfan_meichenlun_used'],
            subSkill: { 
                skip: {
                    trigger: {
                        player: 'phaseBefore',
                    },
                    mark: true,
                    intro: {
                        content: '跳过下个回合',
                    },
                    charlotte: true,
                    priority: -4,
                    forced: true,
                    async content(event, trigger, player) {
                        trigger.cancel();
                    },
                },
                used: {
                    trigger: {
                        global: 'phaseEnd',
                    },
                    filter(event, player) {
                        return player.getStorage('xinfan_meichenlun').includes(event.player);
                    },
                    forced: true,
                    async content(event, trigger, player) {
                        player.unmarkAuto('xinfan_meichenlun', trigger.player);
                    },
                    }
            },
            ai:{
                order:9,
                result:{
                player(player) {
                    return 2;
                },
                target:-3,
                },
            },
    },
    //孔雀明王
    xinfan_quemili: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/kongquemingwang:2",
            trigger: {
                global: 'useCard2',
            },
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
                const  result  = await player
                    .judge(c => (get.type(c) == 'basic' ? 2 : -1))
                    .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/kongquemingwang:1",
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
                    await player.recover();
                    await player.draw(player.countMark('xinfan_quemili'));
                    await player.changeSkills(['xinfan_quequewu'], ['xinfan_quemili']);
                    player.markSkill('xinfan_quemili');
                    player.tempBanSkill('xinfan_quequewu_use');
                    player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/kongquemingwang/xinfan_kongquemingwang_jie.jpg");
                    await player.addTempBackGroundOL("/extension/阴阳师杀/fenbao/yys/beijing/jingjimeigui.jpg", 0, {player: "phaseJieshuEnd"})
                    if(_status.tempMusic != "ext:阴阳师杀/fenbao/yys/yinyue/jingjimeigui.mp3"){
                        game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/jingjimeigui.mp3"); 
                    }
                } else {
                    player.changeSkills(['xinfan_quemili'], ['xinfan_quequewu']);
                    player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/kongquemingwang/xinfan_kongquemingwang.jpg");
                }
            },
    },
    xinfan_quequewu: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/kongquemingwang:2",
            mod: {
                targetInRange(card, player, target) {
                    if (card.name == 'sha') return true;
                },
                cardUsable(card, player, num) {
                    if (card.name == 'sha') return Infinity;
                },
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
            ai: {
                unequip: true,
            },
    },
    //言灵
    xinfan_yanyuzui: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yanling:2",
            trigger: {
                global: 'roundStart',
            },      
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
            async content(event, trigger, player) {
                player.markAuto('xinfan_yanyuzui_recorded', event.cost_data.do);
                player.unmarkAuto('xinfan_yanyuzui_recorded', event.cost_data.undo);
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
                    async content(event, trigger, player) {
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
            ai: {
                combo: 'xinfan_yukuangmo',
            },
    }, 
    xinfan_yankuangmo: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yanling:3",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yanling:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/linghaijinyuji:3",
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
                        audio: "ext:阴阳师杀/fenbao/yys/juesebao/linghaijinyuji:1",
                        trigger: {
                            player: ['xinfan_yulinghaiAfter','xinfan_yulingboAfter'],
                        },  
                        priority:25,
                        forced: true,
                        filter(event, player) {
							return !player.hasMark('xinfan_yulinghai');
						},
                        async content(event, trigger, player) {
                            player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/linghai.png`,[100,100])    
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/linghaijinyuji:3",
            trigger: {
                global: "phaseEnd",
            },
            filter(event, player) {
                return player.hasMark('xinfan_yulinghai');
            }, 
        	check(event, player) {
				return get.attitude(player, event.player) > 0;
			},
            async content(event,trigger,player){
                player.removeMark('xinfan_yulinghai', 1); 
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
                            return get.damageEffect(target,trigger.player,trigger.player);      
                        })
                        .forResult();
                    if(result.bool){
                        await result.targets[0].damage(1,trigger.player);
                    }
                }else if(result.control=="选项二"){
                    await trigger.player.recover();
                }                                               
            },
    },   
    //骁浪荒川之主
    xinfan_chuanxiaolang:{
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xiaolanghuangchuanzhizhu:1",
            enable: "phaseUse",
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
                target.addTempSkill('xinfan_chuanxiaolang_start');
                target.damage();
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
                    async content(event, trigger, player) {
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
                    target:-1,
                },
                },
    },            
    xinfan_chuanchuannu: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xiaolanghuangchuanzhizhu:1",
            forced: true,
            priority:15,
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
                player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/chuannu.png`,[100,100])
                await player.addMark('xinfan_chuanchuannu', 1);
                if(player.countMark('xinfan_chuanchuannu') > 3){
                    await player.clearMark('xinfan_chuanchuannu');       
                    player.insertPhase().skill=event.name;
                }
            },   
    },                                             
    xinfan_chuanyili: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xiaolanghuangchuanzhizhu:1",
            trigger: {
                global: 'roundStart',
            },
            filter(event, player) {
                return player.isDead();
            },
            forceDie: true,
            forced: true,
            async content(event, trigger, player) {
                const  result  = await player.chooseTarget('###屹立###对任意名其他角色造成一点伤害', [1, Infinity])
                    .set('ai', target => {
                        const player = get.player();
                        return get.damageEffect(target, player, player);
                    })
                    .forResult();
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
                                    })
                                    .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/kongxiangmianlingqi:4",
            zhuanhuanji: true,
            marktext: '☯',
            mark: true,
            forced: true, 
            trigger: {
                player: 'useCardToPlayered',
                target: 'useCardToTargeted',
                },
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
                    player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/kongxiangmianlingqi/xinfan_kongxiangmianlingqi_hei.jpg");
                } else {
                    trigger.getParent('useCard').player = trigger.target;
                    player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/kongxiangmianlingqi/xinfan_kongxiangmianlingqi_bai.jpg");
                }
            },
    },
    xinfan_mianweiwo: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/kongxiangmianlingqi:2",
            forced: true,
            trigger: {
                player: ['useCardAfter', 'damageBegin2'],
            },    
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/liuguangzhuiyueshen:2",
            trigger: {
                global: 'roundStart',
            },
            marktext: '流光',
            intro: {
                content: 'mark',
                name: '流光',
            },  
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/liuguangzhuiyueshen:3",
            trigger: {
                global: "phaseBegin",
                },
            filter(event, player) {
                return player.hasMark('xinfan_zhuiliuguang');
            }, 
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
					    })
                        .forResult();
                    if(result.bool){
                        await result.targets[0].draw(2);
                        await player.removeMark('xinfan_zhuiliuguang', 1); 
                    }
                } else if(result.control=="选项二"){
                    let num = 2;
                    while (num > 0) {
                        const  result  = await player.chooseTarget(`###绮舞###弃置场上一张牌`)
                            .set('ai', target => {
                                const player = get.player();
                                return get.effect(target, { name: 'guohe_copy' }, player, player);
                            })
                            .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/liuguangzhuiyueshen:1",
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
            ai: {
                order: 1,
                result: {
                    player(player) {
                        if(player.countCards("he") >= 3){
                            return 5;
                        } return 2;
                    },
                }, 
            },
    },
    //禅心云外镜
    xinfan_chanjiekong: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/chanxinyunwaijing:2",
            enable: 'phaseUse',
            usable: 1, 
            filter(event, player) {
                return !player.hasMark('xinfan_chanjiekong_kong');
            },    
            filterTarget(card, player, target) {
               return true;
            },            
            selectTarget:1,
            async content(event, trigger, player) {        
				const target = event.target;  
                await target.addSkill('xinfan_chanjiekong_mod');
                await target.loseHp(target.hp -1);
                await target.changeHujia(target.getDamagedHp());
                await player.addMark('xinfan_chanjiekong_kong', 3);
            },
            group: ['xinfan_chanjiekong_kong'],
            subSkill: {
                kong: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/chanxinyunwaijing:2",
                    trigger: {
                        player: 'phaseEnd',
                    },              
                    onremove: true,
                    intro: {
                        content: '剩余：#回合',
                    },
                    forced: true,           
                    filter(event, player) {
                        return player.hasMark('xinfan_chanjiekong_kong') && event.skill != "xinfan_chanjingming";
                    },                                                        
                    async content(event, trigger, player) {                                  
                        await player.removeMark('xinfan_chanjiekong_kong', 1);
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
                    trigger: {
                        global: 'xinfan_chanjiekong_kongAfter',
                    },
                    forced: true,
                    filter(event, player) {
                        return !event.player.hasMark('xinfan_chanjiekong_kong');
                    },                                                        
                    async content(event, trigger, player) {
                        player.logSkill('xinfan_chanjiekong');                                  
                        player.recoverTo(player.getDamagedHp());
                    },  
                },
            },           
            ai:{
                order:9,
                result:{
                    player(player) {
                        return 2;
                    },
                    target(player, target) {
                        if (target.hp < 3 && target.isDamaged()) return 5;
                        return 2;
                    },
                    },
            },          
    },         
    xinfan_chanjingming: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/chanxinyunwaijing:2",
            round: 1,
            trigger: {
                player: "phaseBegin",
            },
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
                    target(player, target) {
                        if (player == target && player.isDamaged()) return 5;
                        return 2;
                    },
                },
            },  
    },            
    //季
    xinfan_jisiji: {
            trigger: {
                global: 'roundStart'
            },
            forced: true,
            mark: true,
            onremove: true,
                intro: {
                    content: '当前状态：$',
                },
            async content(event, trigger, player) {
                if(player.getStorage('xinfan_jisiji').includes("xinfan_xia")){         
                    await player.setStorage('xinfan_jisiji',"xinfan_qiu");   
                    await player.useSkill('xinfan_jisiji_xia'); 
                }else if(player.getStorage('xinfan_jisiji').includes("xinfan_qiu")){         
                    await player.setStorage('xinfan_jisiji',"xinfan_dong");   
                    await player.useSkill('xinfan_jisiji_qiu');  
                }else if(player.getStorage('xinfan_jisiji').includes("xinfan_dong")){         
                    await player.setStorage('xinfan_jisiji',"xinfan_chun");     
                    await player.useSkill('xinfan_jisiji_dong');           
                    await player.addMark('xinfan_jiliuzhuan', 1); 
                }else{
                    await player.setStorage('xinfan_jisiji',"xinfan_xia");
                    await player.useSkill('xinfan_jisiji_chun'); 
                    if(game.phaseNumber == 1){
                        await player.addMark('xinfan_jiliuzhuan', 1);
                    }
                }    
            },
            subSkill: {
                dong: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/ji:1",
            	    marktext: '冬',
                    intro: {
                        content: 'mark',
                        name: '冬',
                    },                       
                    forced: true,
                    trigger: {
                    player: ['useCardBegin', 'respondBegin'],
                    },
                    async content(event, trigger, player) {         
                        const  result  = await player.chooseTarget(`###冬###令任意名角色失去1点体力`, [1, Infinity])
                            .set('ai', target => {
                                const player = _status.event.player;
                                return get.damageEffect(target, player, player,);      
                            })
                            .forResult();
                        if(result.bool){
                            for (const target of result.targets) {
                                target.loseHp();
                            }
                        }
                            player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/ji/xinfan_ji_chun.jpg");
                    },
                },
                xia: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/ji:1",
            	    marktext: '夏',
                    intro: {
                    content: 'mark',
                    name: '夏',
                    },
                    forced: true,
                    trigger: {
                        player: ['useCardBegin', 'respondBegin'],
                    },
                    async content(event, trigger, player) {
                        const  result  = await player.chooseTarget(`###夏###令任意名角色弃置2张牌`, [1, Infinity])
                            .set('ai', target => {
                                const player = get.player();
                                return get.effect(target, { name: 'guohe_copy' }, player, player);
                            })
                            .forResult();
                        if(result.bool){
                            for (const target of result.targets) {
                                target.chooseToDiscard(2, true, "he");
                            }
                        }
                        player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/ji/xinfan_ji_qiu.jpg");
                    },
                },  
                qiu: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/ji:1",
            	    marktext: '秋',
                    intro: {
                        content: 'mark',
                        name: '秋',
                        },
                    forced: true,
                    trigger: {
                    player: ['useCardBegin', 'respondBegin'],
                    },
                    async content(event, trigger, player) {         
                        const  result  = await player.chooseTarget(`###秋###令任意名角色摸2张牌`, [1, Infinity])
                            .set('ai', function (tar) {
								return get.attitude(player, tar)
							})
                            .forResult();
                        if(result.bool){
                            for (const target of result.targets) {
                                target.draw(2);
                            }
                        }
                        player.draw();
                        player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/ji/xinfan_ji_dong.jpg");
                    }, 
                },   
                chun: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/ji:1",
            	    marktext: '春',
                    intro: {
                        content: 'mark',
                        name: '春',
                        },
                    forced: true,
                    trigger: {
                        player: ['useCardBegin', 'respondBegin'],
                    },
                    async content(event, trigger, player) {         
                        const  result  = await player.chooseTarget(`###春###令任意一名角色回复1点体力`, [1, Infinity])
                            .set('ai', function (tar) {
								return get.attitude(player, tar)
							})
                            .forResult();
                        if(result.bool){
                            for (const target of result.targets) {
                                target.recover();
                            }
                        }
                	    await player.changeHujia();
                        player.changeAvatarImageOL("extension/阴阳师杀/fenbao/yys/juesebao/ji/xinfan_ji_xia.jpg");    
                    },
                },
            },
    },
 	xinfan_jiliuzhuan: {
        	audio: "ext:阴阳师杀/fenbao/yys/juesebao/ji:2",
 			marktext: '流转',
            intro: {
                content: '剩余#次',
                name: '流转',
            },
            forced: true,  
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/pingjiangmen:1",
        	enable: 'phaseUse',
			filterTarget(card, player, target) {
            	return target != player && !player.getStorage('xinfan_pingluanzhen_used').includes(target);
            },
            selectTarget:1,
            async content(event, trigger, player) {  
                const next = player.useCard({
                    card: get.autoViewAs({ name: "juedou", isCard: true }),
                    targets: [event.target],
                    nowuxie: true,
                    noai: true
                    }).set("animate", false);
                await game.delay(0.5);
                return next;      
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
        			player(player, target) {
            			if (target.countCards("h") > 4 && player.hp < 3) return -1;
                        return 2;
                    },
					target:-2,
    			},
        	},
    },
    xinfan_pingbudu: {
        	audio: "ext:阴阳师杀/fenbao/yys/juesebao/pingjiangmen:1",
			trigger: {
                player: 'phaseEnd',
            },
    		usable: 1,
    		forced: true,
            async content(event, trigger, player) {   
                const choiceList = ['烈日：每回合首次造成的伤害加1。','暖阳：每回合首次受到伤害后，你令你在内任意名角色回复1点体力。',];
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
                	audio: "ext:阴阳师杀/fenbao/yys/juesebao/pingjiangmen:1",
					mark: true,
                	intro: {
                    	content: '每回合首次造成的伤害加1。',
						name: '烈日',
                	},
                	charlotte: true,
					usable: 1,
        			trigger: {
            			source: "damageBegin",
        			},
        			filter(event, player) {
            			return !player.getStorage('xinfan_pingbudu_used').includes(event.player);
                    },
               		forced: true,
                	async content(event, trigger, player) {                    
            			trigger.num++;
            		},
            	},
            	nuan: {
                	audio: "ext:阴阳师杀/fenbao/yys/juesebao/pingjiangmen:1",
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
							})
                            .forResult();
                        if(result.bool){
                    		for (const target of result.targets) {
                        		target.recover();
                			}
                		}
                		player.recover();
            		},
                },  
			},  
	},  
    xinfan_pingjiaoyang: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/pingjiangmen:2",
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
        	audio: "ext:阴阳师杀/fenbao/yys/juesebao/xuzuozhinan:1",
        	trigger: {
            	global: 'roundStart',
            	player: 'phaseZhunbeiBegin',
        	},  
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
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/xuzuozhinan:2",
                	mark: true,
                	marktext: '庇护',
                	intro: {
                    	content: '庇护',
                	},
                	trigger: {
                    	player: 'phaseZhunbeiBegin',
                	},  
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
                                    v   }
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
                    async content(event, trigger, player) {
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xuzuozhinan:1",
            trigger: {
                source: 'damageBegin',
            },
            filter(event, player) {
                return event.card?.name == 'sha' || event.num >= event.player.hp || event.player.name == 'xinfan_tianyuyuzhan';
            },      
            forced: true,
            async content(event, trigger, player) {                
                if (trigger.card?.name == 'sha') trigger.nature = 'thunder';
                if (trigger.num >= trigger.player.hp && trigger.player.name != 'xinfan_tianyuyuzhan') {
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
                    target.update();
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
                    async content(event, trigger, player) {
                        trigger.cancel();
                    },
                },
            },
            trigger: {
                player: 'dieBegin',
            },
            filter(event, player) {
                return player.storage.xinfan_xuxingjian && !event.source.hasSkill(xinfan_xushenfa);
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
                player.update();
            },
    },
    //雪御前
    xinfan_xueqianxue: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xueyuqian:3",
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
            async content(event, trigger, player) {
                trigger.getParent().directHit.add(trigger.target);
            },
    },
    xinfan_xuexuezhan: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xueyuqian:2",
            forced: true,
            trigger: {
                player: 'useCardAfter',
            },
            filter(event, player) {
                return event.card?.name == 'sha'&& event.targets.some(i => i.isAlive());
            },
            priority:15,          
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xueyuqian:2",
            forced: true,
            priority:15,
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/huangkulou:2",
            forceDie: true,
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
                    async content(event, trigger, player) {
                        trigger.getParent().directHit.add(trigger.target);
                    },
                },
            },
            ai: {
                order: 4.3,
                result: {
                    player: 1,
                },
            },
    },
    xinfan_kuliehun: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/huangkulou:1",
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
            async content(event, trigger, player) {
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
                        game.playVideoOL("/extension/阴阳师杀/fenbao/yys/shipin/liehun.MP4",999);
                        await new Promise(r => setTimeout(r, 7000));
                        trigger.num+=2;
                    },
                },
            },
    },
	xinfan_kuzhanqi: {
		    audio: "ext:阴阳师杀/fenbao/yys/juesebao/huangkulou:1",
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
			    return `是否令${get.translation(event.player)}回复至1点体力，并获得2点护甲？`;
		    },
		    async content(event, trigger, player) {
                game.broadcastAll(function () {
                    ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/kugushizhang.jpg');
                })
                game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/kugushizhang.mp3");  
                player.awakenSkill('xinfan_kuzhanqi');
			    trigger.player.recoverTo(1);
			    await trigger.player.changeHujia(2);
                const next = player.insertPhase("xinfan_shixi");
                next.set("phaseList", ["phaseDraw", "phaseUse"]);
		    },
    },			
    //神堕八岐大蛇
	xinfan_sheqiying: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shenduobaqidashe:2",
            priority:15,
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
    },
    xinfan_shezhongyan: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shenduobaqidashe:1",
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
                        const  result  = await player.chooseTarget(`###終焉###请选择分配伤害的目标（剩余${num}点）`, 1)
                            .set('ai', target => {
                            const player = get.player();
                            return get.damageEffect(target, player, player);
                            })
                            .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/wunvzhiyuan:2",
            init(player, skill) {
                const next = game.createEvent(skill);
                next.player = player;
                next.setContent(lib.skill[skill].content);
            },
            async content(event, trigger, player) {
                player.logSkill('xinfan_shebeiming');
                player.draw(3);
                player.recoverTo(2);
            },
    },
    xinfan_shejishen: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/wunvzhiyuan:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/huojingshen:2",
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
                    })
                    .forResult();
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
                        content: '每回合一次,祸津神受到伤害后，你受到1点伤害。',
                    },
                    charlotte: true,
                },
                damage: {
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/huojingshen:2",
                    usable: 1,
                    forced: true,
                    trigger: {
                        player: 'damageEnd',
                    },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/huojingshen:2",
            trigger: {
               global: 'damageEnd',
            },
            priority:15,
            filter(event, player) {
                return !player.getStorage('xinfan_huodaogao_used').includes(event.player) && event.player.isAlive();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/chanbingxuenv:2",
            enable: 'phaseUse',
            usable: 1,
            marktext: '永冻',
            intro: {
                content: '下个回合改为摸2张牌并跳过回合',
                name: '永冻',
            },         
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
                await player.addTempBackGroundOL("/extension/阴阳师杀/fenbao/yys/beijing/xueyu.jpg", 0, {player: "phaseBefore"})
                if(_status.tempMusic != "ext:阴阳师杀/fenbao/yys/yinyue/xueyu.mp3"){ 
                    game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/xueyu.mp3");   
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/chanbingxuenv:2",
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
                            const  result  = await player.chooseTarget(`对一名角色造成一点伤害`)
                                .set('ai', target => {
                                    const player = _status.event.player;
                                    return get.damageEffect(target, player, player,);	  
                                })
                                .forResult();
                            if (result.bool) {
                                await result.targets[0].damage(1,);
                            }
                        }else if(result.control=="选项二"){
                            const  result  = await player.chooseTarget(`弃置场上一张牌`)
                                .set('ai', target => {
                                    const player = get.player();
                                    return get.effect(target, { name: 'guohe_copy' }, player, player);
                                })
                                .forResult();
                            if(result.bool){
                                await player.discardPlayerCard(result.targets[0], 'ej', true);
                            }
                        }
                    },
                },
            },
    },
    xinfan_xuechungao: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/chanbingxuenv:1",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/chulingshanfeng:3",
            enable: "phaseUse",
            usable: 1, 
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
                            game.broadcastAll(function (player) {
						    game.playAudio(`../extension/阴阳师杀/fenbao/yys/juesebao/chulingshanfeng/xinfan_shanchuling${[1,2,3].randomGet()}.mp3`);
					    }, player);
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/chulingshanfeng:3",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/tianrenjianxinguiqie:2",
            trigger: {
                target: 'useCardToTargeted',
            },           
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/tianrenjianxinguiqie:2",
            trigger: {
                player: 'phaseZhunbeiBegin',
            },
                    priority:15,
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
                player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/duane.png`,[100,100])
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
                        player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/duane.png`,[100,100])
                        player.logSkill('xinfan_qieduane');
                        await player.useCard({ name: 'sha' }, event.targets, false);
                    },
                },
            },
    },
    //茨木童子
    xinfan_cihaoyi: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/cimutongzi:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/cimutongzi:2",
            forced: true,
            trigger: {
                source: 'damageAfter',
            },
            marktext: '怒',
            intro: {
                content: 'mark',
            },
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
                        const  result  = await player.chooseTarget(`###迁怒###请选择分配伤害的目标（剩余${num}点）`, 1)
                            .set('ai', target => {
                                const player = get.player();
                                return get.damageEffect(target, player, player);
                            })
                            .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuanlaiguang:1",
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
					})
                    .forResult();
                if(result.bool){
                    await result.targets[0].addSkill('xinfan_guangxueqi_mark');
                    result.targets[0].playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/yuanshi.png`,[100,100])
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
                        trigger.player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/yuanshi.png`,[100,100])
                        trigger.num--;
                    },
                },                             
            },
    },
    xinfan_guangbuwu: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/yuanlaiguang:1",
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
                return event.player.hp < event.player.getDamagedHp() && event.player != player && event.player.isAlive();
                },      
            async cost(event, trigger, player) {
                event.result = await player
                    .chooseBool(`###追剿###是否对 ${get.translation(trigger.player)} 造成1点伤害？`)
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/dishitian:2",
            enable: "phaseUse",
            usable: 1,
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
                            player.addMark('xinfan_huiyuejing', 1);
                        game.broadcastAll(function (player) {
						    game.playAudio(`../extension/阴阳师杀/fenbao/yys/juesebao/dishitian/xinfan_dizhanfang${[1,2].randomGet()}.mp3`);
					    }, player);
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/dishitian:2",
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
            selectTarget:1,
            async content(event, trigger, player) {
                for (const target of game.filterPlayer()) {
                    if (target.hasMark('xinfan_dilianhua')) {
                        target.removeMark('xinfan_dilianhua');
                    }
                }
                event.target.addMark('xinfan_dilianhua');
            },
            group: ['xinfan_dilianhua_remove'],
            subSkill: {
                remove: {
                    trigger: {
                        player: 'dying',
                    },
                    filter(event, player) {
                        return game.hasPlayer(i => i.hasMark('xinfan_dilianhua'));
                    },
                    async content(event, trigger, player) {
                    for (const target of game.filterPlayer()) {
                        if (target.hasMark('xinfan_dilianhua')) {
                            target.removeMark('xinfan_dilianhua');
                        }
                    }
                    if (get.info("xinfan_dizhanfang")) {
										const xinfan_dizhanfang = player.chooseToUse();
										xinfan_dizhanfang.set("openskilldialog", get.prompt2("xinfan_dizhanfang"));
										xinfan_dizhanfang.set("norestore", true);
										xinfan_dizhanfang.set("_backupevent", "xinfan_dizhanfang");
										xinfan_dizhanfang.set("custom", {
											add: {},
											replace: { window() { } },
										});
										xinfan_dizhanfang.backup("xinfan_dizhanfang");
										player
											.when("chooseButtonAfter")
											.filter(evt => evt.getParent() == xinfan_dizhanfang)
											.step(async (event, trigger, player) => {
												if (!trigger?.result?.bool) {
													xinfan_dizhanfang.cancel();
												}
											});
										const result1 = await xinfan_dizhanfang.forResult();
									}
                    },
                },
            },
            ai: {
                order: 11,
                result: {
                    player: 2,
                    target(player, target) {
                        if (target.hp < 3) return -5;
                        return -2;
                    },
                },
            },
    },
    xinfan_dijinlian: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/dishitian:2",
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
                } else if (get.type2(event.card) == "basic"){
                    return true;
                } else if (get.type(event.card) == "trick" && event.card.name != "shandian" && event.card.name != "tiesuo"){
                    return true;
                } else if (get.type(event.card) == "equip"){
                    return event.card.name == "zhuge";  
                }
                return false; 
            },
            async content(event, trigger, player) {
                trigger.cancel();
                trigger.num = 0;
            },
    },
    //寻森小鹿男
    xinfan_lusenxin: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xunsenxiaolunan:2",
            trigger: {
                player: 'phaseEnd',
            },  
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
            subSkill: {   
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
                        return player.hasMark('xinfan_lusenxin_sen');
                    },
                    charlotte: true,
                    marktext: '侵',
                    async content(event, trigger, player) {
                        player.addMark('xinfan_lusenxin_qin', 1);
                    },
                },
            },
    },
    xinfan_lusenqi: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xunsenxiaolunan:2",
            priority:15,
            forced: true,
            trigger: {
                player: 'phaseZhunbeiBegin',
            },
            filter(event, player) {
                return game.hasPlayer(i => i.hasMark('xinfan_lusenxin_sen') || i.hasMark('xinfan_lusenxin_qin'));
            },
            async content(event, trigger, player) {
                const num = game.countPlayer(i => i.hasMark('xinfan_lusenxin_sen')) + 1;
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/guitongwan:1",
            trigger: {
                global: 'phaseBefore',
                player: 'phaseEnd',
            },
            priority: -4,
            forced: true,
            filter(event, player) {
            return game.phaseNumber == 0;
            },
            async content(event, trigger, player) {
                await player.addTempBackGroundOL("/extension/阴阳师杀/fenbao/yys/beijing/shayushenghua.jpg", 0, {player:"phaseBegin"})
                if(_status.tempMusic != "ext:阴阳师杀/fenbao/yys/yinyue/shayushenghua.mp3"){
                    game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/shayushenghua.mp3"); 
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/guitongwan:2",
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
            async content(event, trigger, player) {
                const target = trigger.source == player ? trigger.player : trigger.source;
                target.addMark('xinfan_guihaisuo', 1);
            },
            marktext: '锁',
            intro: {
                content: 'mark',
            },
    },
    xinfan_guikuanglie: {
        audio: "ext:阴阳师杀/fenbao/yys/juesebao/guitongwan:2",
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
                    const  result  = await player.chooseTarget(`###骸猎###请选择分配伤害的目标（剩余${num}点）`, 1)
                        .set('ai', target => {
                            const player = get.player();
                            return get.damageEffect(target, player, player);
                        })
                        .forResult();
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/guiqie:2",
            forced: true,
            trigger: {
                player: "phaseEnd"
            },
            async content(event, trigger, player) {
                await player.chooseUseTarget({ name: 'sha' }, false, 'nodistance');
            },            
    },
    xinfan_guiguiren: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/guiqie:2",
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
    xinfan_jinzouxu: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo:2",
            enable: 'phaseUse',
            usable: 1,
            onremove: true,
            intro: {
                content: '已解锁：$',
            },
            async content(event, trigger, player) {     
                const cards = get.cards(4, true);
                const result = await player
                .chooseCardButton(get.translation(event.name), cards.slice(), true)
                .set("ai", button => {
                    if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_gong") && get.suit(cards) == "heart"){
                        return get.player().getUseValue(button.link) + 2;
                    }
                    if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_shang") && get.suit(cards) == "diamond"){
                        return get.player().getUseValue(button.link) + 3;
                    }
                    if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_jiao") && get.suit(cards) == "spade"){
                        return get.player().getUseValue(button.link) + 6;
                    }
                    if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_hui") && get.suit(cards) == "club"){
                        return get.player().getUseValue(button.link) + 4;
                    }
                    return get.player().getUseValue(button.link);
                })
                .forResult();
                if (result.bool && result.links?.length) {
                    await player.gain(result.links, "gain2"); 
                if (get.suit(result.links) == "heart"){
                    await player.useSkill('xinfan_jinzouxu_gong');
                }else if(get.suit(result.links) == "diamond"){
                    await player.useSkill('xinfan_jinzouxu_shang');
                }else if(get.suit(result.links) == "spade"){
                    await player.useSkill('xinfan_jinzouxu_jiao');
                }else {
                    await player.useSkill('xinfan_jinzouxu_hui');
                }
                }
            },
            subSkill: {
                gong: {
                        audio: "ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo:1",
                        forced: true, 
                        trigger: {
                            player: ['useCardBegin', 'respondBegin'],
                        },
                        async content(event, trigger, player) {         
                            const  result  = await player.chooseTarget(`###宫###令一名角色受到1点伤害`)
                               .set('ai', target => {
                                    const player = _status.event.player;
                                    return get.damageEffect(target, player, player,);      
                                })
                                .forResult();
                            if(result.bool){
                                await result.targets[0].damage(1,);
                                if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_gong")){
                                    player.markAuto('xinfan_jinzouxu',"xinfan_jinzouxu_gong");
                                }
                            }
                        },
                    },
                shang: {
                        audio: "ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo:1",
                        forced: true, 
                        trigger: {
                            player: ['useCardBegin', 'respondBegin'],
                        },
                        async content(event, trigger, player) {         
                            const  result  = await player.chooseTarget(`###商###弃置一名角色区域内1张牌`)
                                .set('ai', target => {
                                    const player = get.player();
                                    return get.effect(target, { name: 'guohe_copy' }, player, player);
                                })
                                .forResult();
                            if(result.bool){
                                await player.discardPlayerCard(result.targets[0], 'hej', true);
                                if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_shang")){
                                    player.markAuto('xinfan_jinzouxu',"xinfan_jinzouxu_shang");
                                }
                            }
                        },
                    },  
                    jiao: {
                            audio: "ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo:1",
                            forced: true,      
                            trigger: {
                                player: ['useCardBegin', 'respondBegin'],
                            },
                            async content(event, trigger, player) {         
                                const  result  = await player.chooseTarget(`###角###令一名角色摸2张牌`)
                                    .set('ai', function (tar) {
								        return get.attitude(player, tar)
							        })
                                    .forResult();
                                if(result.bool){
                                    await result.targets[0].draw(2);
                                    if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_jiao")){
                                        player.markAuto('xinfan_jinzouxu',"xinfan_jinzouxu_jiao");
                                    }
                                }
                            },
                    },   
                hui: {
                        audio: "ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo:1",
                        forced: true, 
                        trigger: {
                            player: ['useCardBegin', 'respondBegin'],
                        },
                        async content(event, trigger, player) {         
                            const  result  = await player.chooseTarget(`###徽###令一名角色回复1点体力`)
                                .set('ai', function (tar) {
								    return get.attitude(player, tar)
							    })
                                .forResult();
                            if(result.bool){
                                await result.targets[0].recover(1);
                                if(!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_hui")){
                                    player.markAuto('xinfan_jinzouxu',"xinfan_jinzouxu_hui");
                                }
                            }
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
    xinfan_jinyayin: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo:1",
            trigger: {
                player: "phaseEnd",
            },
            limited: true,
            mark: true,
            intro: {
                content: "limited",
            },
            check(event, player) {
                if (!player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_gong")) {
                    return false;
                }else if(!player.getStorage('xinfan_jinzouxu_').includes("xinfan_jinzouxu_jiao")){
                    return false;    
                }
                return  player.getStorage('xinfan_jinzouxu').length >= 2;
                },
            async content(event, trigger, player) {
                game.broadcastAll(function () {
                    ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/xingchenzhilv.jpg');
                })
                game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/xingchenzhilv.mp3"); 
                player.insertPhase().skill=event.name;
                player.awakenSkill('xinfan_jinzouxu');
                player.awakenSkill('xinfan_jinyayin');
                player.addSkill('xinfan_jinzoulv');
            },             
    }, 
    xinfan_jinzoulv: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo:2",
            enable: 'phaseUse',
            usable: 1,   
            filter(event, player) {
                return player.getStorage('xinfan_jinzouxu').length > 0;
            },
            async content(event, trigger, player) { 
                if (player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_gong")){
                    await player.useSkill('xinfan_jinzouxu_gong');
                }
                if(player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_shang")){
                    await player.useSkill('xinfan_jinzouxu_shang');
                }
                if(player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_jiao")){
                    await player.useSkill('xinfan_jinzouxu_jiao');
                }
                if(player.getStorage('xinfan_jinzouxu').includes("xinfan_jinzouxu_hui")){
                    await player.useSkill('xinfan_jinzouxu_hui');
                }
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
    //龙珏
    xinfan_longcuijian: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/longjue:3",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/longjue:2",
            marktext: '龙息',
            intro: {
            content: '一轮后重置。',
                name: '龙息',
            },      
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/fuguqingji:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/fuguqingji:2",
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
			audio: "ext:阴阳师杀/fenbao/yys/juesebao/fuguqingji:1",
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
                    ui.background.setBackgroundImage('extension/阴阳师杀/fenbao/yys/beijing/huazuoqingyan.jpg');
                })
                game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/huazuoqingyan.mp3"); 
                target.addSkill('xinfan_qingjianggu_jian'); 
                player.awakenSkill('xinfan_qingjianggu');                
			},
        	subSkill: {   
        		jian: {
           	    	audio: "ext:阴阳师杀/fenbao/yys/juesebao/fuguqingji:2",
            		trigger: {
                		global: "phaseBegin"
            		},
            		priority:15,
              		forced: true,        
        			filter(event, player) { 
           				return event.player == player || event.player.name == "xinfan_fuguqingji";
        			},
              		async content(event, trigger, player) {
            	    player.playGifOL(1000, lib.assetURL + `/extension/阴阳师杀/fenbao/yys/tubiao/ningshi.png`,[100,100])    
             		player.addMark('xinfan_du');
               		},
        	    },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/lingluyuqian:2",
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
                await player.addTempBackGroundOL("/extension/阴阳师杀/fenbao/yys/beijing/luhaiweiwang.jpg", 0, {global: "phaseJieshuEnd"})
                if(_status.tempMusic != "ext:阴阳师杀/fenbao/yys/yinyue/luhaiweiwang.mp3"){
                    game.playBgmOL("ext:阴阳师杀/fenbao/yys/yinyue/luhaiweiwang.mp3"); 
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
                            if (!target.hasSkill('xinfan_lulanggui')) {
                                return false;
                            }
                        },
                        playerEnabled(card, player, target) {
                            if (!target.hasSkill('xinfan_lulanggui')) {
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/lingluyuqian:2",
            trigger: {
                player: "damageBegin4"
            },
            forced: true,
            filter: function (event, player) {
		        return event.num > 1 && player.hujia >0;
            },
            async content(event, trigger, player) {
			trigger.num = 1;
		    },
    },
    //心友犬神
    xinfan_xinyou: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xinyouquanshen:2",
            trigger: {
                global: 'roundStart',
            },
            filter(event, player) {
                return game.countPlayer(i => player.getStorage('xinfan_xinyou').includes(i)) < 2;
            },
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xinyouquanshen:2",
            trigger: {
                global: 'useCardToTargeted',
            },
            filter(event, player) {
                return get.tag(event.card, 'damage') && (player.getStorage('xinfan_xinyou').includes(event.target) || event.target == player) && !player.getStorage('xinfan_xinyou').includes(event.player) && !player.getStorage('xinfan_shouhu_used').includes(event.target);
            },
            frequent: true,
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/xinyouquanshen:1",
            forced: true,
            trigger: {
                player: 'useCard',
            },
            filter: (event, player) => player.getStorage('xinfan_xinyou').length && get.name(event.card) == 'sha',
            async content(event, trigger, player) {
                trigger.effectCount += player.getStorage('xinfan_xinyou').length;
            },         
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
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/qianji:2",
                    trigger: {
                        player: 'xinfan_chaogeAfter',
                    },
		            filter(event, player) {
                        return player.countMark('xinfan_chaoge') > 4;
                    },			 
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/qianji:2",
            enable: "phaseUse",
            usable: 1,      
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
                    audio: "ext:阴阳师杀/fenbao/yys/juesebao/qianji:2",
                    trigger: {
                        global: "phaseEnd",
                    },
                    forced: true,
                    filter(event, player) {
                    return event.player.hasMark('xinfan_ningshuang');
                    },
                    async content(event, trigger, player) {
                        await trigger.player.clearMark('xinfan_ningshuang');
                        await trigger.player.chooseToDiscard(2, true, "h");
                    },
                },
            },
    },
    //神启荒
    xinfan_qishenqi: {
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shenqihuang:2",
            forced: true,
            trigger: {
                global: 'roundStart',
            },
            intro: {
                content(storage, player) {
                    return `当前记录牌名：${get.translation(storage)}`;
                },
            },
            logTarget: () => game.filterPlayer(),
            async content(event, trigger, player) {
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shenqihuang:2",
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
            audio: "ext:阴阳师杀/fenbao/yys/juesebao/shenqihuang:2",
            trigger: {
                player: 'useCardToPlayered',
            },     
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


    //武烈
                        //烈卧龙诸葛亮
              xinfan_liangtianshu: {
              audio: "sbguanxing",
        intro: {
            mark(dialog, content, player) {
                const str = player.hasSkill('xinfan_liangtianshu') ? '牌堆顶七张牌为：' : '你不可见';
                dialog.addText(str);
                if (player.hasSkill('xinfan_liangtianshu')) {
                    const cards = get.cards(7, true);
                    dialog.addSmall(cards);
                }
            },
        },
        mark: true,
        enable: ['chooseToUse'],
        usable: 1,
        hiddenCard(player, name) {
            if (player.getHistory('useSkill', evt => evt.skill == 'xinfan_liangtianshu').length > 0) return false;
            return lib.inpile.includes(name);
        },
        filter(event, player) {
            for (const card of get.cards(7, true)) {
                if (event.filterCard(card, player, event)) return true;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog('天数', get.cards(7, true));
            },
            filter(button, player) {
                return _status.event.getParent().filterCard(button.link, player, _status.event.getParent());
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                const player = _status.event.player;
                return player.getUseValue(button.link);
            },
            backup(links, player) {
                return {
                    filterCard: false,
                    selectCard: 0,
                    viewAs: links[0],
                    precontent() {
                        player.logSkill('xinfan_liangtianshu');
                        const links = event.parent._result.links;
                        event.result.card.cards = links;
                        event.result.cards = links;
                    },
                };
            },
            prompt(links, player) {
                return '请选择' + get.translation(links[0]) + '的目标';
            },
            ai: {
                order: 12,
                result: {
                    player(player) {
                        if (_status.event.dying) return get.attitude(player, _status.event.dying);
                        return 1;
                    },
                },
                fireAttack: true,
                respondSha: true,
                respondShan: true,
                save: true,
                skillTagFilter(player) {
                    if (player.getHistory('useSkill', evt => evt.skill == 'xinfan_liangtianshu').length > 0) return false;
                    return true;
                },
            },
        },
    },
    xinfan_liangqihe: {
    audio: "sbhuoji",
        enable: 'phaseUse',
        usable: 1,
        filterTarget(card, player, target) {
            return target != player && target.countCards('she') > 0;
        },
        filterCard: true,
        lose: false,
        discard: false,
        position: 'seh',
        async content(event, trigger, player) {
            const cards = event.cards;
            const card = cards[0];
            const card2 = get.cards(1, true)[0];
            const target = event.target;
            await player.showCards(cards, '气合');
            await player.showCards([card2], '牌堆顶');
            let num = 0;
            if (get.color(card) == get.color(card2)) {
                num++;
                await player.gain(card2, 'gain2');
            }
            const next = await target
                .chooseCard('###气合###请选择一张手牌进行展示！','seh',true)
                .set('ai', card => {
                    const { player, setting } = get.event();
                    if (get.attitude(player, setting[0]) > 0) return get.color(card) == get.color(setting[1]) ? 1 : 0.1;
                    if (get.attitude(player, setting[0]) <= 0) return get.color(card) != get.color(setting[1]) ? 1 : 0.1;
                    return 0.1;
                })
                .set('setting', [player, card])
                .forResult();
            if (next.bool) {
                await target.showCards(next.cards, '气合');
                if (get.color(card) == get.color(next.cards[0])) {
                    num++;
                }
                       await player.gain(next.cards, 'giveAuto');
            }
            if (num > 0) {
                await player.draw(num);
                const maps = {};
                while (num > 0) {
                    const  result  = await player.chooseTarget(`###气合###请选择分配伤害的目标（剩余${num}点）`, 1).set('ai', target => {
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
                                      .chooseNumbers('气合', [{ prompt: '请选择你要分配数值', min: 1, max: num }], true)
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
                            await target.damage(maps[target.playerid], 'fire');
                        }
                    }
                }
            }
        },
        ai: {
            order: 10,
            result: {
                target(player, target) {
                    if (get.attitude(player, target) > 0) {
                        return 1;
                    }
                    if (player.getFriends().length) return 0;
                    return 1;
                },
            },
        },
    },          
                    //烈曹操
                     xinfan_kuaichou:{
                audio: "spolzhubei",
                trigger:{
                    global: 'useCardAfter',
                },
                direct: true,
              usable(skill, player) {
        return 1 + player.getDamagedHp();
        },
                filter(event, player) {
                    return game.countPlayer2(current => current.hasHistory("sourceDamage", evt => {
                        return evt.card == event.card && (player == event.player || player == evt.player);
                    })) && player.hasCard(card => player.hasUseTarget(card, false, false), "hs");
                },
                async content(event, trigger, player) {
                    await player.chooseToUse({
                        filterCard(card) {
                            /*if (get.itemtype(card) != "card" || !["h", "s", "h"].includes(get.position(card))) {
                                return false;
                            }*/
                            return lib.filter.filterCard.apply(this, arguments);
                        },
                        filterTarget(card, player, target) {
                            return lib.filter.filterTarget.apply(this, arguments);
                        },
                        prompt: get.prompt(event.name),
                        prompt2: '使用一张牌（无次数限制）',
                        addCount: false,
                        forced: false,
                    }).set('logSkill', event.name)
                    .set("sourcex", player)
                    .set("targetRequired", true)
                    .set("complexSelect", true)
                    .set("complexTarget", true);
                },
            },

            xinfan_jisi:{
                forced: true,
                audio: "spolaige",
                trigger:{
                    global: 'useCardEnd',
                },
                filter(event, player) {
                    return game.countPlayer2(current => current.hasHistory("sourceDamage", evt => {
                        return evt.card == event.card && (player == event.player || player == evt.player);
                    }));
                },
                onremove(player, skill) {
                    player.removeTip(skill);
                    delete player.storage[skill];
                },
                intro:{ content: '当前记录牌名：$', },
                async content(event, trigger, player) {
                    if(!player.getStorage(event.name).includes(trigger.card.name)) {
                        if(player.getStorage(event.name).length) {
                            player.unmarkAuto(event.name, player.getStorage(event.name));
                        }
                        player.markAuto(event.name, [trigger.card.name]);
                        player.addTip(event.name, '汲思 ' + get.translation(trigger.card.name));
                        await player.draw(2);
                    } else {
                        player.unmarkAuto(event.name, player.getStorage(event.name));
                        player.removeTip(event.name);
                    }
                },
            },

            xinfan_fuji:{
                audio: "spolxixiang",
                enable: ["chooseToUse"],
                filter(event, player) {
                    if (!player.getStorage('xinfan_jisi').length || !player.hasCard(card => player.getStorage('xinfan_jisi').some(name => get.type2(name) == get.type2(card)), 'he')) {
                        return false;
                    }
                    for (var i of lib.inpile) {
                        if(!player.getStorage('xinfan_jisi').includes(i)) continue;
                        var type = get.type2(i);
                        if ((type == "basic" || type == "trick") && event.filterCard(get.autoViewAs({ name: i }, "unsure"), player, event)) {
                            return true;
                        }
                    }
                    return false;
                },
                chooseButton: {
                    dialog(event, player) {
                        var list = [];
                        for (var i = 0; i < lib.inpile.length; i++) {
                            var name = lib.inpile[i];
                            if(!player.getStorage('xinfan_jisi').includes(name)) continue;
                            if (name == "sha") {
                                if (event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) {
                                    list.push(["基本", "", "sha"]);
                                }
                                for (var nature of lib.inpile_nature) {
                                    if (event.filterCard(get.autoViewAs({ name, nature }, "unsure"), player, event)) {
                                        list.push(["基本", "", "sha", nature]);
                                    }
                                }
                            } else if (get.type2(name) == "trick" && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) {
                                list.push(["锦囊", "", name]);
                            } else if (get.type(name) == "basic" && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) {
                                list.push(["基本", "", name]);
                            }
                        }
                        return ui.create.dialog("复击", [list, "vcard"]);
                    },
                    check(button) {
                        if (_status.event.getParent().type != "phase") {
                            return 1;
                        }
                        var player = _status.event.player;
                        return player.getUseValue({
                            name: button.link[2],
                            nature: button.link[3],
                        });
                    },
                    backup(links, player) {
                        return {
                            name: links[0][2],
                            filterCard(card) {
                                return get.type2(card) == get.type2(lib.skill.xinfan_fuji_backup.name);
                            },
                            audio: "spolxixiang",
                            popname: true,
                            check(card) {
                                return 8 - get.value(card);
                            },
                            position: "he",
                            viewAs: { name: links[0][2], nature: links[0][3] },
                            precontent() {
                                
                            },
                        };
                    },
                    prompt(links, player) {
                        return "将一张" + get.translation(get.type2(links[0][2])) + "牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用";
                    },
                },
                hiddenCard(player, name) {
                    if (!lib.inpile.includes(name)) {
                        return false;
                    }
                    var type = get.type2(name);
                    return (type == "basic" || type == "trick") && player.hasCard(card => player.getStorage('xinfan_jisi').some(name => get.type2(name) == get.type2(card)), 'he') && player.countCards("he") > 0 && name != 'shan' && name != 'wuxie' && name != 'jiu' && name != 'tao';
                },
                ai:{
                    combo: 'xinfan_jisi',
                    order: 1,
                    result: {
                        player(player) {
                            if (_status.event.dying) {
                                return get.attitude(player, _status.event.dying);
                            }
                            return 1;
                        },
                    },
                },
            },
                                        //烈赵云
 				 xinfan_jvqi: {
						 audio: "longdan",
						trigger: {
							player: "phaseEnd",
							target: "useCardToTargeted",
						},
						forced: true,
						filter(event, player, name) {
							if (name == "phaseEnd") {
								return true;
							}
							return event.player != player;
						},
						content() {
							if (!player.storage._xinfan_jvqi) {
								player.storage._xinfan_jvqi = true;
								const originAddMark = player.addMark;
								const originRemoveMark = player.removeMark;
								player.addMark = function (i, num, log) {
									if (!num) {
										num = 1;
									}
									originAddMark.call(this, i, num, log);
									if (i == "xinfan_jvqi") {
										this.draw(num);
									}
								};
								player.removeMark = function (i, num, log) {
									if (!num) {
										num = 1;
									}
									if (num > this.countMark("xinfan_jvqi")) {
										num = this.countMark("xinfan_jvqi");
									}
									originRemoveMark.call(this, i, num, log);
									if (i == "xinfan_jvqi") {
										this.draw(1);
									}
								};
							}
							player.addMark("xinfan_jvqi", 1);
						},
						intro: {
							content: "mark",
							name: "气",
						},
						marktext: "气",
					},
					xinfan_nuzhan: {
						audio: "chongzhen",
						trigger: {
							player: "useCardToPlayered",
						},
						filter(event, player) {
							return event.targets.length == 1 && event.target != player && player.countMark("xinfan_jvqi") > 0;
						},
						direct: true,
						async content(event, trigger, player) {
							const nums = Array.from({ length: player.countMark("xinfan_jvqi") }, (_, i) => i + 1);
							const { result: discardNum } = await player
								.chooseControl([...nums, "cancel2"])
								.set("prompt", "###怒斩###是否弃置任意“气”标记获得额外效果？")
								.set("target", trigger.target)
								.set("card", trigger.card);
							if (discardNum.control != "cancel2") {
								player.logSkill('xinfan_nuzhan');
								player.logSkill("xinfan_nuzhan", trigger.target);
								player.removeMark("xinfan_jvqi", discardNum.control);
								const num = discardNum.control;
								if (num >= 1) {
									if (trigger.parent.addCount != false) {
										trigger.parent.addCount = false;
										player.getStat().card[get.name(trigger.card)]--;
									}
								}
								if (num >= 2) {
									trigger.parent.baseDamage++;
								}
								if (num >= 3) {
									trigger.getParent().directHit.add(trigger.target);
								}
								if (num >= 4) {
									trigger.target.addTempSkill("fengyin");
								}
								if (num >= 5) {
									trigger.target.loseHp(trigger.target.hp);
								}
							}
						},
					},
                                          //烈袁绍
                    xinfan_lirui: {
						enable: ["chooseToUse", "chooseToRespond"],
						filterCard: true,
						audio: "sbluanji",
						viewAs: {
							name: "sha",
							xinfan_lirui: true,
						},
						viewAsfilter(player) {
							if (player.countCards("h") > 1) return false;
						},
						prompt: "将至少两张手牌当作【杀】使用或打出",
						check(card) {
							return 5 - get.value(card);
						},
						selectCard: [2, Infinity],
						mod: {
							targetInRange(card) {
								if (card.name == "sha" && card?.xinfan_lirui) return true;
							},
							cardUsable(card) {
								if (card.name == "sha" && card?.xinfan_lirui) return Infinity;
							},
							selectTarget: (card, _, range) => {
								if (!card.cards || !card.xinfan_lirui || card.cards.length == 1) return;
								if (card.name == "sha") range[1] = card.cards.length;
							},
						},
						ai: {
							respondSha: true,
							skillTagFilter(player) {
								if (player.countCards("h") < 2) return false;
							},
							order(item, player) {
								let res = 3.2;
								if (player.hasSkillTag("presha", true, null, true)) {
									res = 10;
								}
								if (typeof item !== "object" || !game.hasNature(item, "linked") || game.countPlayer(cur => cur.isLinked()) < 2) {
									return res;
								}
								//let used = player.getCardUsable('sha') - 1.5, natures = ['thunder', 'fire', 'ice', 'kami'];
								let uv = player.getUseValue(item, true);
								if (uv <= 0) {
									return res;
								}
								let temp = player.getUseValue("sha", true) - uv;
								if (temp < 0) {
									return res + 0.15;
								}
								if (temp > 0) {
									return res - 0.15;
								}
								return res;
							},
							result: {
								target(player, target, card, isLink) {
									let eff = -1.5,
										odds = 1.35,
										num = 1;
									if (isLink) {
										eff = isLink.eff || -2;
										odds = isLink.odds || 0.65;
										num = isLink.num || 1;
										if (
											num > 1 &&
											target.hasSkillTag("filterDamage", null, {
												player: player,
												card: card,
												jiu: player.hasSkill("jiu"),
											})
										) {
											num = 1;
										}
										return odds * eff * num;
									}
									if (
										player.hasSkill("jiu") ||
										player.hasSkillTag("damageBonus", true, {
											target: target,
											card: card,
										})
									) {
										if (
											target.hasSkillTag("filterDamage", null, {
												player: player,
												card: card,
												jiu: player.hasSkill("jiu"),
											})
										) {
											eff = -0.5;
										} else {
											num = 2;
											if (get.attitude(player, target) > 0) {
												eff = -7;
											} else {
												eff = -4;
											}
										}
									}
									if (
										!player.hasSkillTag(
											"directHit_ai",
											true,
											{
												target: target,
												card: card,
											},
											true
										)
									) {
										odds -=
											0.7 *
											target.mayHaveShan(
												player,
												"use",
												target.getCards("h", i => {
													return i.hasGaintag("sha_notshan");
												}),
												"odds"
											);
									}
									_status.event.putTempCache("sha_result", "eff", {
										bool: target.hp > num && get.attitude(player, target) > 0,
										card: ai.getCacheKey(card, true),
										eff: eff,
										odds: odds,
									});
									return odds * eff;
								},
							},
						},
					},
					xinfan_shiya: {
						audio: "sbxueyi",
						trigger: {
							player: "useCardToPlayer",
						},
						filter(event, player) {
							return event.isFirstTarget && event.targets.length == game.countPlayer(i => i != player);
						},
						forced: true,
						async content(event, trigger, player) {
							for (const target of trigger.targets) {
								await target.addTempSkill("xinfan_shiya_ban", "useCardEnd");
							}
						},
						subSkill: {
							ban: {
								mod: {
									cardEnabled2: () => false,
								},
							},
						},
					},
                                        //烈徐庶
                    xinfan_yixing: {
						 audio: "friendxiaxing",
						usable: 1,
						trigger: {
							global: "phaseZhunbeiBegin",
						},
						filter(event, player) {
							return player.countCards("she") || event.player.countCards("he");
						},
						direct: true,
						async content(event, trigger, player) {
							const control = ["选项一", "选项二", "cancel2"];
							const list = [`交给${get.translation(trigger.player)}一张牌`, `获得${get.translation(trigger.player)}一张牌`];
							if (!player.countCards("she") || player == trigger.player) {
								control.remove("选项一");
								list[0] = '<span style="opacity:0.5">' + list[0] + "</span";
							}
							if (!trigger.player.countCards("he")) {
								control.remove("选项二");
								list[1] = '<span style="opacity:0.5">' + list[1] + "</span";
							}
							const { result: task1 } = await player
								.chooseControl(control)
								.set("choiceList", list)
								.set("target", trigger.player)
								.set("prompt", `义行：是否执行一项，若如此做，${get.translation(trigger.player)}可以对你造成一点伤害？`)
								.set("ai", () => {
									const player = _status.event.player;
									const target = _status.event.target;
									const att = get.attitude(player, target);
									if (att > 0 && target.countCards("j")) return "选项二";
									if (att > 0 && player.countCards("hes") > 1 && !target.countCards("h")) return "选项一";
									return "cancel2";
								});
							if (task1.control != "cancel2") {
								if (task1.control == "选项一") {
									const  result  = await player.chooseCard("she", `交给${get.translation(trigger.player)}一张牌`, true).set("ai", card => {
										if (player.countCards("she", "shan") > 1) return 1 / (get.value(card) + 1);
										return 100 - get.value(card);
									}).forResult();
									if (result.bool) {
										player.logSkill("xinfan_yixing", trigger.player);
										await player.give(result.cards, trigger.player, false);
									}
								} else {
									await player.gainPlayerCard(trigger.player, true, "he", `获得${get.translation(trigger.player)}一张牌`);
									player.logSkill("xinfan_yixing");
								}
								const  result  = await trigger.player
									.chooseBool(`是否对${get.translation(player)}造成一点伤害？`)
									.set("target", player)
									.set("ai", () => {
										const player = _status.event.player;
										const target = _status.event.target;
										return get.damageEffect(target, player, player) > 0;
									}).forResult();
								if (result.bool) {
									player.damage(trigger.player);
								}
							}
						},
					},
					xinfan_renxia: {
				        audio:"rezhuhai",
						zhuanhuanji: true,
						mark: true,
						marktext: "☯",
						init(player) {
							player.storage.xinfan_renxia = true;
						},
						intro: {
							content: storage => {
								if (storage) return "阳：当你造成或受到伤害后，你观看牌堆顶两张牌并交给至多两名角色，以此法获得牌的角色本回合内造成和受到的伤害加一";
								return "阴：当你造成或受到伤害后，你可以弃置两张牌防止此伤害或令此伤害加一。若你弃置的牌均为红色/黑色，你可以令一名角色摸一张牌/弃置一名角色区域内一张牌";
							},
						},
						group: ["xinfan_renxia_phaseBegin", "xinfan_renxia_yang", "xinfan_renxia_yin"],
						subSkill: {
							phaseBegin: {
								trigger: {
									global: "phaseBegin",
								},
								filter(event, player) {
									return !player.storage.xinfan_renxia;
								},
								direct: true,
								charlotte: true,
								content() {
									player.changeZhuanhuanji("xinfan_renxia");
								},
							},
							yangDebuff: {
								trigger: {
									source: "damageBegin",
									player: "damageSource",
								},
								mark: true,
								intro: {
									content: "本回合造成的伤害+1",
								},
								direct: true,
								firstDo: true,
								charlotte: true,
								content() {
									trigger.num++;
								},
							},
							yang: {
							audio:"rezhuhai",
								trigger: {
									source: "damageEnd",
									player: "damageEnd",
								},
								frequent: true,
								filter(event, player) {
									return player.storage.xinfan_renxia && !player.getHistory("useSkill", evt => evt.event.getParent(3) == event).length;
								},
								async content(event, trigger, player) {
									const cards = get.cards(2);
									player.directgains(cards, null, "xinfan_renxia");
									while (cards.length) {
										const  result  = await player.chooseCardTarget({
											prompt: "###任侠###是否将这些牌交给至多两名角色，以此法获得牌的角色本回合内造成的伤害加一",
											position: "hes",
											selectCard: [1, 2],
											filterCard(card) {
												return card.hasGaintag("xinfan_renxia");
											},
											filterTarget: true,
											ai1(card) {
												return get.value(card);
											},
											ai2(target) {
												const player = _status.event.player;
												const att = get.attitude(player, target);
												if (target.hasSkillTag("noGain")) return att / 9;
												return att;
											},
										}).forResult();
										if (result.bool) {
											await player.give(result.cards, result.targets[0], false);
											result.targets[0].addTempSkill("xinfan_renxia_yangDebuff");
											cards.removeArray(result.cards);
										} else {
											break;
										}
									}
									if (cards.length) {
										for (const card of cards) {
											card.removeGaintag("xinfan_renxia");
											ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
										}
									}
									player.changeZhuanhuanji("xinfan_renxia");
								},
							},
							yin: {
							audio:"zhuhai",
								trigger: {
									source: "damageBegin",
									player: "damageBegin",
								},
								direct: true,
								filter(event, player) {
									return !player.storage.xinfan_renxia;
								},
								async content(event, trigger, player) {
									let str = "###任侠###你可以弃置两张牌，并选择令伤害加一或防止此伤害";
									const { result: discard } = await player.chooseToDiscard("she",2, str).set("ai", card => {
										return 7 - get.value(card);
									});
									if (discard.bool) {
										const { result: choose } = await player
											.chooseControl("加伤", "免伤")
											.set("ai", () => {
												const player = _status.event.player;
												const target = _status.event.target;
												if (get.damageEffect(target, player, player) > 0) return "加伤";
												return "免伤";
											})
											.set("target", trigger.player)
											.set("prompt", "任侠：选择一项");
									     player.logSkill('zhuhai');
										if (choose.control == "加伤") {
											trigger.num++;
										} else {
											trigger.cancel();
										}
										const nums = [...new Set(discard.cards.map(i => get.color(i)))];
										if (nums.length == 1) {
											if (nums[0] == "red") {
												const  result  = await player.chooseTarget("是否令一名角色摸一张牌？").set("ai", target => {
													const player = _status.event.player;
													return get.effect(target, { name: "draw" }, player, player);
												}).forResult();
												if (result.bool) {
													result.targets[0].draw();
												}
											}
											if (nums[0] == "black") {
												const  result  = await player
													.chooseTarget("是否弃置一名角色区域内一张牌？", (card, player, target) => target.countDiscardableCards(player, "hej"))
													.set("ai", target => {
														const player = _status.event.player;
														return get.effect(target, { name: "guohe_copy2" }, player, player);
													}).forResult();
												if (result.bool) {
													await player.discardPlayerCard(result.targets[0], "hej");
												}
											}
										}
									}
								},
							},
						},
					},
                            //烈诸葛亮
        xinfan_jieze: {
        forced: true,
        audio: "sbguanxing",
        trigger: {
            global: ['roundStart'],
            player: ['phaseZhunbeiBegin'],
        },
        async content(event, trigger, player) {      
            const  result  = await player.chooseCardButton(get.cards(player.maxHp, true), true, '竭泽：获得一张牌').set('ai', button => get.buttonValue(button)).forResult();
            if (result.bool) {
                await player.gain(result.links[0], 'draw');
            }
            await player.chooseToGuanxing(player.maxHp - 1);
            await player.loseMaxHp();
        },
    },
   xinfan_zhisheng: {
        audio: "sbkanpo",
        trigger: {
            global: ['useCardBegin', 'respondBegin'],
        },
        filter(event, player) {
            return event.player != player;
        },
        	check(event, player) {
							return get.attitude(player, event.player) < 0;
						},
        async cost(event, trigger, player) {
            event.result = await player
                .chooseToDiscard('she', card => get.type2(card) == get.type2(_status.event.getTrigger().card), `###智胜###是否弃置一张${get.translation(get.type2(trigger.card))}牌令${get.translation(trigger.player)}使用或打出的牌（${get.translation(trigger.card)}）无效并弃置？`)
                .set('ai', card => get.value(card) + 5)
                .forResult();
        },
        async content(event, trigger, player) {
            trigger.cancel();
            if (trigger.card?.cards?.length) await trigger.player.discard(trigger.card.cards);
            if (get.name(trigger.card) === get.name(event.cards[0])) {
                trigger.player.markAuto('xinfan_zhisheng_invalid', [get.name(trigger.card)]);
            }
            if (!trigger.player.hasSkill('xinfan_zhisheng_invalid')) {
                trigger.player.addTempSkill('xinfan_zhisheng_invalid');
            }
        },
        subSkill: {
            invalid: {
                forced: true,
                charlotte: true,
                mark: true,
                intro: {
                    content: '记录牌名：$',
                },
                onremove: true,
                trigger: {
                    player: ['useCardBegin', 'respondBegin'],
                },
                firstDo: true,
                filter(event, player) {
                    return player.getStorage('xinfan_zhisheng_invalid').includes(get.name(event.card));
                },
                content() {
                    if(trigger.card?.cards.length){
                                player.discard(trigger.card.cards);
                            }
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        player(card, player) {
                            if (player.getStorage('xinfan_zhisheng_invalid').includes(get.name(card))) return 'zeroplayer';
                        },
                    },
                },
            },
        },
    },
                                                  //烈王异
                                                             xinfan_liezhenlie: { 
									audio:"oldmiji",
                              trigger: {
                                       global: "phaseBefore",
                                       },
                        marktext: '贞烈',
                         intro: {
                                   content: 'mark',
                                   name: '贞烈',
                                 },
                                 forced: true,
                                filter(event, player) {
                                    return game.phaseNumber == 0;
                                },
                              async content(event, trigger, player) {
                              const  result  = await player.chooseTarget(lib.filter.notMe, `###贞烈###你可以将一名角色标记为“贞烈”角色。`).set("ai", target => {
                                    const { player } = _status.event;
                                    return get.attitude(player, target) - 1;
                                }).forResult();
                                if (result.bool) {
                                   await result.targets[0].addMark('xinfan_liezhenlie', 1);
                                }
                                 },
                                 group: ['xinfan_liezhenlie_damage1','xinfan_liezhenlie_damage2'],
                            subSkill: {
                                    damage1: {
                               trigger: {
                                 global: "useCardToTarget"
                               },
							   priority:1,
                               forced: true,
                          filter: function (event, player) {
                    if (!event.target || event.targets.length != 1) return false;
                    var type = get.type(event.card)
                    if (type == 'basic' || (type == 'trick' && get.tag(event.card, 'damage'))) {
                        return event.target != player && event.target.countMark('xinfan_liezhenlie') > 0;
                    }
                },
                               logTarget: "player",
                               content: function () {
                                player.logSkill("xinfan_liezhenlie");
					         trigger.player.useCard({name:trigger.card.name},player,false);
				},
                                            ai: {
                                             order: 9,          // 高优先级执行（数字越大优先级越高）
                                             result: {
                                               target: 1,       // 主动选择目标（正数=优先选择友方）
                                             }
                                           },               
                                              },                                            
                                    damage2: {
                               trigger: {
                                 global: "useCardToTarget"
                               },
							   priority:2,
                               forced: true,
                          filter: function (event, player) {
                    if (!event.target || event.targets.length != 1) return false;
                    var type = get.type(event.card)
                    if (type == 'basic' || (type == 'trick' && get.tag(event.card, 'damage'))) {
                        return event.target != player && event.player != event.target && event.player.countMark('xinfan_liezhenlie') > 0;
                    }
                },
                               logTarget: "player",
                               content: function () {
								player.logSkill("xinfan_liezhenlie");
					         player.useCard({name:trigger.card.name},trigger.targets[0],false);	
				},
                               ai: {
                                 threaten: 1.5,
                                 expose: 0.2
                               },
                                             },
                                },
                                },
                       xinfan_liemiji: { 
                        audio:"oldzhenlie",
                              trigger: {
                                target: "useCardToTarget",
                                player: "useCardToTargeted",
                              },       
							  priority:3,          
                            filter: function (event, player) {
			          return get.color(event.card) == "none";
	                               	},
                         forced: true,
                                     content: function () {
			                               player.draw();
		                           },
           },
                                //烈张角
 				    xinfan_jiaoyi: {
 				    audio: "sbguidao",
        trigger: {
            global: 'damageAfter',
        },
        filter(event, player) {
            return event.hasNature('thunder');
        },
        forced: true,
        marktext: '道',
        intro: {
            content: 'mark',
            name: '道',
        },
        content() {
            player.addMark('xinfan_jiaoyi');
        },
        group: ['xinfan_jiaoyi_use', 'xinfan_jiaoyi_dying'],
        subSkill: {
            use: {
                audio: "sbguidao",
                enable: 'phaseUse',
                filter(event, player) {
                    return player.countMark('xinfan_jiaoyi') >= 2;
                },
                filterTarget: true,
                selectTarget: 1,
                content() {
                    player.removeMark('xinfan_jiaoyi', 2);
                    target.draw(2);
                },
                prompt: '你可以弃置两枚“道”标记，令一名角色摸两张牌',
                ai: {
                    result: {
                        target: 1,
                        player(player) {
                            return player.countMark('xinfan_jiaoyi') / 4 - 2;
                        },
                    },
                    order: 2,
                },
            },
            dying: {
                audio: "sbguidao",
                trigger: {
                    global: 'dyingBegin',
                },
                filter(event, player) {
                    return player.countMark('xinfan_jiaoyi') >= 2;
                },
                check(event, player) {
                    return get.attitude(player, event.player) > 0;
                },
                logTarget: 'player',
                prompt2: event => `弃置两枚“道”标记，令${get.translation(event.player)}回复一点体力`,
                content() {
                    player.removeMark('xinfan_jiaoyi', 2);
                    trigger.player.recover();
                },
            },
        },
    },
    xinfan_xingdao: {
    audio: "sbleiji",
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name)) return false;
            return ['lebu', 'wuzhong', 'shandian', 'bingliang'].includes(name);
        },
        enable: ['chooseToUse', 'chooseToRespond'],
        filter(event, player) {
            const filterSuit = suit => {
                return !player.hasSkill('xinfan_xingdao_' + suit) && player.countCards('hs', { suit: suit }) > 0;
            };
            return ['heart', 'diamond', 'spade', 'club'].some(suit => filterSuit(suit));
        },
        chooseButton: {
            dialog(event, player) {
                const list = [];
                const filterSuit = suit => {
                    return !player.hasSkill('xinfan_xingdao_' + suit) && player.countCards('hs', { suit: suit }) > 0;
                };
                if (filterSuit('heart')) {
                    list.push(['delay', '', 'lebu']);
                }
                if (filterSuit('spade')) {
                    list.push(['delay', '', 'shandian']);
                }
                if (filterSuit('club')) {
                    list.push(['trick', '', 'bingliang']);
                }
                if (filterSuit('diamond')) {
                    list.push(['trick', '', 'wuzhong']);
                }
                return ui.create.dialog('行道', [list, 'vcard']);
            },
            filter(button, player) {
                return true; //无视规则
            },
            check(button) {
                return 1;
            },
            backup(links, player) {
                return {
                    filterCard(card) {
                        const name = _status.event._result.links[0][2];
                        const maps = {
                            lebu: 'heart',
                            wuzhong: 'diamond',
                            shandian: 'spade',
                            bingliang: 'club',
                        };
                        return get.suit(card) == maps[name];
                    },
                    check(card) {
                        return 8 - get.value(card);
                    },
                    filterTarget: true,
                    selectTarget: 1,
                    position: 'hs',
                    viewAs: { name: links[0][2] },
                    precontent() {
                        const name = event.result.card.name;
                        const maps = {
                            lebu: 'heart',
                            wuzhong: 'diamond',
                            shandian: 'spade',
                            bingliang: 'club',
                        };
                        player.addTempSkill('xinfan_xingdao_' + maps[name]);
                    },
                    ai: {
                        order: 10,
                        result: {
                            target(player, target, card) {
                                if (card.name == 'wuzhong') {
                                    return 5;
                                }
                                const att = get.attitude(player, target);
                                if (att < 0) {
                                    return -1 / target.hp;
                                }
                                return 0;
                            },
                        },
                    },
                };
            },
        },
        subSkill: {
            heart: {
                charlotte: true,
            },
            diamond: {
                charlotte: true,
            },
            spade: {
                charlotte: true,
            },
            club: {
                charlotte: true,
            },
        },
        ai: {
            order: 9,
            result: {
                player: 1,
            },
        },
    },
    xinfan_zhangshi: {
    audio: "xinleiji",
        trigger: {
            global: 'addJudgeBegin',
        },
        check(event, player) {
            const att = get.attitude(player, event.player);
            const eff = get.effect(event.player, { name: 'sha', nature: 'thunder' }, player, player);
            if (att > 0 && event.player.hp > 2 && get.effect(event.player, event.card, event.parent.player, player) < 0) return true;
            if (eff > 0) {
                if (event.player.hp == 1) {
                    return true;
                }
                const name = event.card.name;
                if (event.player.countCards('j', card => card.name == name) > 0) return true;
                return event.card.name != 'lebu';
            }
            return false;
        },
        async content(event, trigger, player) {
            trigger.cancel();
            const cards = trigger.card.cards?.length ? trigger.card.cards : [];
            const name = trigger.card.name;
            const id = Math.random().toString(36).slice(-6);
            await player.useCard({ name: 'sha', nature: 'thunder', cards: cards, random: id }, cards, trigger.player, false);
            player
                .when('useCardAfter')
                .then(() => {
                    const histories = player.getHistory('sourceDamage', eevt => eevt.getParent('addJudge') == evt);
                    if (
                        histories.some(i => {
                            return i.card?.random == id;
                        })
                    ) {
                        targetz.executeDelayCardEffect(name);
                    }
                })
                .vars({
                    targetz: trigger.player,
                    name: name,
                    id: id,
                    evt: trigger,
                });
        },
    },
                                                  //烈关羽
                            xinfan_zhonglun: {
                        enable: "phaseUse",
                        usable: 1,
                        filterTarget: lib.filter.notMe,
                        audio: "olsbduoshou",
                        selectTarget: 1,
                        content: async function(event, trigger, player) {
                            var targets = game.filterPlayer(i => i != event.target && i != player);
                            if (targets.length) {
                                targets = targets.sortBySeat();
                                if (!event.target.storage.xinfan_zhonglun_num) event.target.storage.xinfan_zhonglun_num = 0;
                                var list = ["令" + get.translation(event.target) + "下次受到的伤害+1", "令" + get.translation(event.target) + "下次受到的伤害-1"];
                                for (var i of targets) {
                                    var result = await i.chooseControlList(get.translation(player) + "对" + get.translation(event.target) + "发动了〖众论〗，请你选择一项", list, true).set("ai", () => {
                                        var target = _status.event.target,
                                            player = _status.event.player;
                                        if (get.attitude(player, target) > 0) return 1;
                                        return 0;
                                    }).set("target", event.target).forResult();
                                    if (result.index == "0") {
                                        event.target.storage.xinfan_zhonglun_num++;
                                        i.say("加伤");
                                    } else {
                                        event.target.storage.xinfan_zhonglun_num--;
                                        i.say("减伤");
                                    }
                                };
                                event.target.addTempSkill("xinfan_zhonglun_num", {
                                    player: "damageAfter"
                                });
                            };
                            await event.target.damage();
                        },
                        subSkill: {
                            num: {
                                mark: true,
                                intro: {
                                    markcount: () => null,
                                    content: "下次受到的伤害增加：#",
                                },
                                trigger: {
                                    player: "damageBegin1",
                                },
                                forced: true,
                                content: function() {
                                    trigger.num += player.storage.xinfan_zhonglun_num;
                                    player.removeSkill("xinfan_zhonglun_num");
                                },
                                onremove: function(player) {
                                    delete player.storage.xinfan_zhonglun_num;
                                },
                            },
                        },
                        ai: {
                            order: 10,
                            result: {
                                target: -2,
                            },
                        },
                    },
                    xinfan_aoyi: {
                        audio: "olsbweilin",
                        trigger: {
                            player: ["shaMiss", "eventNeutralized"],
                        },
                        check: function(event, player) {
                            if (get.attitude(event.player, event.target) >= 0) return false;
                            return player.hp > 1;
                        },
                        filter(event, player) {
                            if (event.type !== "card" || (get.tag(event.card, "damage") && !event.target.isIn())) {
                                return false;
                            }
                            return true;
                        },
                        prompt2: function(event, player) {
                            return "失去一点体力，令此牌仍然生效且额外生效" + ((player.countMark("xinfan_aoyi") || 0) + 1) + "次";
                        },
                        intro: {
                            content: "mark",
                            markcount: "mark",
                        },
                        content: function() {
                            "step 0"
                            player.loseHp();
                            if (event.triggername === "shaMiss") {
                                trigger.untrigger();
                                trigger.trigger("shaHit");
                                trigger._result.bool = false;
                                trigger._result.result = null;
                            } else {
                                trigger.unneutralize();
                            };
                            player.addMark("xinfan_aoyi");
                            "step 1"
                            trigger.getParent().effectCount += player.countMark("xinfan_aoyi");
                        },
                        group: ["xinfan_aoyi_prepare", "xinfan_aoyi_damage", "damage1"],
                        subSkill: {
                            prepare: {
                                audio: "olsbweilin",
                                trigger: {
                                    source: "damageBefore",
                                },
                                firstDo: true,
                                direct: true,
                                forced: true,
                                charlotte: true,
                                priority: 99999999999999999999999999999999999999999999999999999999999999999999999999999999999999,
                                content: function() {
                                    trigger.filterStop = function() {
                                        if (this.gy_gy_1) return;
                                        if (this.source && this.source.isDead()) {
                                            delete this.source;
                                        }
                                        var num = this.original_num;
                                        for (var i of this.change_history) {
                                            num += i;
                                        }
                                        if (num != this.num) {
                                            this.change_history.push(this.num - num);
                                        }
                                        if (this.num <= 0) {
                                            this.gy_gy_1 = true;
                                            this.trigger("damageZero");
                                            this.gy_gy_1 = false;
                                        }
                                    };
                                },
                            },
                            damage: { //于damageBegin123进行拦截，抗性拦不住的说
                                trigger: {
                                    global: ["damageCancelled", "damageZero"]
                                },
                                audio: "olsbweilin",
                                filter(event, player, name) {
                                    if (event.xinfan_aoyi) return;
                                    if(event.source!=player) return false;
                                    if (name == "damageCancelled") {
                                        return true;
                                    }
                                    for (var i of event.change_history) {
                                        if (i < 0) {
                                            return true;
                                        }
                                    }
                                    return false;
                                },
                                cost: async function(event, trigger, player) {
                                    event.result = await player.chooseBool(get.prompt("xinfan_aoyi"), "失去一点体力，令此次伤害仍然生效且额外造成" + ((player.countMark("xinfan_aoyi") || 0) + 1) + "点").set("ai", () => {
                                        var event = _status.event.getTrigger();
                                        if (get.attitude(event.source, event.player) >= 0) return false;
                                        return player.hp > 1;
                                    }).forResult();
                                    if (!event.result.bool) {
                                        trigger.xinfan_aoyi = true;
                                        delete trigger.filterStop;
                                        trigger.finish();
                                        trigger._triggered = null;
                                    };
                                },
                                content: function() {
                                    "step 0"
                                    player.loseHp();
                                    if (event.triggername === "damageCancelled") {
                                        trigger.finished = false;
                                        trigger._cancelled = false;
                                        if (this._triggering) {
                                            trigger._triggering.finished = false
                                        };
                                        trigger._triggered = true;
                                    } else {
                                        trigger.xinfan_aoyi = true;
                                        trigger.num -= trigger.change_history.at(-1);
                                        trigger.change_history.pop();
                                    };
                                    player.addMark("xinfan_aoyi");
                                    "step 1"
                                    trigger.num += player.countMark("xinfan_aoyi");
                                },
                            },
                            damage1: { //于首尾进行拦截，抗性拦不住的说
                                priority: -99999999999999999999999999999999999999999999999999999999999999999999999999999999999999,
                                trigger: {
                                    source: ["damageBegin", "damageBegin4"]
                                },
                                audio: "olsbweilin",
                                filter(event, player, name) {
                                    if (event.xinfan_aoyi) return;
                                    var num = event.num;
                                    if (num > 0) return false;
                                    for (var i of event.change_history) {
                                        if (i < 0) {
                                            return true;
                                        }
                                    }
                                    return false;
                                },
                                cost: async function(event, trigger, player) {
                                    event.result = await player.chooseBool(get.prompt("xinfan_aoyi"), "失去一点体力，令此次伤害仍然生效且额外造成" + ((player.countMark("xinfan_aoyi") || 0) + 1) + "点").set("ai", () => {
                                        var event = _status.event.getTrigger();
                                        if (get.attitude(event.source, event.player) >= 0) return false;
                                        return player.hp > 1;
                                    }).forResult();
                                    if (!event.result.bool) {
                                        trigger.xinfan_aoyi = true;
                                    };
                                },
                                content: function() {
                                    "step 0"
                                    player.loseHp();
                                    trigger.num -= trigger.change_history.at(-1);
                                    trigger.change_history.pop();
                                    player.addMark("xinfan_aoyi");
                                    "step 1"
                                    trigger.num += player.countMark("xinfan_aoyi");
                                },
                            },
                        },
                    },
     //烈刘宏
    xinfan_guoku: {
            audio: "yujue",
        trigger: {
            global: 'gameDrawAfter',
        },
        forced: true,
        content() {
            player.loseToSpecial(get.cards(8), 'xinfan_guoku');
        },
        init(player) {
            player.storage.xinfan_guoku_map = {};
        },
        group: ['xinfan_guoku_others', 'xinfan_guoku_reset'],
        subSkill: {
            reset: {
                trigger: {
                    global: 'phaseEnd',
                },
                silent: true,
                content() {
                    player.storage.xinfan_guoku_map = {};
                },
            },
            others: {
                        audio: "yujue",
                trigger: {
                    global: 'gainAfter',
                },
                forced: true,
                logTarget: 'player',
                filter(event, player) {
                    if (event.parent.name == 'xinfan_fuying') {
                        return false;
                    }
                    if (!player.storage.xinfan_guoku_map[event.player.playerid]) {
                        player.storage.xinfan_guoku_map[event.player.playerid] = 0;
                    }
                    return event.player != player && player.storage.xinfan_guoku_map[event.player.playerid] < 5;
                },
                async eff(target, player) {
                    const  result  = await target.chooseCard(`###国库###请交出一张牌置于${get.translation(player)}的“国库”中`, 'she', true).forResult();
                    if (result.bool) {
                        player.loseToSpecial(result.cards, 'xinfan_guoku');
                    }
                },
                async content(event, trigger, player) {
                    player.storage.xinfan_guoku_map[trigger.player.playerid]++;
                    await lib.skill.xinfan_guoku_others.eff(trigger.player, player);
                },
            },
        },
    },
    xinfan_fuying: {
            audio: "tuxig",
        forced: true,
        trigger: {
            player: 'phaseBegin',
        },
        filter(event, player) {
            return player.countCards('s', card => card.hasGaintag('xinfan_guoku')) > 0;
        },
        logTarget(e, player) {
            return game.filterPlayer(i => i != player);
        },
        async content(event, trigger, player) {
            const giveMaps = {};
            const banTags = [];
            while (player.countCards('s', card => card.hasGaintag('xinfan_guoku')) > 0) {
                const  result  = await player
                    .chooseCardTarget({
                        selectCard: [1, Infinity],
                        position: 's',
                        filterTarget: lib.filter.notMe,
                        complexCard: true,
                        ai1: card => {
                            if (ui.selected.cards.length) {
                                return 0;
                            }
                            return 8 - get.value(card);
                        },
                        ai2: target => {
                            const { giveMaps, player } = get.event();
                            if (!Object.keys(giveMaps).includes(target.playerid)) {
                                return 100 + get.attitude(player, target);
                            }
                            return 0;
                        },
                        filterCard(card) {
                            const banTags = get.event().banTags;
                            return banTags.every(tag => !card.hasGaintag(tag));
                        },
                        prompt: '富盈：是否分配国库牌？',
                    })
                    .set('banTags', banTags)
                    .set('giveMaps', giveMaps).forResult();
                if (result.bool) {
                    const target = result.targets[0];
                    banTags.push(target.name);
                    for (const card of result.cards) {
                        card.addGaintag(target.name);
                    }
                    giveMaps[target.playerid] = giveMaps[target.playerid] || [];
                    giveMaps[target.playerid].push(...result.cards);
                } else {
                    break;
                }
            }
            for (const target of game.filterPlayer()) {
                if (giveMaps[target.playerid]) {
                    const next = await player.give(giveMaps[target.playerid], target, true);
                    next.xinfan_fuying = true;
                    await game.delayx(0.5);
                }
            }
            const keys = Object.keys(giveMaps);
            const otherTargets = game.filterPlayer(i => !keys.includes(i.playerid) && i != player);
            for (const target of otherTargets) {
                const  result  = await target
                    .chooseBool('富盈：是否令' + get.translation(player) + '你流失一点体力？')
                    .set('target', player)
                    .set('ai', () => {
                        const { player, target } = get.event();
                        if (get.attitude(target, player) <= 0) return true;
                        return false;
                    }).forResult();
                if (result.bool) {
                    await player.loseHp();
                }
            }
        },
    },
    xinfan_gongzhu: {
        audio: "tuxig",
        zhuSkill: true,
        trigger: {
               global: 'phaseZhunbeiBegin',
                       },
        filter(event, player) {
            return event.player != player;
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseBool(`###共主###是否令${get.translation(trigger.player)}摸两张牌？`)
                .set('target', trigger.player)
                .set('ai', () => {
                    const { player, target } = get.event();
                    return get.attitude(player, target) > 0;
                })
                .forResult();
        },
        content() {
            trigger.player.draw(2);
        },
    },
                      //烈黄盖
 				    xinfan_zhaxiang: {
 				   audio: "sbzhaxiang",
        trigger: {
            global: 'phaseUseBegin',
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseCardTarget({
                    position: 'hes',
                    filterCard: true,
                    filterTarget: lib.filter.notMe,
                    selectCard: 1,
                    prompt: '###诈降###是否交给一名其他角色一张牌。若其未横置，则其横置。',
                    ai1: card => {
                        return 6.5 - get.value(card);
                    },
                    ai2: target => {
                        const player = get.player();
                        if (player.needsToDiscard() <= 0) return 0;
                        return -1 / target.hp - target.countMark('xinfan_renhuo');
                    },
                })
                .forResult();
        },
        async content(event, trigger, player) {
            let target;
            let cards;
            if (!event.targets?.length) {
                const  result  = await player.chooseCardTarget({
                    position: 'hes',
                    filterCard: true,
                    filterTarget: lib.filter.notMe,
                    selectCard: 1,
                    prompt: '###诈降###是否交给一名其他角色一张牌。若其未横置，则其横置。',
                    ai1: card => {
                        return 6.5 - get.value(card);
                    },
                    ai2: target => {
                        const player = get.player();
                        if (player.needsToDiscard() <= 0) return 0;
                        return -1 / target.hp - target.countMark('xinfan_renhuo');
                    },
                }).forResult();
                if (result.bool) {
                    target = result.targets[0];
                    cards = result.cards;
                }
            } else {
                target = event.targets[0];
                cards = event.cards;
            }
            if (cards && target) {
                await player.give(cards, target);
                if (!target.isLinked()) {
                    target.link();
                }
            }
        },
    },
    xinfan_kurou: {
       audio: "sbkurou",
        trigger: {
            player: 'changeHp',
        },
        filter(event, player) {
            return event.num < 0;
        },
        forced: true,
        async content(event, trigger, player) {
            const num = -trigger.num;
            await player.changeHujia(num);
            await player.draw(num * 2);
            player.useSkill('xinfan_zhaxiang');
        },
    },
    xinfan_renhuo: {
       audio: "sbtuxi",
        init(player) {
            if (!player.isLinked()) player.link();
        },
        intro: {
            content: 'mark',
        },
        marktext: '祸',
        trigger: {
            global: 'phaseEnd',
        },
        forced: true,
        content() {
            player.useCard({ name: 'huogong' }, player, false);
        },
        group: ['xinfan_renhuo_link', 'xinfan_renhuo_gain'],
        global: ['xinfan_renhuo_damage'],
        subSkill: {
            link: {
                trigger: {
                    player: 'linkBefore',
                },
                forced: true,
                filter(event, player) {
                    return player.isLinked();
                },
                content() {
                    trigger.cancel();
                },
            },
            gain: {
                trigger: {
                    source: 'gainEnd',
                },
                forced: true,
                filter(event, player) {
                    return event.player && event.player != player && event.player.isIn();
                },
                logTarget: 'player',
                content() {
                    trigger.player.addMark('xinfan_renhuo', 1);
                },
            },
            damage: {
                trigger: {
                    player: 'damageBegin',
                },
                filter(event, player) {
                    return event.nature && player.countMark('xinfan_renhuo') > 0;
                },
                forced: true,
                content() {
                    trigger.num += 1;
                    player.removeMark('xinfan_renhuo');
                },
            },
        },
    },
                       //烈张辽
                     xinfan_tuxi: {
        group: ['xinfan_tuxi_1', 'xinfan_tuxi_2'],
        subSkill: {
            1: {
                 audio: "sbtuxi", 
                check(event, player) {
                    return get.effect(event.target, { name: 'sha' }, player, player) > 0;
                },
                trigger: {
                    global: ['discardAfter'],
                },
                logTarget: 'player',
                prompt2(event, player) {
                    return `对${get.translation(event.player)}使用一张雷【杀】？`;
                },
                usable: 1,
                filter(event, player) {
                return event.player!=player&&_status.currentPhase==event.player;
                },
                check: function (event,player){
                 return get.attitude(player,event.player)<0;
                },
                content() {             
                    player.useCard({ name: 'sha', nature: 'thunder' }, trigger.player, false);
                },
            },
            2: {
                 audio: "sbtuxi", 
                check(event, player) {
                    return get.effect(event.target, { name: 'sha' }, player, player) > 0;
                },
                trigger: {
                    global: ['useCardEnd' ],
                },
                logTarget: 'player',
                prompt2(event, player) {
                    return `对${get.translation(event.player)}使用一张雷【杀】？`;
                },
                usable: 1,
                filter(event, player) {
                   return _status.currentPhase != event.player && event.player != player;
                },
                check: function (event,player){
                 return get.attitude(player,event.player)<0;
                },
                content() {
                    player.useCard({ name: 'sha', nature: 'thunder' }, trigger.player, false);
                },
            },
        },
    },
                      xinfan_wucuo: {
        forced: true,
        trigger: {
            player: 'useCard',
        },
        logTarget(_, player) {
            return game.filterPlayer(i => i != player);
        },
        content() {
            game.filterPlayer(i => i != player).forEach(i => {
                i.addTempSkill('xinfan_wucuo_effect');
                i.when({ global: 'useCardAfter' })
                    .filter(evt => evt.player == player)
                    .then(() => {
                        player.removeSkill('xinfan_wucuo_effect');
                    });
            });
        },
        subSkill: {
            effect: {
                charlotte: true,
                mod: {
                    cardEnabled2(card, player) {
                        const cards = player.getHistory('gain').reduce((cards, evt) => cards.addArray(evt.cards), []);
                        if (cards.includes(card)) return false;
                    },
                },
                mark: true,
                intro: {
                    content: '你不能使用或打出本回合内获得的牌',
                },
            },
        },
    },
    xinfan_kuibing: {
    audio: "sbdengfeng", 
        trigger: {
            source: 'damageEnd',
        },
        filter(event) {
            return !event.xinfan_kuibing;
        },
        async cost(event, trigger, player) {
            const control = ['选项一', '选项二', '选项三', 'cancel2'];
            const list = [`弃置${get.translation(trigger.player)}本回合内获得的牌`, `获得${get.translation(trigger.player)}装备区所有牌`, `对${get.translation(trigger.player)}造成一点雷属性伤害`];
            if (player.hasSkill('xinfan_kuibing_1')) {
                control.remove('选项一');
                list[0] = '<span style="opacity:0.5">' + list[0] + '（本回合已发动）' + '</span>';
            }
            const cards = trigger.player.getHistory('gain').reduce((cards, evt) => cards.addArray(evt.cards), []);
            const nowCards = trigger.player.getCards('h', i => cards.includes(i));
            if (nowCards.length == 0 && control.includes('选项一')) {
                control.remove('选项一');
                list[0] = '<span style="opacity:0.5">' + list[0] + `（${get.translation(trigger.player)}手牌中没有本回合获得的牌）` + '</span>';
            }
            if (player.hasSkill('xinfan_kuibing_2')) {
                control.remove('选项二');
                list[1] = '<span style="opacity:0.5">' + list[1] + '（本回合已发动）' + '</span>';
            }
            if (trigger.player.countCards('e') == 0 && control.includes('选项二')) {
                control.remove('选项二');
                list[1] = '<span style="opacity:0.5">' + list[1] + `（${get.translation(trigger.player)}装备区没有牌）` + '</span>';
            }
            if (player.hasSkill('xinfan_kuibing_3')) {
                control.remove('选项三');
                list[2] = '<span style="opacity:0.5">' + list[2] + '（本回合已发动）' + '</span>';
            }
            if (control.length == 1) {
                event.result = { bool: false };
            } else {
                const  result  = await player
                    .chooseControl(control)
                    .set('choiceList', list)
                    .set('prompt', '溃兵：请选择一项执行！')
                    .set('target', trigger.player)
                    .set('ai', () => {
                        const target = _status.event.target;
                        const controls = _status.event.controls;
                        const cards = target.getHistory('gain').reduce((cards, evt) => cards.addArray(evt.cards), []);
                        const nowCards = target.getCards('she', i => cards.includes(i));
                        if (nowCards.length > 1 && controls.includes('选项一')) return '选项一';
                        if (target.countCards('e') > 1 && controls.includes('选项二')) return '选项二';
                        return controls.includes('选项三') ? '选项三' : 'cancel2';
                    }).forResult();
                event.result = {
                    bool: true,
                    cost_data: {
                        control: result.control,
                    },
                };
            }
        },
        async content(event, trigger, player) {
            const control = event.cost_data.control;
            if (control == '选项一') {
                const cards = trigger.player.getHistory('gain').reduce((cards, evt) => cards.addArray(evt.cards), []);
                const nowCards = trigger.player.getCards('h', i => cards.includes(i));
                if (nowCards.length) {
                    await trigger.player.discard(nowCards);
                }
                player.addTempSkill('xinfan_kuibing_1');
            } else if (control == '选项二') {
                const equips = trigger.player.getCards('e');
                if (equips.length) {
                    await player.gain(equips, 'giveAuto', 'bySelf');
                }
                player.addTempSkill('xinfan_kuibing_2');
            } else {
                trigger.player.damage(1, 'thunder').xinfan_kuibing = true;
                player.addTempSkill('xinfan_kuibing_3');
            }
        },
        subSkill: {
            1: {
                charlotte: true,
            },
            2: {
                charlotte: true,
            },
            3: {
                charlotte: true,
            },
        },
    },
                               //烈姜维
                                xinfan_weijian: {
                                    audio: "kunfen",
                         mark: true,
						intro: {
							content: "limited",
						},
        trigger: {
            global: ['loseAfter', 'cardsDiscardAfter'],
        },
        filter(event, player) { 
           return event.getd(event.player, 'cards2')?.length;
        },
        async cost(event, trigger, player) {
            let target = trigger.player;
            if (!target) {
                target = trigger.getParent().player;
                if (!target) {
                    target = trigger.getParent(2).player;
                }
            }
            event.result = await player
                .chooseBool(`###维艰###是否流失一点体力，令${get.translation(target)}取回一张牌（${get.translation(trigger.getd(target, 'cards2'))}）？`)
                .set('map', [target, trigger.getd(target, 'cards2')])
                .set('ai', () => {
                    const { player, map } = get.event();
                    return get.attitude(player, map[0]) > 0 && player.countMark('xinfan_weijian') < 1 && map[1].some(card => get.value(card) >= 5.2);
                })
                .forResult();
            event.result.targets = [target];
        },
        global: ['xinfan_weijian_c'],
        subSkill: {
            c: {
                mod: {
                    ignoredHandcard(card, player) {
                        if (card.hasGaintag('xinfan_weijian')) {
                            return true;
                        }
                    },
                    carzyhiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && card.hasGaintag('xinfan_weijian')) {
                            return false;
                        }
                    },
                     cardUsable(card, player, num) {
                                return card.cards?.every(i => i.hasGaintag('xinfan_weijian')) ? Infinity : num;
                            },
                },
                        trigger: {
            global: 'phaseJieshuBegin',
        },
         filter(event, player) { 
           return player.countMark('xinfan_weijian') > 0;
        },
       async cost(event, trigger, player) {
            player.clearMark('xinfan_weijian');
        },
            },
        },
        async content(event, trigger, player) {
            let num = 1+ player.countMark('xinfan_weijian');
            await player.loseHp(num);
            const target = event.targets[0];
            const cards = trigger.getd(target, 'cards2');
            const result =
                cards.length == 1
                    ? {
                          bool: true,
                          links: cards,
                      }
                    : await target
                          .chooseCardButton(cards, true, '维艰：取回一张牌并标记为“维艰”')
                          .set('ai', button => get.value(button.link))
                          .forResult();
            if (result.bool) {
                const next = target.gain(result.links, 'gain2');
                next.gaintag.add('xinfan_weijian');
                player.addMark('xinfan_weijian', 1);
                await next;
            }
        },
    },
					xinfan_kuzhi: {
                        audio: "olsbranji",
						skillAnimation: true,
						animationColor: "orange",
						unique: true,
						juexingji: true,
						forced: true,
						trigger: {
							player: "dying",
						},
						derivation: ["xinfan_xinhuo", "xinfan_yujin"],
						async content(event, trigger, player) {
							player.awakenSkill("xinfan_kuzhi");
							await player.drawTo(player.maxHp);
							await player.recoverTo(player.maxHp);
							player.changeSkills(["xinfan_xinhuo", "xinfan_yujin"], ["xinfan_weijian"]);
						},
					},
                    					xinfan_xinhuo: {
                                            audio: "olsbranji",
						enable: "phaseUse",
						usable: 1,
                        limited: true,
						mark: true,
						intro: {
							content: "limited",
						},
						ai: {
							result: {
								player(player) {
									if (player.hp <= 3) return 5;
									return 0;
								},
							},
							order: 0.3,
						},
						async content(event, trigger, player) {
							let num = player.countMark('xinfan_yujin') + 1;
                          while (num > 0) {
                        const  result  = await player.chooseTarget(`###心火###选择一名角色分配伤害（当前还剩余${num}点）`).set('ai', target => {
                            const player = _status.event.player;
                            return get.damageEffect(target, player, player, "fire");
                        }).forResult();
                        if (result.bool) {
                            const { result: control } = await player
                                .chooseNumbers('心火', [{ prompt: `选择分配给${get.translation(result.targets[0])}的伤害数`, min: 1, max: num }])
                                .set('processAI', () => {
                                    return _status.event.nums.randomGets(1);
                                })
                                .set('nums', [num]);
                            if (control.numbers?.[0]) {
                                await result.targets[0].damage(control.numbers[0], "fire");
                                num -= control.numbers[0];
                            }
                        } else {
                            break;
                        }
                        }
                            player.awakenSkill('xinfan_xinhuo');
						},
					},
                    					xinfan_yujin: {
						audio: "olsbzhuri",
                        forced: true,
						trigger: {
							global: "phaseEnd",
						},
                                intro: {
                          content: 'mark',
                          },
						async content(event, trigger, player) {
							if (player.maxHp != 1) {
								await player.loseMaxHp();
                                await player.changeHujia(1);
								await player.draw(2);
                                player.addMark('xinfan_yujin', 1);
							} else {
                                  player.addMark('xinfan_yujin', 1);
								  player.useSkill('xinfan_xinhuo');
                                  await player.loseMaxHp();
								}
							}
						},
                             //烈庞统
						    xinfan_lianhuan: {
						audio: "sblianhuan",
        enable: 'phaseUse',
        filter(event, player) {
            if (player.hp <= 0) return false;
            if (event.name == 'useCardToTargeted') {
                return event.player != player;
            }
            return true;
        },
        async cost(event, trigger, player) {
            const  result  = await player.chooseBool(`###连环###你是否要流失所有体力令至多等量名其他角色横置？`).set('ai', () => {
                const player = get.player();
                return game.hasPlayer(target => get.attitude(player, target) < 0);
            }).forResult();
            if (!result.bool) {
                event.result = { bool: false };
                return;
            } else {
                const next = await player
                    .chooseTarget(`###连环###你可以横置至多${player.hp}名角色`, [1, player.hp])
                    .set('ai', target => {
                        const player = get.player();
                        const att = get.attitude(player, target);
                        if (att <= 0 && !target.isLinked()) return 0.5;
                        return 0;
                    })
                    .forResult();
                event.result = {
                    bool: true,
                    targets: next.targets || [],
                };
            }
        },
        filterTarget: true,
        selectTarget() {
            const player = get.player();
            return [0, player.hp];
        },
        ai: {
            order: 0.1,
            result: {
                player(player) {
                    if (player.getFriends().length && player.getFriends()[0].hp > 2) return 5;
                    return 0;
                },
                target(player, target) {
                    if (target.hasSkillTag('noLink') || target.isLinked()) return 0;
                    const att = get.attitude(player, target);
                    if (att <= 0 && !target.isLinked()) return -0.5;
                    return 0;
                },
            },
        },
        multitarget: true,
        trigger: {
            target: 'useCardToTargeted',
        },
	audio: "sblianhuan",
        async content(event, trigger, player) {
            const targets = event.targets || [];
            for (const target of targets) {
                await target.link(true);
            }
                const  result  = await player.chooseTarget(`###连环###是否弃置其他角色一张牌？`, (card, player, target) => {
                                        return target != player && target.countCards('he');
                                    })
                                    .set('ai', target => {
                                        const player = get.player();
                                        return get.effect(target, { name: 'guohe_copy' }, player, player);
                                    }).forResult();
                                if (result.bool) {
                                   player.discardPlayerCard(result.targets[0], 'he', true);
                                    await player.loseHp(player.hp);
                                }
              else{
              await player.loseHp(player.hp);
            }
      },
},
     xinfan_niepan: {
                        audio: 'sbniepan',
                        locked: true,
                        forceDie: true,
                        trigger: {
                            player: 'die',
                        },
                        group: ['xinfan_niepan_revive'],
                        subSkill: {
                            revive: {
                                trigger: {
                                    global: 'roundEnd',
                                },
                                audio: 'sbniepan',
                                forced: true,
                                forceDie: true,
                                async content(event, trigger, player) {
                                    player.maxHp=game.players.length
                                    await player.reviveEvent(game.countPlayer());
                                    await player.drawTo(game.countPlayer() - 1); //已经复活，需要减去自己
                                },
                            },
                        },
                        async cost(event, trigger, player) {
                            event.result = await player
                                .chooseTarget(`###涅槃###你可以令一名其他角色于你阵亡后受到一点火焰伤害`, lib.filter.notMe, 1)
                                .set('ai', target => {
                                    const player = get.player();
                                    return get.damageEffect(target, player, player, 'fire');
                                })
                                .forResult();
                        },
                        async content(event, trigger, player) {
                            const target = event.targets[0];
                            target.when({ global: 'dieAfter' }).then(() => {
                                player.damage('fire', 'nosource');
                            });
                        },
                    },
                 //烈高顺
xinfan_xianzhen: {
    audio: "rexianzhen",
  init: function (player) {
                            player.storage.xinfan_xianzhen = 0;
                        },
         marktext: '陷',
        intro: {
            content: 'mark',
            name: '陷',
            },
  trigger: {
    global: "phaseEnd"
  },
  forced: true,
  content: function () {
                            player.addMark('xinfan_xianzhen', 1);
                        },
  mod: {
    globalFrom: function (from, to, distance) {
                                return distance - from.countMark('xinfan_xianzhen');
                            },
    globalTo: function (from, to, distance) {
                                return distance - to.countMark('xinfan_xianzhen');
                            }
  },
},
                           xinfan_yongjue: {
                            audio: "sbxianzhen",
                           enable: "phaseUse",
                            filter: function (event, player) {
                            return player.storage.xinfan_xianzhen > 0;
                        },
                           filterTarget: function (card, player, target) {
                            if (target == player) return false;
                            return true;
                        },
                        async content(event,trigger,player){
                            await player.removeMark('xinfan_xianzhen', 1);
                            event.target.damage("nocard");
                            },
                           ai: {
                             result: {
                               target: -1,
                               player: function (player) {
                                        return player.isLinked() ? 0 : -0.8;
                                    }
                             },
                             order: 2,
                             expose: 0.3,
                             effect: {
                               target: function (card) {
                                        if (card.name == 'tiesuo') {
                                            return 0.5;
                                        }
                                    }
                               }
                           },
          group: ['xinfan_yongjue_damage1', 'xinfan_yongjue_damage2'],
             subSkill: {
            damage1: {
                trigger: {
                    player: 'damageBegin1',
                },
                filter(event, player) {
                    return player.countMark('xinfan_xianzhen') > 0;
                },
                direct: true,
                 async content(event,trigger,player){
                    const result  = await player.chooseBool("是否弃置一枚标记，令防止你受到的伤害？").forResult();
                    if (result.bool) {
                    await player.logSkill("xinfan_yongjue");
                    await player.removeMark('xinfan_xianzhen', 1);
                    trigger.cancel();
                    }
                },
            },
            damage2: {
               trigger: {
               target: "useCardToBefore"
     },
       filter: function (event, player) {
                            return event.player != player && player.storage.xinfan_xianzhen > 0;
                        },
         direct: true,
         async content(event,trigger,player){
                            const result  = await player.chooseBool("是否弃置一枚标记，令此牌对你无效？").forResult();
                            if (result.bool) {
                                await player.logSkill("xinfan_yongjue");
                                await player.removeMark('xinfan_xianzhen', 1);
                                trigger.cancel();
                            }    
                            }
                        },
            },
        },

        //星繁
                             //星周宣
    xinfan_wuwei: {
        enable: ['chooseToUse', 'chooseToRespond'],
        usable: 1,
        audio: "dcwumei",
        hiddenCard(player, name) {
            const type = get.type(name);
            return type == 'basic' || type == 'trick';
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
                return ui.create.dialog('无为', [list, 'vcard']);
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
                    async precontent(event, trigger, player) {
                        const type = get.type(event.result.card);
                        const target = _status.currentPhase;
                        player.logSkill('xinfan_wuwei', target);

                        const next = game.createEvent('xinfan_wuwei_discard', false);
                        next.player = target;
                        next.type = type;

                        next.setContent(async function (event, trigger, player) {
                            const type = event.type;
                            const  result  = await player
                                .chooseToDiscard('she', c => get.type(c) == get.event().type, `###无为###请选择一张${get.translation(type)}牌，否则本回合内不能使用或打出手牌`, 1)
                                .set('type', type)
                                .set('ai', card => {
                                    const player = get.event().player;
                                    if (player.hasSkill('xinfan_qingmeng_nouse')) return 0;
                                    return 4.3 - get.value(card);
                                }).forResult();
                            if (!result.bool) {
                                player.addTempSkill('xinfan_wuwei_debuff');
                            }
                        });
                    },
                };
            },
        },
        subSkill: {
            debuff: {
                charlotte: true,
                mod: {
                    cardEnabled(card) {
                        if (get.position(card) == 'h') return false;
                    },
                    cardDiscardable() {
                        return false;
                    },
                },
            },
        },
        ai: {
            save: true,
            respondSha: true,
            respondShan: true,
            order: 1,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
    },
    xinfan_qingmeng: {
                                    audio: "dczhanmeng",
        round: 1,
        trigger: {
            global: 'phaseEnd',
        },
        lastDo: true,
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt2(event.skill))
                .set('ai', target => get.attitude(get.player(), target))
                .forResult();
        },
        async content(event, trigger, player) {
            event.targets[0].insertPhase().skill=event.name;
            event.targets[0].addTempSkill('xinfan_qingmeng_nouse', 'phaseEnd');
        },
        subSkill: {
            nouse: {
                charlotte: true,
                mod: {
                    cardEnabled(card) {
                        if (get.position(card) == 'h') return false;
                    },
                },
            },
        },
    },
                                   //星徐氏
                                xinfan_bugua: {
                                    audio: "wengua",
        trigger: {
            global: 'phaseZhunbeiBegin',
        },
        filter(event, player) {
            return player.countCards('hs');
        },
        marktext: '卜',
        intro: {
            content: 'mark',
            name: '卜',
        },
        async cost(event, trigger, player) {
            const num = player.countMark('xinfan_bugua') + 1;
            event.result = await player
                .chooseCard('hs', `###卜卦###是否展示一张手牌并卜算${num}`)
                .set('ai', card => {
                    return Math.random() + (get.type(card) == 'basic' ? 0.1 : 0);
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const [card] = event.cards;
            const num = player.countMark('xinfan_bugua') + 1;
            const name = get.name(card, player);
            const type = get.type2(card, player);

            const cards = get.cards(num, true);
            const bool1 = cards.some(i => get.name(i) == name);
            const bool2 = cards.some(i => get.type2(i, player) == type);
            let num2 = (bool1 ? 1 : 0) + (bool2 ? 1 : 0);
            if (num2 > 0) {
                 if (num < 4) {           
                player.addMark('xinfan_bugua', num2);
                }
            }
            await player.chooseToGuanxing(num);
            player.draw();
        },
    },
    xinfan_bixiong: {
        audio: "sbguose",
        usable: 1,
        trigger: {
            target: 'useCardToTargeted',
        },
        filter(event, player) {
            return !player.getStorage('xinfan_bixiong_used').includes(event.player) && event.player != player && game.hasPlayer(i => i != event.player && i != player);
        },
        async cost(event, trigger, player) {
            const targets = game.filterPlayer(i => i != trigger.player && i != player);
            let bool = false;
            for (const target of targets) {
                const  result  = await target
                    .chooseBool(`###避凶###${get.translation(trigger.player)}对${get.translation(player)}使用了${get.translation(trigger.card)}，是否取消之并令其发动一次“卜卦”？`)
                    .set('ai', () => {
                        const { eff } = get.event();
                        return eff < 0;
                    })
                    .set('eff', get.effect(player, trigger.card, trigger.player, target)).forResult();
                if (result.bool) {
                    bool = true;
                    break;
                }
            }
            event.result = {
                bool: bool,
            };
        },
        async content(event, trigger, player) {
            trigger.getParent().excluded.add(player);
            player.markAuto('xinfan_bixiong_used', trigger.player);
            player.addTempSkill('xinfan_bixiong_used');
            const num = player.countMark('xinfan_bugua') + 1;
            const  result  = await player.chooseCard('hs', `###卜卦###是否展示一张手牌并卜算${num}`).set('ai', card => {
                return Math.random() + (get.type(card) == 'basic' ? 0.1 : 0);
            }).forResult();
            if (result.bool) {
                const next = game.createEvent('xinfan_bugua');
                next.player = player;
                next.cards = result.cards;
                next.setContent(lib.skill.xinfan_bugua.content);
            }
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
					 //星蔡文姬
						    xinfan_boyue: {
                                audio: "chenqing",
        forced: true,
        priority:1,
        trigger: {
            player: ['useCardBegin', 'respondBegin'],
        },
        filter(event, player) {
            return !player.getStorage('xinfan_boyue').includes(event.card.name);
        },
        content() {
            player.markAuto('xinfan_boyue', trigger.card.name);
        },
        intro: {
            content: '当前记录牌名：$',
        },
          group: ['xinfan_boyue_damage1'],
                            subSkill: {

          damage1: {
                           trigger: {
            player: ['useCardBegin', 'respondBegin'],
        },
        usable: 1,
        forced: true,
        priority:5,
        filter(event, player) {
            return !player.getStorage('xinfan_boyue').includes(event.card.name)&&_status.currentPhase==player;
        },
               check: function () {
			return true;
		},
         async content(event, trigger, player) {
              player.draw();
		},
     },
    },
    },
    xinfan_moshi: {
        audio: "mozhi",
        enable: ['chooseToRespond', 'chooseToUse'],
        hiddenCard(player, name) {
            if (!player.getStorage('xinfan_boyue').includes(name)) return false;
            const type = get.type2(name);
            return !player.getStorage('xinfan_moshi_used').includes(type);
        },
        filter(event, player) {
            for (const name of lib.inpile) {
                if (!player.getStorage('xinfan_boyue').includes(name)) continue;
                const type = get.type2(name);
                if (player.getStorage('xinfan_moshi_used').includes(type)) continue;
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
                    if (!player.getStorage('xinfan_boyue').includes(name)) continue;
                    const type = get.type(name);
                    if (player.getStorage('xinfan_moshi_used').includes(type)) continue;
                    if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) list.push([get.translation(get.type(name)), '', name]);
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j }, 'unsure'), player, event)) list.push(['基本', '', 'sha', j]);
                        }
                    }
                }
                return ui.create.dialog('默识', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2], nature: button.link[3] }, player, _status.event.getParent());
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                const player = _status.event.player;
                if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
                return player.getUseValue({ name: button.link[2], nature: button.link[3] });
            },
            backup(links, player) {
                return {
                    filterCard: false,
                    selectCard: 0,
                    position: 'hes',
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    async precontent(event, trigger, player) {
                        player.logSkill("xinfan_moshi");
                        const card =
                            [
                                ...ui.cardPile.childNodes,
                                ...ui.discardPile.childNodes,
                                ...ui.special.childNodes,
                                ...game
                                    .filterPlayer()
                                    .map(pl => pl.getCards('shexj'))
                                    .flat(),
                            ]
                                .randomSort()
                                .find(c => get.name(c) == event.result.card.name && (event.result.card.nature ? get.nature(c) == event.result.card.nature : true)) || game.createCard(event.result.card.name, null, null, event.result.card.nature);
                        if (card) {
                            await player.gain(card, 'gain2');
                        }
                        event.result.card = card;
                        event.result.cards = [card];
                        player.markAuto('xinfan_moshi_used', get.type2(event.result.card.name));
                        player.unmarkAuto('xinfan_boyue', event.result.card.name);
                        event.result.card = card;
                        player.addTempSkill('xinfan_moshi_used');
                    },
                };
            },
            prompt(links) {
                return '获得牌' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '并使用或打出';
            },
        },
        ai: {
            combo: 'xinfan_boyue',
            order: 7,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
            fireAttack: true,
            respondSha: true,
            respondShan: true,
            save: true,
            skillTagFilter(player, tag, arg) {
                const names = player.getStorage('xinfan_boyue');
                const types = player.getStorage('xinfan_moshi_used');
                if (tag == 'fireAttack') return (names.includes('sha') && !types.includes('basic')) || (names.includes('huogong') && !types.includes('trick'));
                if (tag == 'respondSha') return names.includes('sha') && !types.includes('basic');
                if (tag == 'respondShan') return names.includes('shan') && !types.includes('basic');
                if (tag == 'save') return names.includes('tao') && !types.includes('basic');
                return false;
            },
        },
        subSkill: {
            used: {
                onremove: true,
                charlotte: true,
                intro: {
                    content: '已使用牌类：$',
                },
            },
        },
    },
						
 
                            //星王异
                          xinfan_zhenlie: {
                                 audio: "oldzhenlie",
                        trigger: {
                          target: "useCardToBefore",
                        },
                        filter: function (event,player){
                                return event.player!=player;
                            },
                        check: function (event,player){
	                        	var att=get.attitude(player,event.player);
		                        if(att>=0) return false;
		                        if(player.hp==1) return true;
		                        return player.hp<player.maxHp;
                            },
                        async content(event, trigger, player) {
                                await player.loseHp();
	                        	 trigger.cancel();
                    		if(trigger.player.countCards('he')) {
		                    	await player.discardPlayerCard(trigger.player,'he',true);
		                        }
                              },
                              group: ['xinfan_zhenlie_add'],
                       subSkill: {
                               add: {   
                                audio: "oldzhenlie",
                                   trigger: {
                                     player: "damageBegin",
                                       },
                               filter: function (event, player) {
                            return player.hp > 0 && event.source;
                        },
                             async content(event, trigger, player) {
                                await player.loseHp();
	                        	 trigger.cancel();
                    		if(trigger.source.countCards('he')) {
		                    	await player.discardPlayerCard(trigger.source,'he',true);
		                        }
                              },
                                },
                                },
                                },
                                  xinfan_miji: {
                                    audio: "oldmiji",
                       getValid(player) {
                            return game.getGlobalHistory('everything', evt => evt.player == player && ((evt.name == 'changeHp' && evt.num < 0) || evt.name == 'useCard' || evt.name == 'respond'))?.length;
                        },
        trigger: {
            global: 'phaseEnd',
        },
        frequent: true,
        filter(event, player) {
            return player.getDamagedHp() > 0 && lib.skill.xinfan_miji.getValid(player);
        },
        mod: {
            targetEnabled(card) {
                if (card.storage?.xinfan_miji) {
                    return false;
                }
            },
        },
        async content(event, trigger, player) {
            const num = player.getDamagedHp();
            await player.draw(num);
            const give = await player
                .chooseCardTarget({
                    prompt: `###${get.translation(event.name)}###你可以交给一名其他角色至多${num}张牌，然后其声明一张基本牌或普通锦囊牌的牌名，将这些牌视为该牌名使用`,
                    filterTarget: lib.filter.notMe,
                    filterCard: true,
                    position: 'she',
                    selectCard: [1, num],
                    ai1(card) {
                        return 6 - get.value(card);
                    },
                    ai2(target) {
                        return get.attitude(player, target);
                    },
                })
                .forResult();
            let target, cards;
            if (give.bool) {
                target = give.targets[0];
                cards = give.cards;
                await player.give(cards, target);
                const vcard = get.inpileVCardList(f => ['basic', 'trick', 'delay'].includes(f[0]));
                const result = await player
                    .chooseButton([`###${get.translation(event.name)}###是否声明牌名令${get.translation(target)}使用？`, [vcard, 'vcard']])
                    .set('target', target)
                    .set('ai', button => {
                        const card = { name: button.link[2], nature: button.link[3], storage: { xinfan_miji: true } };
                        const { player, target } = get.event();
                        return target.getUseValue(card, true, false) * get.attitude(player, target);
                    })
                    .forResult();
                if (result.bool) {
                    const card = new lib.element.VCard({ name: result.links[0][2], nature: result.links[0][3], storage: { xinfan_miji: true }, cards: cards });
                    const useCard = await target
                        .chooseBool(`###秘计###是否将获得的牌${get.translation(result.cards)}视为${get.translation(card)}使用？`)
                        .set('card', card)
                        .set('cards', result.cards)
                        .set('ai', () => {
                            const { player, card, cards } = get.event();
                            if (cards.length > 1) return false;
                            return player.getUseValue(card, true, false) > 0;
                        })
                        .forResult();
                    if (useCard.bool) {
                        await target.chooseUseTarget(true, { name: result.links[0][2], nature: result.links[0][3], storage: { xinfan_miji: true } }, cards);
                    }
                }
            }
        },
          },
                          //星孙坚
                          xinfan_yinghun: {
                          trigger: {
                                     player: "useCardAfter",
                          },
                        marktext: '摸',
                         intro: {
                                   content: 'mark',
                                   name: '摸',
                                 },
                        forced: true,
                        content: function () {
                                      player.addMark('xinfan_yinghun', 1);
                                },                                 
                          group: ['xinfan_yinghun_damage1', 'xinfan_yinghun_damage2'],
                            subSkill: {
                        damage1: {
                          trigger: {
                                      target: "useCardToTarget",
                          },
                           forced: true,
                                   marktext: '弃',
                               intro: {
                                   content: 'mark',
                                   name: '弃',
                                   },
                                  filter: function (event, player) {
					                 return event.player != player;
		                             		},
                            content: function () {
                                     player.addMark('xinfan_yinghun_damage1', 1);
                               },     
                                         },
                                damage2: {
                                    audio: "jsrgjuelie",
                                        trigger: {
                                          global: "phaseEnd"
                                                 },
                                                  forced: true,
                         filter: function (event, player) {
                            return player.storage.xinfan_yinghun > 0 || player.storage.xinfan_yinghun_damage1 > 0;
                        },
                          async content(event, trigger, player) {
                            const num1 = player.countMark('xinfan_yinghun');
							const num2 = player.countMark('xinfan_yinghun_damage1');
                            await player.clearMark('xinfan_yinghun');
                            await player.clearMark('xinfan_yinghun_damage1');
							if (num1 > 0 || num2 > 0) {
	                            const  result  = await player
                                            .chooseTarget(`###英魂###你可以令一名角色摸${num1}张牌并弃置${num2}张牌。`)
                                            .set('delta', num1 - num2)
                                            .set('ai', target => {
                                                const { player, delta } = get.event();
                                                return get.attitude(player, target) * delta;
                                            }).forResult();
								if (result.bool) {
                                    if (num1 > 0) {
									await result.targets[0].draw(num1);
                                    }
                                    if (num2 > 0) {
                                    await result.targets[0].chooseToDiscard(num2, true, "he");
                                    }
								}
                                         }

                                 },
                             },
                             },
                             },
                             //星夏侯氏
			  xinfan_degui: {
						audio: "qiaoshi",
        trigger: {
            player: 'gainAfter',
        },
        init(player) {
            player.addMark('xinfan_degui', 4, false);
        },
        mark: true,
        intro: {
            content: '库最大值：#',
        },
        group: ['xinfan_degui_add'],
        subSkill: {
            add: {
                enable: 'phaseUse',
                filter(event, player) {
                    return player.countMark('xinfan_degui') < 8 && player.countCards('he') > 1;
                },
                prompt: '弃置两张牌，令“库”最大数量加1？',
                audio: "qiaoshi",
                filterCard: true,
                position: 'he',
                selectCard: 2,
                check(card) {
                    return 4 - get.value(card);
                },
                content() {
                    player.addMark('xinfan_degui', 1, false);
                },
                ai: {
                    order: 9,
                    result: {
                        player(player) {
                            if (player.needsToDiscard()) {
                                return 1;
                            }
                            return 0;
                        },
                    },
                },
            },
        },
        filter(event, player) {
            return !event.xinfan_degui;
        },
        async cost(event, trigger, player) {
            const  result  = await player
                .chooseToMove(`得归：是否调整“库”与手牌？`)
                .set('list', [
                    ['手牌', player.getCards('h')],
                    ['库', player.getCards('s', card => card.hasGaintag('xinfan_degui_area'))],
                ])
                .set('filterMove', (from, to, moved) => {
                    const player = get.player();
                    if (typeof to == 'number') {
                        if (to == 1) return moved[1].length < player.countMark('xinfan_degui');
                        return true;
                    }
                    return typeof from != 'number' && typeof to != 'number';
                })
                .set('processAI', list => {
                    const player = get.player();
                    const cards = list[0][1].concat(list[1][1]).sort((a, b) => get.value(b, player) - get.value(a, player));
                    const max = player.countMark('xinfan_degui');
                    const newSpecial = cards.slice(0, max);
                    const gains = cards.filter(card => !newSpecial.includes(card));
                    return [gains, newSpecial];
                }).forResult();

            const hs = player.getCards('h');
            const ss = player.getCards('s', card => card.hasGaintag('xinfan_degui_area'));
            const newhs = result.moved[0];
            const newss = result.moved[1];
            const gains = newhs.filter(card => !hs.includes(card));
            const expansions = newss.filter(card => !ss.includes(card));

            event.result = {
                bool: gains.length > 0 || expansions.length > 0,
                cost_data: [gains, expansions],
            };
        },
        async content(event, trigger, player) {
            if (event.cost_data[0].length) {
                await player.gain(event.cost_data[0], 'fromStorage').set('xinfan_degui', true);
            }
            if (event.cost_data[1].length) {
                await player.loseToSpecial(event.cost_data[1], 'xinfan_degui_area');
            }
        },
    },
    xinfan_qiaoshi: {
        trigger: {
            global: 'phaseUseBegin',
        },
                audio: "sbqiaoshi",
        check(event, player) {
            return player.hp > 1 || player.countCards('she', 'shan') > 0 || get.attitude(_status.currentPhase, player) > 0;
        },
    async content(event, trigger, player) {
            const cards = get.cards(3, true);
            const maps = {};
            for (const card of cards) {
                const type = get.type2(card);
                if (!maps[type]) {
                    maps[type] = [];
                }
                maps[type].push(card);
            }
            const maxType = Object.keys(maps).sort((a, b) => maps[b].length - maps[a].length)[0];
            const  result  = await player
                .chooseButton(['###樵拾###请选择一类牌获得', cards, [[...new Set(cards.map(card => get.type2(card)))].map(type => [type, `<span style="display: block; text-align: center;">获得所有${get.translation(type)}牌</span>`]), 'textbutton']])
                .set('maxType', maxType)
                .set('cards', cards)
                .set('ai', button => button.link == get.event().maxType)
                .set('filterButton', button => {
                    if (get.event().cards.includes(button.link)) {
                        return false;
                    }
                    return true;
                }).forResult();
            const cards2 = maps[result.links[0]];
            if (cards2.length) {
                await player.gain(cards2, 'gain2');
            }
            if (_status.currentPhase != player) {
                const next = await _status.currentPhase
                    .chooseBool(`###樵拾###是否视为对${get.translation(player)}使用一张无距离限制的【杀】？`)
                    .set('goon', get.effect(player, { name: 'sha' }, _status.currentPhase, _status.currentPhase) > 0)
                    .set('ai', () => _status.event.goon)
                    .forResult();
                if (next.bool) {
                    await _status.currentPhase.useCard({ name: 'sha' }, player, false);
                }
            }
        },
    },

                    //星卧龙凤雏
    xinfan_longpo: {
        marktext: '魄',
        intro: {
            content: 'mark',
            name: '魄',
        },
        filterTarget: true,
        audio: "youlong",
        enable: 'phaseUse',
        usable: 1,
        group: ['xinfan_longpo_start'],
        global: ['xinfan_longpo_effect'],
        filter(event, player) {
            return player.storage.xinfan_wolongfengchu == true;
        },
        subSkill: {
            start: {
                audio: "youlong",
                trigger: {
                                    global: 'phaseBefore',
                                    player: 'enterGame',
                                },
                                filter(event, player) {
                                    return player.storage.xinfan_wolongfengchu == true && game.phaseNumber == 0;
                                },
                lastDo: true,
                forced: true,
                content() {
                    player.addMark('xinfan_longpo', 1);
                },
            },
            effect: {
                trigger: {
                    target: 'useCardToTargeted',
                },
                filter(event, player) {
                    return player.countMark('xinfan_longpo') > 0 && event.player != player && game.hasPlayer(i => i.storage.xinfan_wolongfengchu == true);
                },
                check(event, player) {
                    return get.effect(player, event.card, event.player, player) < 0;
                },
                content() {
                    player.logSkill("xinfan_longpo");
                    player.removeMark('xinfan_longpo', 1);
                    player.recover();
                    trigger.getParent().excluded.add(player);
                },
            },
        },
        prompt: '令一名角色获得一枚“魄”标记和1点护甲',
        content() {
            if (target.countMark('xinfan_longpo') == 0) {
                target.addMark('xinfan_longpo', 1);
            } else {
                target.recover();
            }
            target.changeHujia(1);
        },
        ai: {
            order: 20,
            result: {
                target: 20,
            },
        },
    },
    xinfan_fengming: {
        enable: 'phaseUse',
        audio: "luanfeng",
        usable: 1,
        filter(event, player) {
            return player.storage.xinfan_wolongfengchu == false;
        },
        filterTarget: true,
        contentBefore() {
            player.loseHp();
        },
        content() {
            target.damage(player.hp, 'fire');
        },
        ai: {
            order: 8,
            result: {
                target(player, target) {
                    return -target.hp;
                },
                player: -1,
            },
        },
    },
    xinfan_huizhuan: {
        init(player) {
            player.storage.xinfan_wolongfengchu = true;
            player.storage.xinfan_huizhuan = 0;
        },
        audio: "luanfeng",
        enable: 'phaseUse',
        usable: 1,
        intro: {
            content(_, player) {
                return player.storage.xinfan_wolongfengchu ? '卧龙' : '凤雏';
            },
        },
        filterCard: true,
        position: 'she',
        filter(event, player) {
            return player.countCards('she') > player.storage.xinfan_huizhuan;
        },
        selectCard() {
            return get.player().storage.xinfan_huizhuan;
        },
        ai: {
            order: 9,
            result: {
                player(player) {
                    return player.getDamagedHp() > 1;
                },
            },
        },
        async content(event, trigger, player) {
            player.storage.xinfan_huizhuan++;
            player.storage.xinfan_wolongfengchu = !player.storage.xinfan_wolongfengchu;
            // 更换立绘，引用本体武将图片，不需要直接删掉
             game.broadcastAll(function (player) {
            if (player.storage.xinfan_wolongfengchu) {
                if (player.name1 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar.setBackground('gz_sp_zhugeliang', 'character');
                }
                if (player.name2 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar2.setBackground('gz_sp_zhugeliang', 'character');
                }
            } else {
                if (player.name1 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar.setBackground('sb_pangtong', 'character');
                }
                if (player.name2 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar2.setBackground('sb_pangtong', 'character');
                }
                
            }
            }, player);
            const num = player.getDamagedHp();
            if (player.hp > num) {
                await player.draw(player.hp - num);
                await player.loseHp(player.hp - num);
            }
            if (player.hp < num) {
                await player.recover(num - player.hp);
            }
        },
        mark: true,
        group: ['xinfan_huizhuan_switch'],
        subSkill: {
            switch: {
                audio: "youlong",
                trigger: {
                    global: 'phaseBefore',
                    player: 'enterGame',
                },
                filter(event, player) {
                    return event.name != 'phase' || game.phaseNumber == 0;
                },
                prompt2(event, player) {
                    return '切换【回转】为状态' + (player.storage.xinfan_wolongfengchu ? '凤雏' : '卧龙');
                },
                check: () => Math.random() > 0.5,
                content() {
                    player.storage.xinfan_wolongfengchu = !player.storage.xinfan_wolongfengchu;
                                game.broadcastAll(function (player) {
            if (player.storage.xinfan_wolongfengchu) {
                if (player.name1 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar.setBackground('gz_sp_zhugeliang', 'character');
                }
                if (player.name2 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar2.setBackground('gz_sp_zhugeliang', 'character');
                }
            } else {
                if (player.name1 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar.setBackground('sb_pangtong', 'character');
                }
                if (player.name2 == 'xinfan_xingwolongfengchu') {
                    player.smoothAvatar(false);
                    player.node.avatar2.setBackground('sb_pangtong', 'character');
                }
                
            }
            }, player);
                },
            },
        },
    },
 
                                          //星周仓
						                  xinfan_zhongyong: {
                                            audio: "mobilezhongyong",
 trigger: {
    player: "changeHujiaEnd"
  },
  forced: true,
  filter: function (event, player) {
                            return event.num && event.num < 0 && !player.hujia;
                        },
  content: function () {
                         'step 0'
                            player.loseMaxHp();
                            player.chooseTarget(get.prompt('xinfan_zhongyong'), function (card, player, target) {
                                return true;
                            }).set('ai', function (target) {
                                return get.attitude(player, target);
                            });
                            'step 1'
                            if (result.bool) {
                                result.targets[0].draw(2);
                                player.changeHujia(2);
                            }
                        },
},
       xinfan_xiezhan: {
            audio: "zhongyong",
        trigger: {
            global: 'useCard',
        },
        filter(event, player) {
            return event.card.name == 'sha' && player.countCards('she');
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseToDiscard(`###${get.translation(event.skill)}###是否弃置一张牌，令${get.translation(trigger.player)}选择一项：1.此杀不计入次数限制。2.此杀不可被响应。背水：令你受到一点伤害。`, 'she', 1)
                .set(
                    'bool',
                    trigger.targets.reduce((p, c) => {
                        return p + get.effect(c, trigger.card, trigger.player, player);
                    }, 0) > 0 && get.attitude(player, trigger.player) > 0
                )
                .set('ai', card => {
                    return _status.event.bool ? 7.5 - get.value(card) : 0;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const  result  = await trigger.player
                .chooseControl(['选项一', '选项二', '选项三'])
                .set('choiceList', ['此杀不计入次数限制', '此杀不可被响应', `背水：令${get.translation(player)}受到一点伤害`])
                .set('prompt', `${get.translation(event.skill)}：请选择一项执行`)
                .set('source', player)
                .set('ai', () => {
                    const { player, source } = get.event();
                    if (get.attitude(player, source) <= 0) {
                        return '选项三';
                    }
                    let bool1 = player.countCards('she', { name: 'sha' }) > 0;
                    let bool2 = source.hp > 1;
                    if (bool1 && bool2) {
                        return '选项三';
                    } else if (bool1) {
                        return ['选项一', '选项二', '选项二', '选项二'].randomGet();
                    }
                    return '选项二';
                }).forResult();
            if (result.control == '选项三') {
                await player.damage(trigger.player, 1);
            }
            if (['选项一', '选项三'].includes(result.control)) {
                trigger.player.getStat().card.sha--;
            }
            if (['选项二', '选项三'].includes(result.control)) {
                trigger.directHit.addArray(trigger.targets);
            }
        },
    },

                    //星司马昭
                     xinfan_daigong: {
                        audio: "jsrgqiantun",
        trigger: {
            global: 'phaseBefore',
            player: 'enterGame',
        },
        filter(event, player) {
            return event.name != 'phase' || game.phaseNumber == 0;
        },
        forced: true,
        content() {
            player.addMark('xinfan_daigong', 2);
        },
        intro: {
            content: 'mark',
        },
        group: ['xinfan_daigong_damage1', 'xinfan_daigong_damage2'],
        subSkill: {
            damage1: {
                 audio: "jsrgqiantun",
                trigger: {
                    player: 'damageBegin1',
                },
                filter(event, player) {
                    return player.countMark('xinfan_daigong') > 0;
                },
                forced: true,
                content() {
                    player.removeMark('xinfan_daigong', 1);
                    trigger.cancel();
                },
            },
            damage2: {
                audio: "jsrgzhaoxiong",
                 trigger: {
                    source: 'damageBegin1',
                },
                usable: 1,
                forced: true,
                content() {
                    const num = trigger.num + 1 - player.countMark('xinfan_daigong');
                    if (num > 0) {
                        trigger.num = num;
                    } else {
                        trigger.cancel();
                    }
                },
            },
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) {
                            return [1, -2];
                        }
                        if (!target.hasFriend()) {
                            return;
                        }
                        return 'zeroplayertarget';
                    }
                },
            },
        },
    },
    xinfan_qiantun: {
        audio: "jsrgweisi",
        usable: 1,
  trigger: {
            player: 'useCardAfter',
        },
    async cost(event, trigger, player) {
                            const str = `###谦吞###是否重铸两张牌（每回合每种类别1次），并依据其包含类别执行以下效果。基本牌：视为使用一张无次数限制的[杀]。锦囊牌：摸1张牌。装备牌：弃置其他角色一张牌。`;
                            event.result = await player
                                .chooseCard(str, 2, 'she')
                                .set('complexCard', true)
                                .set('ai', card => 10 - get.value(card))
                                .forResult();
                        },
                        async content(event, trigger, player) {
                            const types = event.cards.map(card => get.type2(card));
                            await player.recast(event.cards);
                            player.addTempSkill('xinfan_qiantun_used');
                                if (types.includes('equip') && !player.getStorage('xinfan_qiantun_used').includes('equip')) {
                                player.markAuto('xinfan_qiantun_used', 'equip');
                                const  result  = await player
                                    .chooseTarget(`###谦吞###是否弃置其他角色一张牌？`, (card, player, target) => {
                                        return target != player && target.countCards('hej');
                                    })
                                    .set('ai', target => {
                                        const player = get.player();
                                        return get.effect(target, { name: 'guohe_copy' }, player, player);
                                    }).forResult();
                                if (result.bool) {
                                    await player.discardPlayerCard(result.targets[0], 'hej', true);
                                }
                            }
                            if (types.includes('trick') && !player.getStorage('xinfan_qiantun_used').includes('trick')) {
                                player.markAuto('xinfan_qiantun_used', 'trick');
                                await player.draw(1);
                            }
                            if (types.includes('basic') && !player.getStorage('xinfan_qiantun_used').includes('basic')) {
                                player.markAuto('xinfan_qiantun_used', 'basic');
                                await player.chooseUseTarget({ name: 'sha' }, false, 'nodistance');
                            }                            
                        },
                                   subSkill: {
            used: {
                onremove: true,
                charlotte: true,
                intro: {
                    content: '已使用过牌类：$',
                },
            },
        },
    },

                    //星费祎
 				    xinfan_huyuan: {
 				    audio: "yanru",
        trigger: {
            global: 'damageEnd',
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseBool(`###互援###是否和${get.translation(trigger.player)}各摸一张牌？`)
                .set('ai', () => {
                    const trigger = _status.event.getTrigger();
                    return get.attitude(_status.event.player, trigger.player) > 0;
                })
                .forResult();
        },
        filter(event, player) {
            return event.player.isAlive();
        },
        async content(event, trigger, player) {
            if (trigger.player == player) {
                await player.draw(2);
            } else {
                await game.asyncDraw([player, trigger.player], 1);
                if (!player.countCards('she')) return;
                await player.chooseToGive(trigger.player, `###互援###请交给${get.translation(trigger.player)}一张牌`, true);
            }
        },
        group: ['xinfan_huyuan_noh'],
        subSkill: {
            noh: {
                trigger: {
                    player: 'loseAfter',
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                filter(event, player) {
                    if (player.countCards('h')) {
                        return false;
                    }
                    const evt = event.getl(player);
                    return evt && evt.player == player && evt.hs && evt.hs.length > 0;
                },
                logTarget(event, player) {
                    return game.filterPlayer(i => i != player && i.countCards('she'));
                },
                async cost(event, trigger, player) {
                    event.result = {
                        bool: true,
                    };
                },
                async content(event, trigger, player) {
                    const targets = game.filterPlayer(i => i != player && i.countCards('she'));
                    const giver = [];
                    for (const target of targets) {
                        const  result  = await target
                            .chooseToGive(player, `###互援###是否交给${get.translation(player)}一张牌？`)
                            .set('target', player)
                            .set('ai', card => {
                                const { player, target } = get.event();
                                const att = get.attitude(target, player);
                                if (att < 0) {
                                    return -get.value(card);
                                }
                                return 7 - get.value(card);
                            }).forResult();
                        if (result.bool) {
                            giver.push(target);
                        }
                    }
                    if (giver.length) {
                        await game.asyncDraw(giver, 1);
                    }
                },
            },
        },
    },
    xinfan_zhige: {
        audio: "hezhong",
        trigger: {
            player: 'phaseJieshuBegin',
        },

        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget([1,], `###止戈###你可以选择一名其他角色，你令其回复1点体力或摸2张牌，然后你执行另一项。直到你的下个回合开始前，你们相互间每回合内首次造成的伤害减1。`,lib.filter.notMe)
                .set('complexSelect', true)
                .set('ai', target => {
                    const { player } = get.event();
                    const att = get.attitude(player, target);
                    if (att < 0) {
                        if (player.hp <= 2 && !player.getFriends().length && !ui.selected.targets.length) {
                            return 1;
                        }
                    }
                    return 1 / target.hp;
                })
                .forResult();
                              for (const target of game.filterPlayer()) {
                    if (target.hasSkill('xinfan_zhige_mark')) {
                        target.removeSkill('xinfan_zhige_mark');
                    }
                }
        },
        async content(event,trigger, player) {
            const targets = [ ...(event.targets || [])];
            for (const target of targets) {
                  var result = await target
        .chooseControl("选项一","选项二")
          .set('choiceList',["摸两张牌","回复一点体力"])
          .forResult();
      if(result.control=="选项一"){
                target.draw(2);
                player.recover();
                target.addSkill('xinfan_zhige_mark');
                player.addSkill('xinfan_zhige_mark');
      }
      if(result.control=="选项二"){
                target.recover();
                player.draw(2);
                target.addSkill('xinfan_zhige_mark');
                player.addSkill('xinfan_zhige_mark');
      }   
            }
                },
        group: ['xinfan_zhige_damage'],
        subSkill: {
            mark: {
                mark: true,
                intro: {
                    content: '止戈角色相互间造成的伤害-1',
                },
                charlotte: true,
            },
            damage: {
                audio: "hezhong",
                usable: 1,
                forced: true,
                trigger: {
                    global: 'damageBegin4',
                },
                charlotte: true,
                filter(event, player) {
                    return event.source.hasSkill('xinfan_zhige_mark') && event.player.hasSkill('xinfan_zhige_mark') && event.num > 0;
                },
                content() {
                    trigger.num--;
                },
            },
        },
    },
         //星钟会
    xinfan_quanji: {
        audio: "requanji",
        priority:1,
        trigger: {
            player: 'damageBegin',
            source: 'damageBegin',
        },
        async cost(event, trigger, player) {
            let str = trigger.source == player ? `###权计###是否防止此伤害并摸一张牌？` : `###权计###是否摸一张牌？`;
            event.result = await player
                .chooseBool(str)
                .set('ai', () => {
                    const trigger = _status.event.getTrigger();
                    const player = get.player();
                    if (trigger.source == player) return get.attitude(player, trigger.player) > 0;
                    return true;
                })
                .forResult();
        },
        content() {
            if (trigger.source == player) {
                trigger.cancel();
                player.draw();
            } else {
                player.draw();
            }
        },
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        group: ['xinfan_quanji_draw'],
        global: ['xinfan_quanji_mod'],
        subSkill: {
            mod: {
                charlotte: true,
                mod: {
                    maxHandcard(player, num) {
                        return num + player.countExpansions('xinfan_quanji');
                    },
                },
            },
            draw: {
                audio: "requanji",
                trigger: {
                    player: 'drawAfter',
                },
                async cost(event, trigger, player) {
                    event.result = await player
                        .chooseCardTarget({
                            position: 'hes',
                            filterCard: true,
                            filterTarget: lib.filter.all,
                            selectCard: 1,
                            prompt: '###权计###是否将一张牌置于一名角色武将牌上称“权”，其手牌上限加x（x为其武将牌上"权"数量）？',
                            ai1: card => {
                                return 7 - get.value(card);
                            },
                            ai2: target => {
                                const player = _status.event.player;
                                const att = get.attitude(player, target);
                                if (att <= 0) {
                                    if (player.countExpansions('xinfan_quanji') >= player.maxHp * 2 && !target.countExpansions('xinfan_quanji')) {
                                        return 5;
                                    }
                                    return 0;
                                }
                                return Math.random() + (target == player ? Math.random() : 0) * 2;
                            },
                        })
                        .forResult();
                },
                async content(event, trigger, player) {
                    const cards = event.cards;
                    const target = event.targets[0];
                    target.addToExpansion('giveAuto', cards).gaintag.add('xinfan_quanji');
                },
            },
        },
    },
            xinfan_zili: {
                    audio: 'zili',
                        trigger: {
                            player: 'xinfan_quanji_drawAfter',
                        },
                        filter(event, player) {
                            let num = game.filterPlayer().reduce((sum, cur) => sum + cur.countExpansions('xinfan_quanji'), 0);
                            return num >= player.maxHp;
                        },
                        skillAnimation: true,
                        juexingji: true,
                        forced: true,
                        async content(event, trigger, player) {
                            player.awakenSkill('xinfan_zili');
                            await player.recover();
                            await player.draw(2);
                            player.addSkill('xinfan_paiyi');
                        },
                        derivation: ['xinfan_paiyi'],
                    },
    xinfan_paiyi: {
        audio: "gzpaiyi",
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            return player.countExpansions('xinfan_quanji') > 0;
        },
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog('排异', player.getExpansions('xinfan_quanji'), 'hidden');
            },
            filter(button, player) {
                return true;
            },
            check(button) {
                return 2;
            },
            backup(links, player) {
                return {
                    audio: 'paiyi',
                    audioname: ['re_zhonghui'],
                    filterTarget: true,
                    filterCard() {
                        return false;
                    },
                    selectCard: -1,
                    card: links[0],
                    delay: false,
                    async content(event, trigger, player) {
                        const card = lib.skill.xinfan_paiyi_backup.card;
                        const target = event.targets[0];
                        await player.loseToDiscardpile(card);
                        await target.draw(2);
                        await target.damage(1, player);
                    },
                    ai: {
                        order: 10,
                        result: {
                            target(player, target) {
                                const att = get.attitude(player, target);
                                if (att < 0 && target.hp == 1) {
                                    return -1;
                                }
                                if (player == target && player.hp > 1) {
                                    return 0.9;
                                }
                                if (att > 0 && target.hp > 4) {
                                    return 0.8 + target.hp / 20;
                                }
                                return 0;
                            },
                        },
                    },
                };
            },
            prompt() {
                return '请选择一名角色，令其摸两张牌并对其造成一点伤害';
            },
        },
        ai: {
            order: 200,
            result: {
                player: 6,
            },
        },
        group: ['xinfan_paiyi_damage'],
        subSkill: {
            damage: {
                audio: "gzpaiyi",
                priority:3,
                trigger: {
                    global: 'damageBegin',
                },
                filter(event) {
                    debugger;
                    return event.player.countExpansions('xinfan_quanji') > 0 && event.parent.name != 'xinfan_paiyi_damage';
                },
                async cost(event, trigger, player) {
                    const  result  = await player
                        .chooseCardButton(trigger.player.getExpansions('xinfan_quanji'), `###排异###对${get.translation(trigger.player)}造成一点伤害，然后其获得其武将牌上的一张“权”`)
                        .set('target', trigger.player)
                        .set('ai', button => {
                            const { player, target } = get.event();
                            if (get.damageEffect(target, player, player) > 0) return get.buttonValue(button, player);
                            return 0;
                        }).forResult();
                    event.result = {
                        bool: result.bool,
                        cost_data: {
                            links: result.links,
                        },
                    };
                },
                async content(event, trigger, player) {
                    await trigger.player.gain(event.cost_data.links, 'fromStorage');
                    await trigger.player.damage(player, 1);
                },
            },
        },
    },
          //星孙鲁班
    xinfan_fugu: {
    audio: "rejiaojin",
        forced: true,
        trigger: {
            global: 'roundStart',
        },
        filter(event, player) {
            return game.filterPlayer(i => i != player).length;
        },
        async content(event, trigger, player) {
            player.unmarkAuto('xinfan_fugu', player.getStorage('xinfan_fugu'));
            const  result  = await player.chooseTarget('###跗骨###请选择一名其他角色，其摸牌/于弃牌阶段弃置牌时，你摸/弃置等量牌。', true, lib.filter.notMe).set('ai', () => {
                return Math.random();
            }).forResult();
            if (result.bool) {
                player.markAuto('xinfan_fugu', result.targets);
            }
        },
        intro: {
            content: 'players',
        },
        group: ['xinfan_fugu_effect'],
        subSkill: {
            effect: {
                audio: "rejiaojin",
                trigger: {
                    global: ['drawBegin', 'phaseDiscardAfter'],
                },
                filter(event, player) {
                    if (event.name != 'draw' && (!player.countCards('he') || !event.cards?.length)) {
                        return false;
                    }
                    return player.getStorage('xinfan_fugu').includes(event.player);
                },
                forced: true,
                content() {
                    if (trigger.name == 'draw') {
                        player.draw(trigger.num);
                    } else {
                        player.chooseToDiscard(trigger.cards?.length || trigger.num, 'he', true);
                    }
                },
            },
        },
    },
    xinfan_gongfu: {
       audio: "xinzenhui",
        trigger: {
            global: 'useCardToPlayer',
        },
        getTargets(event) {
            return game.filterPlayer(p => {
                return !event.targets.includes(p) && lib.filter.targetEnabled2(event.card, event.player, p);
            });
        },
        filter(event, player) {
            if (!['basic', 'trick'].includes(get.type(event.card)) || event.targets.length != 1) {
                return false;
            }
            if (!event.targets.includes(player) && event.player != player) {
                return false;
            }
            return lib.skill.xinfan_gongfu.getTargets(event, player).length > 0;
        },
        async cost(event, trigger, player) {
            const targets = lib.skill.xinfan_gongfu.getTargets(trigger);
            event.result = await player
                .chooseTarget(`###共赴###是否为此牌（${get.translation(trigger.card)}）选择额外的目标？`, (card, player, target) => get.event().targets.includes(target))
                .set('targets', targets)
                .set('ai', target => {
                    const trigger = _status.event.getTrigger();
                    return get.effect(target, trigger.card, trigger.player, player);
                })
                .forResult();
        },
        async content(event, trigger) {
            trigger.targets.addArray(event.targets);
            trigger.getParent().targets.addArray(event.targets);
        },
    },

                   //星于吉
                        xinfan_guanshi: {
                            audio: "potfuji",
        trigger: {
            global: 'roundStart',
        },
        forced: true,
        filter: () => game.roundNumber == 1,
        content() {
            game.filterPlayer(i => i != player).forEach(i => {
                i.addSkill('xinfan_miaofa');
            });
            player.addTempSkill('diaohulishan', 'roundEnd');
        },
        derivation: ['xinfan_miaofa'],
    },
    xinfan_rushi: {
        audio: "potdaozhuan",
        trigger: {
            global: 'roundStart',
        },
        filter: () => game.roundNumber > 1,
        forced: true,
        juexingji: true,
        unique: true,
        skillAnimation: true,
        animationColor: 'thunder',
        content() {
            player.awakenSkill('xinfan_rushi');
            if (player.countMark('xinfan_miaofa_xv') > player.countMark('xinfan_miaofa_shi')) {
                player.addSkill('xinfan_huanmeng');
            } else {
                player.addSkill('xinfan_fushi');
            }
            game.filterPlayer(i => i != player, null, true).forEach(i => {
                i.removeSkill('xinfan_miaofa');
            });
        },
        derivation: ['xinfan_huanmeng', 'xinfan_fushi'],
    },
    xinfan_miaofa: {
        audio: "potfuji",
        enable: ['chooseToUse'],
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name) || !player.countCards('she')) return false;
            const type = get.type(name);
            if (type == 'equip') return false;
            return true;
        },
        mod: {
            targetEnabled(card, player, target) {
                if (card.storage?.xinfan_miaofa == true && player != target) return false;
            },
            playerEnabled(card, player, target) {
                if (card.storage?.xinfan_miaofa == true && player != target) return false;
            },
            cardSavable(card, player, target) {
                if (card.storage?.xinfan_miaofa == true && player != target) return false;
            },
        },
        usable: 1,
        filter(event, player) {
            if (!player.countCards('she')) return false;
            for (const name of lib.inpile) {
                const type = get.type(name);
                if (type != 'equip') {
                    if (event.filterCard(get.autoViewAs({ name: name, storage: { xinfan_miaofa: true } }, 'unsure'), player, event)) return true;
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j, storage: { xinfan_miaofa: true } }, 'unsure'), player, event)) return true;
                        }
                    }
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                player.logSkill("xinfan_miaofa");
                const list = [];
                for (const name of lib.inpile) {
                    const type = get.type(name);
                    if (type == 'equip') continue;
                    if (event.filterCard(get.autoViewAs({ name: name, storage: { xinfan_miaofa: true } }, 'unsure'), player, event)) list.push([type, '', name]);
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j, storage: { xinfan_miaofa: true } }, 'unsure'), player, event)) list.push(['basic', '', 'sha', j]);
                        }
                    }
                }
                return ui.create.dialog('妙法', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2], storage: { xinfan_miaofa: true } }, player, _status.event.getParent());
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                const player = _status.event.player;
                if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
                return player.getUseValue({ name: button.link[2], nature: button.link[3] });
            },
            backup(links) {
                return {
                    filterCard: true,
                    check(card) {
                        return 8 - get.value(card);
                    },
                    position: 'hes',
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        storage: {
                            xinfan_miaofa: true,
                        },
                    },
                };
            },
        },
        ai: {
            order: 12,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
        group: ['xinfan_miaofa_source'],
        subSkill: {
            source: {
                trigger: {
                    player: 'phaseEnd',
                },
                silent: true,
                content() {
                    const sources = game.filterPlayer(i => i.hasSkill('xinfan_guanshi'), null, true);
                    if (
                        game.hasPlayer(i => {
                            const histories = i.getHistory('useCard', evt => get.is.convertedCard(evt.card) || get.is.virtualCard(evt.card));
                            return histories.length > 0;
                        })
                    ) {
                        sources.forEach(i => {
                            i.addMark('xinfan_miaofa_xv', 1);
                        });
                    } else {
                        sources.forEach(i => {
                            i.addMark('xinfan_miaofa_shi', 1);
                        });
                    }
                },
            },
            xv: {
                marktext: '虚',
                intro: {
                    content: 'mark',
                },
            },
            shi: {
                marktext: '实',
                intro: {
                    content: 'mark',
                },
            },
        },
    },
    xinfan_huanmeng: {
        audio: "potfuji",
        enable: ['chooseToUse'],
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name)) return false;
            const type = get.type(name);
            if (type == 'equip') return false;
            return true;
        },
        mod: {
            targetEnabled(card, player, target) {
                if (card.storage?.xinfan_huanmeng == true && player != target) return false;
            },
            playerEnabled(card, player, target) {
                if (card.storage?.xinfan_huanmeng == true && player != target) return false;
            },
            cardSavable(card, player, target) {
                if (card.storage?.xinfan_huanmeng == true && player != target) return false;
            },
        },
        usable: 3,
        filter(event, player) {
            for (const name of lib.inpile) {
                const type = get.type(name);
                if (type != 'equip') {
                    if (event.filterCard(get.autoViewAs({ name: name, storage: { xinfan_huanmeng: true } }, 'unsure'), player, event)) return true;
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j, storage: { xinfan_huanmeng: true } }, 'unsure'), player, event)) return true;
                        }
                    }
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                player.logSkill("xinfan_huanmeng");
                const list = [];
                for (const name of lib.inpile) {
                    const type = get.type(name);
                    if (type == 'equip') continue;
                    if (event.filterCard(get.autoViewAs({ name: name, storage: { xinfan_huanmeng: true } }, 'unsure'), player, event)) list.push([type, '', name]);
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j, storage: { xinfan_huanmeng: true } }, 'unsure'), player, event)) list.push(['basic', '', 'sha', j]);
                        }
                    }
                }
                return ui.create.dialog('幻梦', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2], storage: { xinfan_huanmeng: true } }, player, _status.event.getParent());
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                const player = _status.event.player;
                if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
                return player.getUseValue({ name: button.link[2], nature: button.link[3] });
            },
            backup(links) {
                return {
                    filterCard: true,
                    selectCard: 0,
                    position: 'hes',
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        storage: {
                            xinfan_huanmeng: true,
                        },
                    },
                };
            },
        },
        ai: {
            order: 12,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
        group: ['xinfan_huanmeng_use'],
        subSkill: {
            use: {
                trigger: {
                    target: 'useCardToTargeted',
                },
                async cost(event) {
                    event.result = {
                        bool: true,
                    };
                },
                filter(event, player) {
                    if (event.player == player) return false;
                    return get.is.convertedCard(event.card) || get.is.virtualCard(event.card);
                },
                content() {
                    player.logSkill("xinfan_huanmeng");
                    trigger.getParent().excluded.add(player);
                },
            },
        },
    },
      xinfan_fushi: {
                        audio: 'potdaozhuan',
                        trigger: {
                            target: 'useCardToTargeted',
                        },
                        filter(event, player) {
                            return event.player != player;
                        },
                        async cost(event, trigger, player) {
                            event.result = await player
                                .chooseToDiscard(`###浮世###是否弃置一张同名牌，令此牌（${get.translation(trigger.card)}）对你无效`, 'she', card => card.name == _status.event.card.name)
                                .set('card', trigger.card)
                                .set('source', trigger.player)
                                .set('ai', card => {
                                    const { player, card: card2, source } = get.event();
                                    if (get.effect(player, card2, source, player) < 0) {
                                        return 8 - get.value(card);
                                    }
                                    return 0;
                                })
                                .forResult();
                        },
                        content() {
                            trigger.getParent().excluded.add(player);
                        },
                        group: ['xinfan_fushi_use'],
                        subSkill: {
                            use: {
                                audio: 'potdaozhuan',
                                trigger: {
                                    global: 'useCard',
                                },
                                filter(event, player) {
                                    return event.player != player && get.type(event.card) != 'equip';
                                },
                                forced: true,
                                usable: 3,
                                content() {
                                    player.draw();
                                },
                            },
                        },
                    },
 
                         //星童渊
                      xinfan_bailian: {
                         audio: "chuanshu", 
        trigger: {
            global: 'phaseBefore',
            player: 'enterGame',
        },
        filter(event, player) {
            return event.name != 'phase' || game.phaseNumber == 0;
        },
        async cost(event) {
            event.result = { bool: true };
        },
        content() {
            player.addSkills(['xinfan_jingshui', 'xinfan_liuzhuan', 'xinfan_benliu']);
            player.addMark('xinfan_jingshui', 1);
            player.addMark('xinfan_liuzhuan', 1);
            player.addMark('xinfan_benliu', 1);
        },
        derivation: ['xinfan_jingshui', 'xinfan_liuzhuan', 'xinfan_benliu'],
        group: 'xinfan_bailian_phase',
        subSkill: {
            phase: {
                audio: "chuanshu", 
                trigger: {
                    player: 'phaseZhunbeiBegin',
                },
                async cost(event, trigger, player) {
                    event.result = await player
                        .chooseTarget('百炼：是否令一名角色获得一枚任意标记？')
                        .set('ai', target => {
                            const player = get.player();
                            return get.attitude(player, target) > 0 ? Math.random() + (target == player ? 0.1 : 0) : 0;
                        })
                        .forResult();
                },
                async content(event, trigger, player) {
                    const target = event.targets[0];
                    const  result  = await target
                        .chooseControl('xinfan_jingshui', 'xinfan_liuzhuan', 'xinfan_benliu')
                        .set('prompt', '请选择获得的标记类型')
                        .set('ai', () => {
                            return _status.event.controls.randomGet();
                        }).forResult();
                    if (result.control) {
                        target.addMark(result.control);
                        if (!target.hasSkill(result.control)) {
                            target.addSkill(result.control);
                        }
                    }
                },
            },
        },
    },
    xinfan_jingshui: {
        audio: "reyajiao", 
        forced: true,
        usable(_, player) {
            return player.countMark('xinfan_jingshui');
        },
        intro: {
            content: 'mark',
        },
        trigger: {
            target: 'useCardToBefore',
        },
        filter(event, player) {
            return event.player != player;
        },
        content() {
            player.draw();
        },
    },
    xinfan_liuzhuan: { 
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name)) return false;
            const type = get.type2(name);
            if (!['basic', 'trick'].includes(type)) return false;
            const hasBasic = player.getCards('sh', c => get.type(c) == 'basic').length > 0;
            const hasTrick = player.getCards('sh', c => get.type2(c) == 'trick').length > 0;
            return type == 'basic' ? hasBasic : hasTrick;
        },
        enable: ['chooseToUse', 'chooseToRespond'],
        usable(_, player) {
            return player.countMark('xinfan_liuzhuan');
        },
        intro: {
            content: 'mark',
        },
        filter(event, player) {
            const hasBasic = player.getCards('sh', c => get.type(c) == 'basic').length > 0;
            const hasTrick = player.getCards('sh', c => get.type2(c) == 'trick').length > 0;

            for (const name of lib.inpile) {
                const type = get.type2(name);
                if (type == 'basic' && hasBasic) {
                    if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) return true;
                    if (name == 'sha') {
                        for (const j of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name: name, nature: j }, 'unsure'), player, event)) return true;
                        }
                    }
                }
                if (type == 'trick' && hasTrick) {
                    if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) return true;
                }
            }
            return false;
        },
        chooseButton: {
        
            dialog(event, player) {
                player.logSkill("longdan_tongyuan");
                const list = [];
                const hasBasic = player.getCards('sh', c => get.type(c) == 'basic').length > 0;
                const hasTrick = player.getCards('sh', c => get.type2(c) == 'trick').length > 0;

                for (const name of lib.inpile) {
                    const type = get.type2(name);
                    if (type == 'basic' && hasBasic) {
                        if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) {
                            list.push(['basic', '', name]);
                        }
                        if (name == 'sha') {
                            for (const j of lib.inpile_nature) {
                                if (event.filterCard(get.autoViewAs({ name: name, nature: j }, 'unsure'), player, event)) {
                                    list.push(['basic', '', name, j]);
                                }
                            }
                        }
                    }
                    if (type == 'trick' && hasTrick) {
                        if (event.filterCard(get.autoViewAs({ name: name }, 'unsure'), player, event)) {
                            list.push(['trick', '', name]);
                        }
                    }
                }
                return ui.create.dialog('流转', [list, 'vcard']);
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
            backup(links) {
                return {
                    filterCard(card, player) {
                        const name = _status.event._result.links[0][2];
                        return get.type2(card, player) == get.type2(name, player);
                    },
                    check(card) {
                        return 8 - get.value(card);
                    },
                    position: 'hes',
                    viewAs: { name: links[0][2], nature: links[0][3] },
                };
            },
            prompt(links) {
                let str = get.type2(links[0][2]) == 'basic' ? '基本牌' : '锦囊牌';
                return `将一张${str}当做` + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
            },
        },
        ai: {
            fireAttack: true,
            respondSha: true,
            respondShan: true,
            save: true,
            skillTagFilter(player, tag, arg) {
                if (tag == 'fireAttack') return player.countCards('she', c => ['basic', 'trick'].includes(get.type2(c)));
                return player.countCards('she', { type: 'basic' });
            },
            order(item, player) {
                return 12;
            },
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
    },
    xinfan_benliu: {
        init(player) {
            player.storage.xinfan_benliu_used = 0;
        },
        filter(event, player) {
            return player.countMark('xinfan_benliu') > player.storage.xinfan_benliu_used;
        },
        enable: 'phaseUse',
        audio: "drlt_xiongluan", 
        filterTarget: lib.filter.notMe,
        prompt: '选择一名其他角色，本回合内你对其使用牌无距离次数限制。',
        content() {
            player.storage.xinfan_benliu_used++;
            target.addTempSkill('xinfan_benliu_debuff');
        },
        mod: {
            cardUsableTarget(card, player, target) {
                if (target.hasSkill('xinfan_benliu_debuff')) {
                    return true;
                }
            },
            targetInRange(card, player, target) {
                if (target.hasSkill('xinfan_benliu_debuff')) {
                    return true;
                }
            },
        },
        intro: {
            content: 'mark',
        },
        ai: {
            order: 12.8,
            result: {
                target(player, target) {
                    const effNum = player.countCards('she', c => c.name == 'shunshou' || get.tag(c, 'damage'));
                    if (effNum == 0) return 0;
                    const att = get.attitude(player, target);
                    if (att > 0) {
                        return 0;
                    }
                    return 1 / target.hp;
                },
            },
        },
        subSkill: {
            debuff: {
                charlotte: true,
                intro: {
                    content: '奔流debuff',
                },
            },
        },
    },


             //星魏延
 				xinfan_kuanggu: {
        group: ['xinfan_kuanggu_end','xinfan_kuanggu_and'],
        forced: true,
        trigger: {
            source: 'damageAfter',
        },
        filter(event, player) {
            return get.distance(player, event.player, 'unchecked') <= 1;
        },
        content() {
                game.broadcastAll(function (player) {
						game.playAudio(`../audio/skill/potkuanggu_pot_weiyan_achieve${[1,3,].randomGet()}.mp3`);
					}, player);
            player.recover();
        },
        subSkill: {
            end: {
                forced: true,
                trigger: {
                    global: 'phaseEnd',
                },
                filter(event, player) {
                    return player.hasHistory('sourceDamage');
                },
                content() {
             game.broadcastAll(function (player) {
			game.playAudio(`../audio/skill/potkuanggu_pot_weiyan_achieve${[2,4,].randomGet()}.mp3`);
				}, player);
                    player.draw(2);
                },
            },
            and: {
                              trigger: {
                                       global: "phaseBefore",
                                       },
                                 forced: true,
                                filter(event, player) {
                                    return game.phaseNumber == 0;
                                },
                                 async content(event, trigger, player) {
if (player.group == 'shu') {
                  game.broadcastAll(function (player) {
			game.playAudio(`../audio/skill/potyinzhan_pot_weiyan_achieve${[1,2,3,].randomGet()}.mp3`);
                    player.smoothAvatar(false);
                    player.node.avatar.setBackground('pot_weiyan', 'character');
				}, player);
}

},
                },
        },
    },
    xinfan_yexi: {
        groupSkill: 'qun',
         filter(event, player) {
            return player.group == 'qun';
        },     
        mod: {
            globalFrom(player, target) {
                if (player.group == 'qun' && _status.currentPhase == target) {
                    return 1;
                }
            },
            globalTo(target, player) {
                if (player.group == 'qun' && _status.currentPhase == target) {
                    return 1;
                }
            },
        },
        usable: 1,
        trigger: {
            global: ['phaseUseBegin', 'phaseUseEnd'],
        },
        logTarget: 'player',
        filter(event, player) {
            return event.player != player && player.group == 'qun';
        },
        prompt2(event, player) {
            return `视为对${get.translation(event.player)}使用一张【杀】？`;
        },
        check(event, player) {
            return get.effect(event.player, { name: 'sha' }, player, player) > 0;
        },
        content() {
                  game.broadcastAll(function (player) {
			game.playAudio(`../audio/skill/potyinzhan${[1,2,3,].randomGet()}.mp3`);
				}, player);
            player.useCard({ name: 'sha' }, trigger.player);
        },
    },
    xinfan_zhukou: {
        groupSkill: 'shu',
        enable: 'phaseUse',
        filterTarget: lib.filter.notMe,
        filter(event, player) {
            return player.group == 'shu';
        },
        ai: {
            result: {
                player(player) {
                    return -4 / player.hp;
                },
                target(player, target) {
                    if (target.countCards('he') == 0) return 0;
                    return -1;
                },
            },
        },
        async content(event, _, player) {
                     game.broadcastAll(function (player) {
			game.playAudio(`../audio/skill/potyinzhan_pot_weiyan_achieve${[1,2,3,].randomGet()}.mp3`);
				}, player);
            const target = event.targets[0];
            await player.loseHp();
            let card;
            if (target.countCards('he') > 0) {
                const  result  = await player.discardPlayerCard(target, 'he', true).forResult();
                if (result.bool) {
                    card = result.cards[0];
                }
            }

            const distance = get.distance(player, target, 'unchecked');
            if (distance > 1) {
                player.addMark('xinfan_zhukou_distance', 1, false);
                if (!player.hasSkill('xinfan_zhukou_distance')) {
                    player.addTempSkill('xinfan_zhukou_distance');
                }
            } else if (distance <= 1) {
                   player.gain(card); 
            }
        },
        subSkill: {
            distance: {
                onremove: true,
                mod: {
                    globalFrom(player, target, num) {
                        return num - player.countMark('xinfan_zhukou_distance');
                    },
                },
                mark: true,
                intro: {
                    content: '距离：-#',
                },
            },


             },
        
    },
                          //星诸葛果
 			                    xinfan_chenyuan: {
 			                priority:3,
                        trigger: {
                            global: "phaseBefore",
                            player: "enterGame",
                        },
                        filter(event, player) {
                            return event.name != "phase" || game.phaseNumber == 0;
                        },
                        forced: true,
                        content() {
                            let cards = player.getCards("h"); //
                            player.addGaintag(cards, "xinfan_chenyuan_tag");
                            //player.markAuto("dcqiqin", cards);
                        },
                        audio: "qirang",
                        group: "xinfan_chenyuan_restore",
                        subSkill: {
                            tag: {},
                            restore: {
                                audio: "qirang",
                                trigger: {
                                    player: "dying"
                                },
                                filter(event, player) {
                                    return player.countCards("h", card => card.hasGaintag("xinfan_chenyuan_tag"));
                                },
                                forced: true,
                                content() {
                                    player.recover(1 - player.hp);
                                },
                            },
                        },
                    },
                    xinfan_chaotuo: {
                        priority:1,
                        skillAnimation: true,
                        animationColor: "fire",
                        juexingji: true,
                        trigger: {
                            player: ["loseAfter", "enterGame"],
                            global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter", "phaseBefore"],
                        },
                        filter: function(event, player) {
                            return !player.countCards("h", card => card.hasGaintag("xinfan_chenyuan_tag"));
                        },
                        forced: true,
                        locked: false,
                        derivation: "xinfan_piaoyi",
                        content: async function(event, trigger, player) {
                            player.awakenSkill(event.name);
                            await player.discard(player.getCards("hej"));
                            await player.recover(player.maxHp - player.hp);
                            const disables = [];
                            for (let i = 1; i <= 5; i++) {
                                for (let j = 0; j < player.countEnabledSlot(i); j++) {
                                    disables.push(i);
                                }
                            }
                            if (disables.length > 0) {
                                await player.disableEquip(disables);
                            }
                            await player.disableJudge();
                            player.addSkill("xinfan_chaotuo_skip");
                            player.addSkill("xinfan_piaoyi");
                        },
                        audio: "yuhua",
                        subSkill: {
                            skip: {
                                trigger: {
                                    player: "phaseBegin"
                                },
                                forced: true,
                                direct: true,
                                async content(event, trigger, player) {
                                    trigger.phaseList = ["phaseUse"];
                                },
                            },
                        },
                    },
                    xinfan_piaoyi: {
                        forced: true,
                        subSkill: {
                            gain: {
                                trigger: {
                                    player: "gainAfter",
                                    global: "loseAsyncAfter",
                                },
                                forced: true,
                                filter: function(event, player) {
                                    return player.countCards("h");
                                },
                                audio: "yuhua",
                                content: function * (event, map) {
                                    var trigger = map.trigger,
                                        player = map.player,
                                        num = trigger.num;
                                    var cards = player.getCards("h");
                                    player.storage.daoguishuaju = 0;
                                    var result = yield player.chooseControl(["牌堆顶", "牌堆底"], true).set("prompt", "飘逸：请将手牌以任意顺序置于牌堆顶或牌堆底").set("choiceList", ["牌堆顶", "牌堆底"]).set("ai", () => {
                                        if (_status.event.triggerx.bottom || _status.event.triggerx.player == _status.event.player) return 1;
                                        return 0;
                                    }).set("triggerx", trigger);
                                    var next = yield player.chooseToMove("以任意顺序置于" + (result.index == "0"?"牌堆顶" : "牌堆底"), true).set("list", [
                                        [result.index == "0"?"牌堆顶" : "牌堆底", cards]
                                    ]).set('processAI', function(list) {
                                        var check = function(card) {
                                            var player = _status.event.player,
                                                next = _status.event.targetx;
                                            var att = get.attitude(player, next);
                                            var judge = next.getCards('j')[tops.length];
                                            if (judge) {
                                                return get.judge(judge)(card) * att;
                                            }
                                            return next.getUseValue(card) * att;
                                        }
                                        var cards = list[0][1].slice(0),
                                            tops = [];
                                        while (cards.length > 0) {
                                            cards.sort(function(a, b) {
                                                return check(b) - check(a);
                                            });
                                            tops.push(cards.shift());
                                        }
                                        return [tops];
                                    }).set("targetx", trigger.player);
                                    var list = next.moved[0];
                                    if (result.index == "0") list.reverse();
                                    var next = player.lose(list, ui.cardPile);
                                    if (result.index == 0) next.insert_card = true;
                                    game.log(player, "将", list.length, "张牌置于了", result.index == 0?"牌堆顶" : "牌堆底");
                                },
                            },
                        },
                        group: "xinfan_piaoyi_gain",
                        enable: ['chooseToUse', 'chooseToRespond'],
                        onChooseToRespond: function(event) {
                            if (!game.online) {
                                const player = event.player;
                                event.set("xinfan_piaoyi_cards", get.cards(2 * game.roundNumber, true));
                            };
                        },
                        filter: function(event) {
                            return event.xinfan_piaoyi_cards.length > 0;
                        },
                        audio: "yuhua",
                        onChooseToUse: function(event) {
                                const player = event.player;
                                event.set("xinfan_piaoyi_cards", get.cards(2 * game.roundNumber, true));        
                        },
                        hiddenCard: function(player, name) {
                            if (!lib.inpile.includes(name)) return false;
                            return true;
                        },
                        mod: {
                            targetInRange: function(card, player, target) {
                                if (card.storage?.xinfan_piaoyi) return true;
                            },
                        },
                        chooseButton: {
                            dialog: function(event, player) {
                                var text, card;
                                text = "选择使用其中一张牌";
                                card = event.xinfan_piaoyi_cards;
                                return ui.create.dialog(text, card, "hidden");
                            },
                            filter: function(button, player) {
                                var event = _status.event.getParent();
                                return event.filterCard(button.link, player, event);
                            },
                            check: function(button) {
                                if (_status.event.getParent().type != "phase") return 1;
                                var player = _status.event.player;
                                if (["wugu", "zhulu_card", "yiyi", "lulitongxin", "lianjunshengyan", "diaohulishan"].includes(button.link.name)) return 0;
                                return player.getUseValue(button.link);
                            },
                            backup: function(links, player) {
                                ui.selected.cards = links;
                                return {
                                    selectCard: -1,
                                    filterCard: () => false,
                                    viewAs: {
                                        name: get.name(links[0]),
                                        nature: get.nature(links[0]),
                                        cards: links,
                                        isCard: true,
                                        storage: {
                                            xinfan_piaoyi: true,
                                        },
                                    },
                                    popname: true,
                                    log: false,
                                    oncard: () => {
                                        get.event().customArgs.
                                        default.customSource = {
                                            isDead: () => true,
                                        };
                                    },
                                    precontent: function() {
                                        event.result.cards = event.result.card.cards;
                                        player.logSkill("xinfan_piaoyi");
                                    },
                                };
                            },
                            prompt: function(links, player) {
                                return "选择" + get.translation(links[0]) + "的目标";
                            },
                        },
                        ai: {
                            fireAttack: true,
                            respondSha: true,
                            respondShan: true,
                            order: 18,
                            result: {
                                player(player) {
                                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                                    return 1;
                                },
                            },
                        }, 
                    },

                    //星赵云
 				        xinfan_qiangshi: {
                            priority:20,
                        trigger: {
                            global: "phaseBefore",
                            player: "enterGame",
                        },
                        forced: true,
                        filter(event, player) {
                            return event.name != "phase" || game.phaseNumber == 0;
                        },
                        content: function() {
                            var num = 2 * player.maxHp;
                            if (player.group == "shu") player.addToExpansion(get.cards(num), "draw").gaintag.add("xinfan_qiangshi_tag");
                            else player.loseToSpecial(get.cards(num), "xinfan_qiangshi_tag").visible = true;
                        },
                        mark: true,
                        intro: {
                            mark(dialog, storage, player) {
                                dialog.addAuto(
                                player.group == "qun"?player.getCards("s", function(card) {
                                    return card.hasGaintag("xinfan_qiangshi_tag");
                                }) : player.getExpansions("xinfan_qiangshi_tag"));
                            },
                            markcount(storage, player) {
                                return player.group == "qun"?player.getCards("s", function(card) {
                                    return card.hasGaintag("xinfan_qiangshi_tag");
                                }).length : player.getExpansions("xinfan_qiangshi_tag").length;
                            },
                            onunmark(storage, player) {
                                var cards = (player.group == "qun"?player.getCards("s", function(card) {
                                    return card.hasGaintag("xinfan_qiangshi_tag");
                                }) : player.getExpansions("xinfan_qiangshi_tag"));
                                if (cards.length) {
                                    player.lose(cards, ui.discardPile);
                                    player.$throw(cards, 1000);
                                    game.log(cards, "进入了弃牌堆");
                                }
                            },
                        },
                        audio: "longdan",
                        ai: {
                            combo: ["xinfan_zhenjun"],
                        },
             group: ['xinfan_qiangshi_and'],
             subSkill: {
            and: {
                              trigger: {
                                       global: "phaseBefore",
                                       },
                                       priority:30,
                                 forced: true,
                                filter(event, player) {
                                    return game.phaseNumber == 0;
                                },
                                 async content(event, trigger, player) {
if (player.group == 'shu') {
                  game.broadcastAll(function (player) {
                    player.smoothAvatar(false);
                    player.node.avatar.setBackground('re_zhaoyun', 'character');
				}, player);
}
},
},
                },

                    },
                    xinfan_zhenjun: {
                        ai: {
                            combo: ["xinfan_qiangshi"],
                        },
                        groupSkill: "shu",
                        trigger: {
                            player: ["useCard", "respondAfter"],
                        },
                        audio: "reyajiao",
                        filter: function(event, player) {
                            return player.group == "shu" && player.getExpansions("xinfan_qiangshi_tag").length;
                        },
                        cost: async function(event, trigger, player) {
                            var result = await player.chooseButton(["是否发动【镇军】：弃置一张“势”", player.getExpansions("xinfan_qiangshi_tag")]).set("ai", button => 6.5 - get.value(button.link)).forResult();
                            event.result = {
                                bool: result.bool,
                                cards: result.links?[result.links[0]]:[],
                            };
                        },
                        group: "xinfan_zhenjun_give",
                        subSkill: {
                            give: {
                                trigger: {
                                    player: ["phaseZhunbeiBegin", "phaseJieshuBegin"],
                                },
                                audio: "reyajiao",
                                filter: function(event, player) {
                                    return player.group == "shu" && player.getExpansions("xinfan_qiangshi_tag").length &&(event.name=="phaseZhunbei"||(player.maxHp - (player.storage.xinfan_zhenjun||0)) > 0);
                                },
                                cost: async function(event, trigger, player) {
                                    if(trigger.name=="phaseZhunbei") player.storage.xinfan_zhenjun=0;
                                    var num = player.maxHp - player.storage.xinfan_zhenjun;
                                    var result = await player.chooseButtonTarget().set("createDialog", ["是否发动【镇军】：将至多" + num + "“势”交给一名角色", player.getExpansions("xinfan_qiangshi_tag")]).set("selectButton", [1, num]).set("ai1", button => get.value(button.link)).forResult();
                                    event.result = {
                                        bool: result.bool,
                                        cards: result.links?[...result.links]:[],
                                        targets: result.targets,
                                    };
                                },
                                content: function() {
                                    "step 0"
                                    player.storage.xinfan_zhenjun+=event.cards?.length;
                                    player.give(event.cards, event.targets[0], "xinfan_zhenjun_give");
                                    "step 1"
                                    player.logSkill("xinfan_qiangshi");
                                    player.addToExpansion(get.cards(event.cards.length), "draw").gaintag.add("xinfan_qiangshi_tag");
                                },
                            },
                        },
                        content: function() {
                            "step 0"
                            player.discard(event.cards);
                            "step 1"
                            player.logSkill("xinfan_qiangshi");
                            player.addToExpansion(get.cards(1), "draw").gaintag.add("xinfan_qiangshi_tag");
                        },
                    },
                    xinfan_youlong: {
                        audio: "chongzhen",
                        groupSkill: "qun",
                        ai: {
                            combo: ["xinfan_qiangshi"],
                        },
                        mod: {
                            cardEnabled: function(card, player) {
                                if(card.cards?.length&&card.cards[0].hasGaintag("xinfan_qiangshi_tag")&&player.countMark("xinfan_youlong")<2) return false;
                            },
                            cardSavable: function(card, player) {
                                if(card.cards?.length&&card.cards[0].hasGaintag("xinfan_qiangshi_tag")&&player.countMark("xinfan_youlong")<2) return false;
                            },
                            cardRespondable: function(card, player) {
                                if(card.cards?.length&&card.cards[0].hasGaintag("xinfan_qiangshi_tag")&&player.countMark("xinfan_youlong")<2) return false;
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
                            player.addMark("xinfan_youlong");
                        },
                        group:"xinfan_youlong_remove",
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
                                    player.removeMark("xinfan_youlong",2);
                                    if(_status.currentPhase==player) player.addTempSkill("xinfan_youlong_use",{player:["useCardBefore","phaseEnd"]});
                                    else player.addMark("xinfan_youlong");
                                    "step 1";
                                    player.logSkill("xinfan_qiangshi");
                                    player.loseToSpecial(get.cards(event.num), "xinfan_qiangshi_tag").visible = true;
                                },
                            },
                        },
                    },           
 				         //星姜维                             
 				xinfan_yibo: {
                        mod: {
                            targetEnabled(card, player, target, now) {
                                if (target.countCards("h") == 0) {
                                    if (card.name == "sha") {
                                        return false;
                                    }
                                }
                            },
                        },
                        subSkill: {
                            audio: {
                                trigger: {
                                    player: "loseEnd"
                                },
                                forced: true,
                                firstDo: true,
                                audio: "kongcheng1",
                                filter(event, player) {
                                    if (player.countCards("h")) {
                                        return false;
                                    }
                                    for (let i = 0; i < event.cards.length; i++) {
                                        if (event.cards[i].original == "h") {
                                            return true;
                                        }
                                    }
                                    return false;
                                },
                                async content() {},
                            },
                        },
                        ai: {
                            noh: true,
                            skillTagFilter(player, tag) {
                                if (tag == "noh") {
                                    if (player.countCards("h") != 1) {
                                        return false;
                                    }
                                }
                            },
                            threaten: 2.2,
                        },
                        trigger: {
                            player: ["phaseZhunbeiBegin"],
                        },
                        frequent: true,
                        audio: "reguanxing",
                        content() {
                            "step 0"
                            var num = 3;
                            var cards = get.cards(3);
                            var next = player.chooseToMove("衣钵：以任意顺序置于牌堆顶", true);
                            next.set('list', [
                                ['牌堆顶', cards], ]);
                            next.set('num', num);
                            next.set('processAI', function(list) {
                                var check = function(card) {
                                    var player = _status.event.player;
                                    var next = player.next;
                                    var att = get.attitude(player, next);
                                    var judge = next.getCards('j')[tops.length];
                                    if (judge) {
                                        return get.judge(judge)(card) * att;
                                    }
                                    return next.getUseValue(card) * att;
                                }
                                var cards = list[0][1].slice(0),
                                    tops = [];
                                while (tops.length < _status.event.num) {
                                    list.sort(function(a, b) {
                                        return check(b) - check(a);
                                    });
                                    tops.push(cards.shift());
                                }
                                return [tops];
                            });
                            "step 1"
                            if (result.bool) {
                                var list = result.moved[0];
                                var num = list.length - 1;
                                for (var i = 0; i < list.length; i++) {
                                    ui.cardPile.insertBefore(list[num - i], ui.cardPile.firstChild);
                                };
                                game.log(player, "观看了牌堆顶3张牌并以任意顺序放了回去");
                            };
                            "step 2"
                            game.updateRoundNumber();
                        },
                    },
                    xinfan_zhiji: {
                        juexingji: true,
                        skillAnimation: true,
                        animationColor: "gray",
                        forced: true,
                        trigger: {
                            player: ["loseAfter", "dying"],
                            global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
                        },
                        filter(event, player) {
                            if (event.name == "dying") return true;
                            if (player.countCards("h")) {
                                return false;
                            }
                            const evt = event.getl(player);
                            return evt && evt.player == player && evt.hs && evt.hs.length > 0;
                        },
                        derivation: ["xinfan_yibo"],
                        audio: "zyhsbzhiji",
                        content: function() {
                            player.awakenSkill("xinfan_zhiji");
                            if (trigger.name == "dying") player.recover(player.maxHp - player.hp);
                            else player.drawTo(player.maxHp);
                            player.addSkill("xinfan_yibo");
                        },
                    },
                    xinfan_hemou: {
                        limited: true,
                        ai: {
                            order: 10,
                            result: {
                                target: function(player, target) {
                                    if (get.attitude(player, target) < 0) return (target.hp - 3) * get.damageEffect(target, player, player, "fire");
                                    if (get.attitude(player, target) == 0) return 0;
                                    if (get.attitude(player, target) > 0) {
                                        if ((target.hp - 3) /get.damageEffect(target, player,player, "fire")>0) return ((target.hp-3)/get.damageEffect(target, player, player, "fire")) * 100;
                                    };
                                    return 0;
                                },
                                player: function(event, player) {
                                    if (player.hp > 3) return 1;
                                    return player.countCards("h", card => ["tao", "jiu"].includes(card.name)) > (3 - player.hp);
                                },
                            },
                        },
                        audio: "pingxiang",
                        enable: "phaseUse",
                        filterTarget: lib.filter.notMe,
                        selectTarget: 1,
                        content: async function(event, trigger, player) {
                            player.awakenSkill("xinfan_hemou");
                            await game.asyncDraw([player, event.targets[0]], 3);
                            await player.damage(3, "fire");
                            await event.targets[0].damage(3, "fire");
                            player.addTempSkill("xinfan_hemou_recover");
                            event.targets[0].addTempSkill("xinfan_hemou_recover");
                        },
                        subSkill: {
                            recover: {
                                onremove: function(player) {
                                    _status.currentPhase.logSkill("xinfan_hemou");
                                    player.recover(3);
                                },
                            },
                        },
                    },
                    xinfan_tiaoxin: {
                        subSkill: {
                            mark: {},
                            use1: {
                                mark: true,
                                intro: {
                                    name: "挑衅",
                                    name2: "挑衅",
                                    content: function(storage, player) {
                                        var players = game.filterPlayer(i => i.hasSkill("xinfan_tiaoxin_mark"));
                                        return "本回合使用牌仅能指定" + get.translation(players) + "或你为目标";
                                    },
                                    markcount: () => null,
                                },
                                mod: {
                                    cardSavable(card, player, target) {
                                        if (player!=target&&!target.hasSkill("xinfan_tiaoxin_mark")) {
                                            return false;
                                        }
                                    },
                                    playerEnabled(card, player, target) {
                                        if (player!=target&&!target.hasSkill("xinfan_tiaoxin_mark")) {
                                            return false;
                                        }
                                    },
                                },
                            },
                            use2: {
                                mark: true,
                                intro: {
                                    name: "挑衅",
                                    name2: "挑衅",
                                    content: function(storage, player) {
                                        var players = game.filterPlayer(i => i.hasSkill("xinfan_tiaoxin_mark"));
                                        return "本回合使用牌不能指定" + get.translation(players) + "为目标";
                                    },
                                    markcount: () => null,
                                },
                                mod: {
                                    cardSavable(card, player, target) {
                                        if (target.hasSkill("xinfan_tiaoxin_mark")) {
                                            return false;
                                        }
                                    },
                                    playerEnabled(card, player, target) {
                                        if (target.hasSkill("xinfan_tiaoxin_mark")) {
                                            return false;
                                        }
                                    },
                                },
                            },
                        },
                        audio: "retiaoxin",
                        trigger: {
                            global: "phaseUseBegin",
                        },
                        check: function(event, player) {
                            if (player.countCards("h", "shan") == 0 && player.hp < 3) {
                                return 0;
                            };
                            return get.attitude(player, event.player) < 0;
                        },
                        filter: function(event, player) {
                            return player != event.player;
                        },
                        content: async function(event, trigger, player) {
                            var list = ["被姜维弃置一张牌，然后你本回合使用牌不能指定其为目标", "对姜维使用一张【杀】，然后你本回合使用牌仅能指定其或你为目标"],
                                list1 = ["选项一"];
                            if (trigger.player.hasSha()&& trigger.player.canUse(get.autoViewAs({
                                name: "sha"
                            }, "unsure"), player, false, false)) {
                                list1.push("选项二");
                            } else list[1] = `<span style="text-decoration: line-through; opacity:0.5; ">${list[1]}</span>`
                            var result = await trigger.player.chooseControl(list1, true).set("prompt", "姜维对你发动了挑衅：请选择一项")
				.set("choiceList", list).set("ai", () => {
                                var player = _status.event.player,
                                    source = _status.event.getParent().player;
                                if (get.attitude(player, source) >= 0) return 1;
                                if (player.countCards("h") < 4) return 0;
                                return 1;
                            }).forResult();
                            player.addTempSkill("xinfan_tiaoxin_mark");
                            if (result.index == 1) {
                                var resultx=await trigger.player.chooseToUse(function(card, player, event) {
                                    return get.name(card) == "sha";
                                }, "挑衅：对" + get.translation(player) + "使用一张杀，然后你本回合使用牌仅能指定其为目标，若取消则视为选择选项一")
                                    .set("targetRequired", true)
                                    .set("complexSelect", true)
                                    .set("complexTarget", true)
                                    .set("filterTarget", function(card, player, target) {
                                    if(!card) card=get.card();
                                    return player.canUse(card,target,false,false)&&target==_status.event.sourcex;
                                })
                                    .set("sourcex", player).forResult();
                                if(resultx.bool) trigger.player.addTempSkill("xinfan_tiaoxin_use1");
                            };
                            if(result.index == 0||!resultx?.bool){
                                await player.discardPlayerCard(trigger.player, "he", true);
                                trigger.player.addTempSkill("xinfan_tiaoxin_use2");
                            };
                        },
                    },

                  //星曹仁
 				xinfan_dingjun: {
 				        audio: "sbjushou",
						trigger: {
							player: ["loseHpAfter", "recoverAfter", "changeHpAfter", "gainAfter", "loseAfter"],
						},
						filter(event, player) {
							return player.countCards("h") != player.hp;
						},
						usable(skill, player) {
							return player.storage.xinfan_jiyuan2 ? 2 : 1;
						},
						prompt2(event, player) {
							return `是否将手牌数调整至体力值${player.hp}？`;
						},
						check(event, player) {
							if (_status.currentPhase != player) {
								return true;
							}
							const cards = player.getCards("h");
							if (cards.some(i => player.hasUseTarget(i) && player.getUseValue(i) > 0)) return false;
							return player.hp > player.countCards("h");
						},
						async content(event, trigger, player) {
							const hs = player.countCards("h");
							const hp = player.hp;
							const dif = hp - hs;
							if (dif > 0) {
								await player.draw(dif);
								const  result  = await player.chooseTarget(lib.filter.notMe, `###定军###你可以令一名其他角色摸${dif}张牌。`).set("ai", target => {
									const { player } = _status.event;
									return get.attitude(player, target) - 1;
								}).forResult();
								if (result.bool) {
									await result.targets[0].draw(dif);
								}
							} else {
								await player.chooseToDiscard(-dif, true, "h");
								const  result  = await player.chooseTarget(lib.filter.notMe, `###定军###你可以令一名其他角色弃置${-dif}张牌。`).set("ai", target => {
									const { player } = _status.event;
									return -get.attitude(player, target);
								}).forResult();
								if (result.bool) {
									await result.targets[0].chooseToDiscard(-dif, true, "he");
								}
							}
						},
					},
					xinfan_jiyuan: {
				      audio: "sbjiewei",
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
							return `是否弃置区域内所有牌令${get.translation(event.player)}回复至1点体力？`;
						},
						async content(event, trigger, player) {
                            player.awakenSkill('xinfan_jiyuan');
							trigger.cancel();
							await trigger.player.recoverTo(1);
							player.storage.xinfan_jiyuan2 = true;
							const cards = player.getCards("hej");
							await player.discard(cards);
							if (cards.length >= trigger.player.maxHp) {
								await player.recover();
								await trigger.player.recover();
							}
						},
					},

                   //星黄月英
 			xinfan_lingdong: {
                audio: "rejizhi",
                        enable: ["chooseToUse", "chooseToRespond"],
                        hiddenCard: function(player, name) {
                            if (!lib.inpile.includes(name)) return false;
                            const type = get.type(name);
                            return (type == 'basic' || type == 'trick') && !player.hasSkill('xinfan_lingdong_used');
                        },
                        filter(event, player) {
                            if (player.hasSkill('xinfan_lingdong_used')) return false;
                            for (const name of lib.inpile) {
                                const type = get.type(name);
                                if (type == 'basic' || type == 'trick') {
                                    if (event.filterCard(get.autoViewAs({
                                        name: name
                                    }, 'unsure'), player, event)) return true;
                                    if (name == 'sha') {
                                        for (const j of lib.inpile_nature) {
                                            if (event.filterCard(get.autoViewAs({
                                                name: name,
                                                nature: j
                                            }, 'unsure'), player, event)) return true;
                                        }
                                    }
                                }
                            }
                        },
                        xinfan_lingdong_choose() {
                            'step 0';
                            if (!player.storage.xinfan_lingdong_choose) player.storage.xinfan_lingdong_choose = {};
                            player.chooseControl(['heart', 'diamond', 'club', 'spade', 'none']).set('prompt', '选择一种花色');
                            'step 1'
                            if (result.control) {
                                player.storage.xinfan_lingdong_choose.suit = result.control;
                            } else {
                                event.finish();
                            }
                            'step 2'
                            player.chooseControl([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 'none']).set('prompt', '选择一种点数');
                            'step 3'
                            if (result.control) {
                                player.storage.xinfan_lingdong_choose.number = result.control;
                            } else {
                                event.finish();
                            }
                        },
                        chooseButton: {
                            dialog(event, player) {
                                player.logSkill('xinfan_lingdong');
                                const next = game.createEvent('xinfan_lingdong_choose');
                                next.player = player;
                                next.setContent(lib.skill.xinfan_lingdong.xinfan_lingdong_choose);
                                const list = [];
                                for (const name of lib.inpile) {
                                    const type = get.type(name);
                                    if (!(type == 'basic' || type == 'trick')) continue;
                                    if (event.filterCard(get.autoViewAs({
                                        name: name
                                    }, 'unsure'), player, event)) list.push([get.translation(get.type(name)), '', name]);
                                    if (name == 'sha') {
                                        for (const j of lib.inpile_nature) {
                                            if (event.filterCard(get.autoViewAs({
                                                name: name,
                                                nature: j
                                            }, 'unsure'), player, event)) list.push(['基本', '', 'sha', j]);
                                        }
                                    }
                                }
                                return ui.create.dialog('灵动', [list, 'vcard']);
                            },
                            filter(button, player) {
                                return _status.event.getParent().filterCard({
                                    name: button.link[2]
                                }, player, _status.event.getParent());
                            },
                            check(button) {
                                if (_status.event.getParent().type != 'phase') return 1;
                                const player = _status.event.player;
                                if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
                                return player.getUseValue({
                                    name: button.link[2],
                                    nature: button.link[3]
                                });
                            },
                            backup(links, player) {
                                return {
                                    filterCard: true,
                                    check(card) {
                                        return 8 - get.value(card);
                                    },
                                    selectCard: 0,
                                    viewAs: {
                                        name: links[0][2],
                                        nature: links[0][3],
                                        number: player.storage.xinfan_lingdong_choose.number,
                                        suit: player.storage.xinfan_lingdong_choose.suit
                                    },
                                    precontent() {
                                        'step 0';
                                        player.chooseCard(`###灵动###你须弃置一张名称为${get.translation(event.result.card.name)}的牌，否则此技能本回合失效`, card => card.name == _status.event.getParent().result.card.name);
                                        'step 1'
                                        if (result.cards) {
                                            player.discard(result.cards);
                                        } else {
                                            player.addTempSkill('xinfan_lingdong_used');
                                        }
                                    },
                                };
                            },
                            prompt(links, player) {
                                return '视为使用' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
                            },
                        },
                        subSkill: {
                            used: {
                                charlotte: true,
                                silent: true,
                                content() {},
                                sub: true,
                                sourceSkill: "xinfan_lingdong",
                                forced: true,
                                popup: false,
                                "_priority": 1,
                            },
                        },
                        ai: {
                            fireAttack: true,
                            respondSha: true,
                            respondShan: true,
                            skillTagFilter(player, tag, arg) {
                                return !player.hasSkill('xinfan_lingdong_used');
                            },
                            order: 18,
                            result: {
                                player(player) {
                                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                                    return 1;
                                },
                            },
                        },
                    },
                    xinfan_lingqiao: {
                        audio: "sbjizhi",
                        priority: 2,
                        trigger: {
                            player: "useCardAfter",
                        },
                        init(player) {
                            player.storage.xinfan_lingqiao = {};
                        },
                        mark: true,
                        intro: {
                            content(storage, player) {
                                let str = '当前记录的内容为:';
                                if (storage.huase) str += '</br>花色:' + get.translation(storage.huase);
                                if (storage.dianshu) str += '</br>点数:' + get.translation(storage.dianshu);
                                if (storage.paiming) str += '</br>牌名:' + get.translation(storage.paiming);
                                if (storage.leibie) str += '</br>类别:' + get.translation(storage.leibie);
                                return Object.keys(storage).length ? str : '无记录';
                            },
                        },
                        direct: true,
                        content() {
                            'step 0';
                            event.cardInfo = {
                                huase: get.suit(trigger.card),
                                dianshu: get.number(trigger.card),
                                paiming: get.name(trigger.card),
                                leibie: get.type2(trigger.card),
                            };
                            player.logSkill('xinfan_lingqiao');
                            const list = [];
                            const storage = player.storage.xinfan_lingqiao;
                            if (!storage.huase) list.push('花色');
                            if (!storage.dianshu) list.push('点数');
                            if (!storage.paiming) list.push('牌名');
                            if (!storage.leibie) list.push('类别');
                            list.push('cancel2');
                            player.chooseControl(list)
                                .set('prompt', '灵巧:是否记录一项?')
                                .set('ai', () => _status.event.fal.randomGet())
                                .set('fal', list);
                            'step 1'
                            if (result.control != 'cancel2') {
                                if (result.control == '花色') {
                                    player.storage.xinfan_lingqiao.huase = event.cardInfo.huase;
                                }
                                if (result.control == '点数') {
                                    player.storage.xinfan_lingqiao.dianshu = event.cardInfo.dianshu;
                                }
                                if (result.control == '牌名') {
                                    player.storage.xinfan_lingqiao.paiming = event.cardInfo.paiming;
                                }
                                if (result.control == '类别') {
                                    player.storage.xinfan_lingqiao.leibie = event.cardInfo.leibie;
                                }
                            } else {
                                event.goto(2);
                            }
                            'step 2'
                            if (Object.keys(player.storage.xinfan_lingqiao).length > 1) {
                                player.chooseBool('###灵巧###是否随机展示牌堆里一张满足条件的牌并交给一名角色并清除记录。若没有满足条件的牌，则改为清除一项记录');
                            } else {
                                event.finish();
                            }
                            'step 3'
                            if (result.bool) {
                                const card = get.cardPile(i => {
                                    const storage = player.storage.xinfan_lingqiao;
                                    if (storage.huase) {
                                        if (get.suit(i) != storage.huase) return false;
                                    }
                                    if (storage.dianshu) {
                                        if (get.number(i) != storage.dianshu) return false;
                                    }
                                    if (storage.paiming) {
                                        if (get.name(i) != storage.paiming) return false;
                                    }
                                    if (storage.leibie) {
                                        if (get.type2(i) != storage.leibie) return false;
                                    }
                                    return true;
                                });
                                event.cardx = card;
                                if (card) {
                                    player.showCards(card);
                                    player.chooseTarget(`灵巧:选择一名角色获得${get.translation(card)}`).set('ai', target => get.attitude(_status.event.player, target));
                                } else {
                                    const choose = [];
                                    if (player.storage.xinfan_lingqiao.huase) choose.push('花色');
                                    if (player.storage.xinfan_lingqiao.dianshu) choose.push('点数');
                                    if (player.storage.xinfan_lingqiao.paiming) choose.push('牌名');
                                    if (player.storage.xinfan_lingqiao.leibie) choose.push('类别');
                                    player.chooseControl(choose)
                                        .set('prompt', '移除一项记录')
                                        .set('ai', () => true);
                                    event.goto(5);
                                }
                            } else {
                                event.finish();
                            }
                            'step 4'
                            if (result.targets) {
                                result.targets[0].gain(event.cardx);
                                player.storage.xinfan_lingqiao = {};
                            } else {
                                event.finish();
                            }
                            'step 5'
                            if (result.control) {
                                let str;
                                if (result.control == '花色') str = 'huase'
                                if (result.control == '点数') str = 'dianshu'
                                if (result.control == '牌名') str = 'paiming'
                                if (result.control == '类别') str = 'leibie'
                                delete player.storage.xinfan_lingqiao[str];
                            }
                        },
                    },
 				   
           //星张春华
            xinfan_jueqin: {
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
                trigger.player.addTempSkill('xinfan_jueqin_mark');
                trigger.player.addMark('xinfan_jueqin_mark', 1);
                if (!trigger.player.storage.xinfan_jueqin_from) trigger.player.storage.xinfan_jueqin_from = [];
                trigger.player.storage.xinfan_jueqin_from.push(player);
            } else {
                player.addTempSkill('xinfan_jueqin_mark');
                player.addMark('xinfan_jueqin_mark', 1);
                if (!player.storage.xinfan_jueqin_from) player.storage.xinfan_jueqin_from = [];
                player.storage.xinfan_jueqin_from.push(player);
            }
        },
        subSkill: {
            mark: {
                mark: true,
                onremove(player) {
                    delete player.storage.xinfan_jueqin_from;
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
                    const targets = player.storage.xinfan_jueqin_from?.filter(i => i.isAlive());
                    for (const target of targets) {
                        target.draw(1);
                    }
                },
            },
        },
    },
  xinfan_zhinian: {
                audio: "reshangshi",
                filter(event, player) {
                    return (
                        !player.storage.xinfan_zhinian.includes(event.card.name) &&
                        !player.getHistory('sourceDamage', function (evt) {
                            return evt.card == event.card;
                        }).length &&
                        get.position(event.card) == 'd'
                    );
                },
                check: () => true,
                init(player) {
                    player.storage.xinfan_zhinian = [];
                },
                trigger: {
                    player: "useCardEnd",
                },
                content() {
                    const cards = trigger.card.cards ? trigger.card.cards : trigger.card;
                    player.gain(cards).gaintag = ['xinfan_zhinian'];
                    player.addTempSkill('xinfan_zhinian_temp');
                    player.storage.xinfan_zhinian.push(trigger.card.name);
                },
                subSkill: {
                    temp: {
                        mod: {
                            cardUsable(card, player, num) {
                                return card.cards?.every(i => i.hasGaintag('xinfan_zhinian')) ? Infinity : num;
                            },
                        },
                        onremove(player) {
                            player.removeGaintag('xinfan_zhinian');
                            player.storage.xinfan_zhinian = [];
                        },
                        sub: true,
                        sourceSkill: "xinfan_zhinian",
                      
                    },
                },
               
            },
    
 		            //星司马懿
                     xinfan_yingshi: {
                        audio: "dcsbpingliao",
                        group: ["xinfan_yingshi_noOne","xinfan_yingshi_phaseBegin"],
                subSkill: {
                    noOne: {
                        trigger: {
                            global: "phaseEnd",
                        },
                        frequent: true,
                        filter(event, player) {
                            return !player.hasSkill('xinfan_yingshi_ban');
                        },
                        content() {
                            player.logSkill('xinfan_yingshi');
                            player.chooseDrawRecover(2);
                        },
                        sub: true,
                        sourceSkill: "xinfan_yingshi",
                       
                    },
                    ban: {
                        charlotte: true,
                        mark: true,
                        intro: {
                            content: "本回合鹰视失效",
                        },
                        sub: true,
                        sourceSkill: "xinfan_yingshi",
                      
                    },
                    mark: {
                        mark: true,
                        intro: {
                            content: "expansion",
                            markcount: "expansion",
                            name: "鹰视",
                        },
                        sub: true,
                        sourceSkill: "xinfan_yingshi",
                      
                    },
                    phaseBegin: {
                        trigger: {
                            global: "phaseBegin",
                        },
                        filter(event, player) {
                            return player.countCards('h');
                        },
                        direct: true,
                        content() {
                            'step 0'
                            const list = ['放置'];
                            if (player.getExpansions('xinfan_yingshi_mark').length) list.push('回收')
                            list.push('cancel2');
                            player.chooseControl(list).set('ai', function () {
                                const player = _status.event.player;
                                if (player.needsToDiscard() || player.countCards('h') > 3) return '放置';
                                if (player.getExpansions('xinfan_yingshi_mark').length >= 12) return '回收';
                                return '放置'
                            }).set('prompt', '###鹰视###选择放置或者回收“鹰视”牌')
                              player.logSkill('xinfan_yingshi');
                            'step 1'
                            if (result.control != 'cancel2') {
                                if (result.control == '放置') {
                                    player.chooseCard(`###鹰视###是否将任意张牌置于武将牌上称为“鹰视”`, [1, Infinity]).set('ai', function (card) {
                                        if (get.tag(card, 'damage')) return 6 - get.value(card);
                                        return 4 - get.value(card);
                                    });
                                } else {
                                    player
                                        .chooseCardButton('###鹰视###选择回收任意张"鹰视"', player.getExpansions('xinfan_yingshi_mark'), [1, Infinity])
                                        .set('ai', () => {
                                            return true;
                                        });
                                    event.goto(3)
                                }
                            } else {
                                event.finish()
                            }
                            'step 2'
                            if (result.cards) {
                                player.logSkill('xinfan_yingshi ');
                                player.addToExpansion(result.cards, 'gain2').gaintag.add('xinfan_yingshi_mark');
                            }
                            event.finish();
                            'step 3'
                            if (result.links) player.gain(result.links, 'gain2')
                        },
                        sub: true,
                        sourceSkill: "xinfan_yingshi",
                    
                    },
                },
                trigger: {
                    target: "useCardToTargeted",
                },
                filter(event, player) {
                    return event.player != player;
                },
                silent: true,
                content() {
                    player.addTempSkill('xinfan_yingshi_ban');
                },
                forced: true,
                popup: false,
             
            },
            xinfan_chengbing: {
                audio: "dcsbquanmou",
                trigger: {
                    global: "phaseUseBegin",
                },
                filter(event, player) {
                    return player.countCards('h') && event.player != player && !player.hasSkill('xinfan_chengbing_damage');
                },
                check(event, player) {
                    return player.countCards('h', i => get.tag(i, 'damage')) == 0;
                },
                content() {
                    _status.currentPhase.viewHandcards(player);
                    if (player.countCards('h', i => get.tag(i, 'damage')) == 0) {
                        player.addTempSkill('xinfan_chengbing_ban');
                        player.storage.xinfan_chengbing_ban = _status.currentPhase;
                    }
                },
                group: ["xinfan_chengbing_attack"],
                subSkill: {
                    ban: {
                        mod: {
                            targetEnabled: function (card, player, target) {
                                if (player == target.storage.xinfan_chengbing_ban && ['sha', 'juedou'].includes(card.name)) return false;
                            },
                        },
                        onremove(player) {
                            delete player.storage.xinfan_chengbing_ban;
                        },
                        sub: true,
                        sourceSkill: "xinfan_chengbing",
                    
                    },
                    attack: {
                        trigger: {
                            source: "damageEnd",
                        },
                        silent: true,
                        content() {
                            player.addTempSkill('xinfan_chengbing_damage', 'roundStart');
                        },
                        sub: true,
                        sourceSkill: "xinfan_chengbing",
                        forced: true,
                        popup: false,
                     
                    },
                    damage: {
                        charlotte: true,
                        mark: true,
                        intro: {
                            content: "本轮称病失效",
                        },
                        sub: true,
                        sourceSkill: "xinfan_chengbing",
                       
                    },
                },
              
            },

                    //星曹操
                    xinfan_zhiyuan: {
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
                        return num + player.getExpansions('xinfan_zhiyuan_mark').length;
                    },
                },
                content() {
                    'step 0'
                    let num = player.countCards('h') - player.getHandcardLimit();
                    player.chooseCard(`###志远###将${num}张牌置于武将牌上称“志”`, true, [num, num]);
                    'step 1'
                    player.addToExpansion(result.cards, 'gain2').gaintag.add('xinfan_zhiyuan_mark');
                },
                group: ["xinfan_zhiyuan_end"],
                subSkill: {
                    mark: {
                        mark: true,
                        intro: {
                            name: "志",
                            content: "expansion",
                            markcount: "expansion",
                        },
                        sub: true,
                        sourceSkill: "xinfan_zhiyuan",
                      
                    },
                    end: {
                        audio:"sbjianxiong",
                        trigger: {
                            global: "phaseEnd",
                        },
                        forced: true,
                        filter(event, player) {
                            return player.getExpansions('xinfan_zhiyuan_mark').length;
                        },
                        content() {
                            'step 0'
                            player
                                .chooseCardButton(1, '选择获得一张"志"', true, player.getExpansions('xinfan_zhiyuan_mark'))
                                .set('ai', () => {
                                    return true;
                                });
                            'step 1'
                            if (result.links) player.gain(result.links, 'gain2')
                        },
                        sub: true,
                        sourceSkill: "xinfan_zhiyuan",
                        
                    },
                },
             
            },
            xinfan_haina: {
            audio: "sbhujia",
                priority: 3,
                trigger: {
                    player: "damageEnd",
                },
                content: function () {
                    'step 0'
                    if (trigger.cards.length) player.gain(trigger.cards);
                    if (!player.getExpansions('xinfan_zhiyuan_mark').length) event.finish();
                    'step 1'
                    player
                        .chooseCardButton(1, '选择获得一张"志"', true, player.getExpansions('xinfan_zhiyuan_mark'))
                        .set('ai', () => {
                            return true;
                        });
                    'step 2'
                    if (result.links) player.gain(result.links, 'gain2')
                },
                forced: true,
                group: ["xinfan_haina_gain"],
                subSkill: {
                    gain: {
                        priority: 2,
                        forced: true,
                       audio:"sbhujia",
                        trigger: {
                            player: "gainEnd",
                        },
                        filter(event, player) {
                            if (['wugu', 'draw'].includes(event.parent.name)) return false;
                            if (event.animate == 'draw') return false;
                            return event.cards.length > 0;
                        },
                        content() {
                            'step 0'
                            player.chooseCard(`海纳:展示获得牌中的一张`, card => _status.event.getTrigger().cards.includes(card), true);
                            'step 1'
                            if (result.cards) {
                                player.showCards(result.cards);
                                const type = get.type2(result.cards[0]);
                                const card = get.cardPile(i => get.type2(i) == type);
                                if (card) {
                                    player.showCards(card);
                                    player.gain(card, 'draw');
                                }
                            }
                        },
                        sub: true,
                        sourceSkill: "xinfan_haina",
                      
                    },
                },
              
            },


            //异戒神将
                //侠隐江湖-宇智波佐助
xinfa_xiazyanhuang: {
        audio: "ext:阴阳师杀/fenbao/yjsj/juesebao/xiayuzhibozuozhu:2",
        getViewAs(player) {
            let name = "sha", nature = "fire";
            var history = player.getHistory("useCard");
            if (history.length < 1) {
                return { name: name, nature: nature };
            }
            var evt = history[history.length - 1];
            if (get.type2(evt.card) == "basic") {
                nature = "thunder";
            } else if (get.type2(evt.card) == "trick") {
                name = "juedou";
                nature = null;
            }
            return { name: name, nature: nature };
        },
        enable: "chooseToUse",
        usable: 1,
        onChooseToUse(event) {
            if (game.online || event.xinfa_xiazyanhuang) {
                return;
            }
            const player = event.player;
            const info = get.info("xinfa_xiazyanhuang").getViewAs(player);
            event.set("xinfa_xiazyanhuang", info);
        },
        viewAs(cards, player) {
            const event = _status.event;
            const info = event.xinfa_xiazyanhuang;
            if (!info) {
                return null;
            }
            return { name: info.name, nature: info.nature };
        },
        filter(event, player) {
            const info = event.xinfa_xiazyanhuang;
            if (!info) {
                return false;
            }
            const card = new lib.element.VCard({ name: info.name, nature: info.nature });
            return event.filterCard(
              card,
              player,
              event
            );
        },
        filterCard: () => false,
        selectCard: -1,
        prompt() {
            const player = _status.event.player;
            const info = get.info("xinfa_xiazyanhuang").getViewAs(player);
            const card = new lib.element.VCard({ name: info.name, nature: info.nature });
            return `每回合限一次，你可以视为使用一张${get.translation(card)}。`;
        },
        log: false,
        async precontent(event, trigger, player) {
            const card = event.result.card;
            if (card.name == "sha" && card.nature == "fire") {
                player.logSkill("xinfa_xiazyanhuang", null, null, null, [1]);
            } else if (card.name == "sha" && card.nature == "thunder") {
                player.logSkill("xinfa_xiazyanhuang", null, null, null, [2]);
            } else {
                player.logSkill("xinfa_xiazyanhuang", null, null, null, [3]);
            }
        },
        hiddenCard(player, name) {
            const info = get.info("xinfa_xiazyanhuang").getViewAs(player);
            return name == info.name;
        },
        ai: {
            order: 12,
            respondShan: true,
            respondSha: true,
            skillTagFilter(player, tag, arg) {
                if (arg == "respond") return false;
                const name = (tag == "respondSha" ? "sha" : "shan");
                return get.info("xinfa_xiazyanhuang").viewAs(null, player).name == name;
            },
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
    },
    xinfa_xiazyujie: {
        audio: "ext:阴阳师杀/fenbao/yjsj/juesebao/xiayuzhibozuozhu:2",
        getViewAs(player) {
            let name = "shan", nature = null;
            var history = player.getHistory("useCard");
            if (history.length < 1) {
                return { name: name, nature: nature };
            }
            var evt = history[history.length - 1];
            if (get.type2(evt.card) == "basic") {
                name = "tao";
            } else if (get.type2(evt.card) == "trick") {
                name = "wuzhong";
            }
            return { name: name, nature: nature };
        },
        enable: "chooseToUse",
        usable: 1,
        onChooseToUse(event) {
            if (game.online || event.xinfa_xiazyujie) {
                return;
            }
            const player = event.player;
            const info = get.info("xinfa_xiazyujie").getViewAs(player);
            event.set("xinfa_xiazyujie", info);
        },
        viewAs(cards, player) {
            const event = _status.event;
            const info = event.xinfa_xiazyujie;
            if (!info) {
                return null;
            }
            return { name: info.name, nature: info.nature };
        },
        filter(event, player) {
            const info = event.xinfa_xiazyujie;
            if (!info) {
                return false;
            }
            const card = new lib.element.VCard({ name: info.name, nature: info.nature });
            return event.filterCard(
              card,
              player,
              event
            );
        },
        filterCard: () => false,
        selectCard: -1,
        prompt() {
            const player = _status.event.player;
            const info = get.info("xinfa_xiazyujie").getViewAs(player);
            const card = new lib.element.VCard({ name: info.name, nature: info.nature });
            return `每回合限一次，你可以视为使用一张${get.translation(card)}。`;
        },
        hiddenCard(player, name) {
            const info = get.info("xinfa_xiazyujie").getViewAs(player);
            return name == info.name;
        },
        ai: {
            order: 12,
            respondShan: true,
            respondSha: true,
            skillTagFilter(player, tag, arg) {
                if (arg == "respond") return false;
                const name = (tag == "respondSha" ? "sha" : "shan");
                return get.info("xinfa_xiazyujie").viewAs(null, player).name == name;
            },
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
    },
    xinfa_xiazjingzhe: {
        audio: "ext:阴阳师杀/fenbao/yjsj/juesebao/xiayuzhibozuozhu:2",
        getViewAs(player) {
            let name = "wuxie", nature = null;
            var history = player.getHistory("useCard");
            if (history.length < 1) {
                return { name: name, nature: nature };
            }
            var evt = history[history.length - 1];
            if (get.type2(evt.card) == "basic") {
                name = "jiu";
            } else if (get.type2(evt.card) == "trick") {
                name = "guohe";
            }
            return { name: name, nature: nature };
        },
        enable: "chooseToUse",
        usable: 1,
        onChooseToUse(event) {
            if (game.online || event.xinfa_xiazjingzhe) {
                return;
            }
            const player = event.player;
            const info = get.info("xinfa_xiazjingzhe").getViewAs(player);
            event.set("xinfa_xiazjingzhe", info);
        },
        viewAs(cards, player) {
            const event = _status.event;
            const info = event.xinfa_xiazjingzhe;
            if (!info) {
                return null;
            }
            return { name: info.name, nature: info.nature };
        },
        filter(event, player) {
            const info = event.xinfa_xiazjingzhe;
            if (!info) {
                return false;
            }
            const card = new lib.element.VCard({ name: info.name, nature: info.nature });
            return event.filterCard(
              card,
              player,
              event
            );
        },
        filterCard: () => false,
        selectCard: -1,
        prompt() {
            const player = _status.event.player;
            const info = get.info("xinfa_xiazjingzhe").getViewAs(player);
            const card = new lib.element.VCard({ name: info.name, nature: info.nature });
            return `每回合限一次，你可以视为使用一张${get.translation(card)}。`;
        },
        hiddenCard(player, name) {
            const info = get.info("xinfa_xiazjingzhe").getViewAs(player);
            return name == info.name;
        },
        ai: {
            order: 12,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
    },
    xinfan_xiazbianzhen: {
        audio: "ext:阴阳师杀/fenbao/yjsj/juesebao/xiayuzhibozuozhu:2",
        trigger: {
            player: ["logSkill","useSkillAfter"],
        },
        direct: true,
        filter(event, player) {
            if (["global", "equip"].includes(event.type)) {
                return false;
            }
            const skill = get.sourceSkillFor(event);
            if (!skill || skill == "xinfan_xiazbianzhen") {
                return false;
            }
            const info2 = get.info(skill);
            if (!info2 || info2.charlotte || info2.equipSkill) {
                return false;
            }
            return player.getOriginalSkills().includes(skill);
        },
        async content(event, trigger, player) {
            const next = player.chooseToUse({
                prompt: get.prompt2(event.name), 
                filterCard(card) {
                    const player = get.player(),
                        trigger = get.event().getTrigger(),
                        number = get.number(trigger.card);
                    if (!lib.filter.cardEnabled(card, _status.event.player, _status.event)) {
                        return false;
                    }
                    return true;
                }
            });
            next.set("addCount", false);
            next.set("logSkill", event.name);
            next.set("oncard", () => {
                const player = _status.event.player;
                player.addTempSkill("xinfan_xiazbianzhen_blocker");
            });
        },
        subSkill: {
            blocker: {
                init(player, skill) {
                  player.addSkillBlocker(skill);
                },
                onremove(player, skill) {
                  player.removeSkillBlocker(skill);
                },
                charlotte: true,
                locked: true,
                skillBlocker(skill, player) {
                  const skills2 = player.getStockSkills(true, true);
                  const info = get.info(skill);
                  return info && !info.charlotte && !info.persevereSkill && skills2.includes(skill);
                },
            },
        },
    },

    
};

export default skills;
