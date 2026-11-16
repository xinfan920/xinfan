import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

const cards = {
	//撒旦衍生牌
	//阿斯塔罗特的宣判
	cy_szbbyd_sdshenpan: {
        enable: true,
        fullimage: true,
    	fullskin: true,
    	type: 'trick',
    	derivation: 'cy_szbbyd_chuanshuosadan',
        recastable: true,
        filterTarget(card, player, target) {
            const event = get.event();
            return player != target
                && player.countCards('h', card => lib.filter.cardDiscardable(card, player, event)) >= target.hp - 1;
        },
        async content({ target, card }, trigger, player) {
            const num = target.hp - 1;
            const { result: { bool } = {} } = await player.chooseToDiscard('he', [num, Infinity], `弃置至少${get.cnNumber(num)}张牌对${get.translation(target)}造成${num}点伤害`);
            if (bool) {
                if (num > 0) await target.damage(num, get.nature(card));
                if (player.countMark('cy_szbbyd_csjizui') < 3) await player.damage(get.nature(card));
            };
        },
        ai: {
            basic: {
    			order: 9.2,
    			value: [4, 1],
    			useful: 3,
    		},
    		wuxie(target, card, player, viewer, status) {
    			if (get.attitude(viewer, player._trueMe || player) > 0) {
    				return 0;
    			};
    			if (status * get.attitude(viewer, target) * get.effect(target, card, player, target) >= 0) {
    				return 0;
    			};
    		},
    		result: {
    			player(player, target) {
    				if (target.hp - 1 < 1) return 0;
    				return player.countMark('cy_szbbyd_csjizui') < 3 ? .5 : 1;
    			},
    			target(player, target) {
    			    const num = target.hp - 1;
    				if (num < 1) return 0;
    				if (player.countMark('cy_szbbyd_csjizui') < 3) return Math.min(0, -(num - 1));
    				return -num;
    			},
    		},
    		tag: {
    			damage: 1,
    			discard: 1
            }			
        }
    },
	//深渊之主的仆从
    cy_szbbyd_sdpucong: {
        enable: true,
        fullimage: true,
    	fullskin: true,
    	type: 'basic',
    	derivation: 'cy_szbbyd_chuanshuosadan',
    	global: 'g_cy_szbbyd_sdpucong',
    	toself: true,
    	selectTarget: -1,
    	filterTarget(card, player, target) {
    	    return target == player;
    	},
    	choiceList: [
    	    { 
    	        prompt: '获得1点护甲', 
    	        filter(event, player) {
    	            return player.hujia < 1;
    	        },
    	        async content({ target }, trigger, player) {
    	             await target.changeHujia(1);
    	        }
    	    },
    	    {
    	        prompt: '获得一枚“渊”标记，且若你未拥有技能“堕渊”则获得之',
    	        filter(event) {
    	            return !event.getParent(2).g_cy_szbbyd_sdpucong;
    	        },
    	        async content({ target }, trigger, player) {
    	            target.addMark('cy_szbbyd_csjizui');
    	            if (!target.hasSkill('cy_szbbyd_csduoyuan')) await player.addSkills('cy_szbbyd_csduoyuan');
    	        }
    	    }
    	],
    	async content(event, trigger, player) {
    	    const { target } = event;
    	    const { choiceList } = get.info({ name: 'cy_szbbyd_sdpucong' }) ?? {};
    	    if (choiceList) {
    	        const list = choiceList.filter(item => Reflect.apply(item.filter, item, [event, target]));
    	        if (list.length > 1) {
    	            const { result: { index } = {} } = await target.chooseControlList(list.map(item => item.prompt))
    	                .set('ai', () => {
    	                    const player = get.player();
    	                    if (!player.hasSkill('cy_szbbyd_csduoyuan')) return 1;
    	                    return get.rand(0, 1);
    	                });
    	            if (list[index]?.content) Reflect.apply(list[index].content, list[index], arguments);
    	        } else await Reflect.apply(list[0].content, list[0], arguments);
    	    };
    	},
    	ai: {
    	    order: 13,
    		useful: 6,
    		value: 6,
    		result: {
    			target: 1,
    		},
    		tag: {
    			hujia: 1,
    			skillMark: 1,
    			addSkill: 1
    		},
    	}
    },
	//沉默的魔将
    cy_szbbyd_sdmojiang: {
        enable: true,
        fullimage: true,
    	fullskin: true,
    	type: 'basic',
    	derivation: 'cy_szbbyd_chuanshuosadan',
    	filterTarget(card, player, target) {
    	    return target != player;
    	},
    	async content({ target, card }, trigger, player) {
    	    target.damage(get.nature(card));
    	},
    	ai: {
    	    order: 8,
    		useful: 7,
    		value: 8,
    		result: {
    			target: -1,
    		},
    		tag: {
    			damage: 1
            },
    	}
    },
	//边狱的邪祟
    cy_szbbyd_sdxiechong: {
        enable: true,
        fullimage: true,
    	fullskin: true,
    	type: 'trick',
    	derivation: 'cy_szbbyd_chuanshuosadan',
    	filterTarget(card, player, target) {
    	    return target.hasCard(card => lib.filter.canBeDiscarded(card, player, target), 'he');
    	},
    	async content(event, trigger, player) {
    	    await player.discardPlayerCard(event.target, 'he', true);
        
    	    const { filterTarget = () => true } = get.info({ name: 'cy_szbbyd_sdxiechong' });
    	    const { result: { targets } = {} } = await player.chooseTarget('请选择要弃置其牌的目标', filterTarget, target => {
    	        const att = get.attitude(get.player(), target._trueMe || target);
    	        if (att >= 0) return 0;
    	        return -att / target.countCards('he');
    	    });
        
    	    if (targets?.[0]) {
    	        player.line(targets[0], 'green');
    	        player.discardPlayerCard(targets[0], 'he', true);
    	    };
    	},
    	ai: {
    	    order: 14,
    		useful: 8,
    		value: 8,
    		result: {
    			target(player, target) {
    			    return -1 / target.countCards('he');
    			},
    		},
    		tag: {
    			loseCard: 1,
    		    discard: 1,
            },
    	}
    },

	//二妹衍生牌
	//新约·白之章
	cy_szbbyd_emxybaizhizhang:{
		fullskin: true,
		type: 'equip',
		subtype: 'equip5',
		distance: { globalTo: 1 },
		equipDelay: false,
		loseDelay: false,
		async onLose(event, trigger, player) {
			const card = game.createCard('cy_szbbyd_emxyheizhizhang', 'spade', 13);
			await player.equip(card);
			await player.draw('nodelay');
		},
		skills: ['cy_szbbyd_emxybaizhizhang'],
		ai: {
			basic: {
				equipValue: .1
			}
		}
	},
	//新约·黑之章
	cy_szbbyd_emxyheizhizhang:{
		fullskin: true,
		type: 'equip',
		subtype: 'equip5',
		distance: { globalFrom: -1 },
		equipDelay: false,
		loseDelay: false,
		async onLose(event, trigger, player) {
			const card = game.createCard('cy_szbbyd_emxybaizhizhang', 'heart', 1);
			await player.equip(card);
			
			const next = game.createEvent(get.id(), false);
			event.next.remove(next);
			event.getParent(2).next.push(next);
			next.player = player;
			next.setContent(async function (event, trigger, player) {
				const { result: { bool, targets } } = await player.chooseTarget(
					'弃置其他角色区域内一张牌',
					(card, player, target) => target != player && target.countDiscardableCards(player, 'hej'),
					target => get.effect(target, { name: 'guohe_copy' }, get.player(), get.player())
				);
				
				if (bool && targets) {
					player.line(targets, 'green');
					await player.discardPlayerCard(targets[0], true, 'hej');
				};
			});
		},
		skills: ['cy_szbbyd_emxyheizhizhang'],
		ai: {
			basic: {
				equipValue: .1
			}
		}
	},

	//以津真天衍生牌
	cy_bwp_huangjinyu:{
		type: "basic",
		global: "cy_bwp_huangjinyu_skill",
		fullskin: true,
		notarget: true,
	},
};

export default cards;