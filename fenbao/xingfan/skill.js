import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

/** @type { importCharacterConfig['skill'] } */
const skills = {
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


};

export default skills;
