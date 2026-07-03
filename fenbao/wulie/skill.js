import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

/** @type { importCharacterConfig['skill'] } */
const skills = {
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
              check: function (event,player){
                 return get.attitude(player,event.player)<0;
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
                      
};

export default skills;
