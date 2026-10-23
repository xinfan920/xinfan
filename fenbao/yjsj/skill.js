import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

/** @type { importCharacterConfig['skill'] } */
const skills = {
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
        viewAs(cards, player) {
            const info = get.info("xinfa_xiazyanhuang").getViewAs(player);
            if (!info) {
                return null;
            }
            return { name: info.name, nature: info.nature };
        },
        filter(event, player) {
            const info = get.info("xinfa_xiazyanhuang").getViewAs(player);
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
        viewAs(cards, player) {
            const info = get.info("xinfa_xiazyujie").getViewAs(player);
            if (!info) {
                return null;
            }
            return { name: info.name, nature: info.nature };
        },
        filter(event, player) {
            const info = get.info("xinfa_xiazyujie").getViewAs(player);
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
        viewAs(cards, player) {
            const info = get.info("xinfa_xiazjingzhe").getViewAs(player);
            if (!info) {
                return null;
            }
            return { name: info.name, nature: info.nature };
        },
        filter(event, player) {
            const info = get.info("xinfa_xiazjingzhe").getViewAs(player);
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
