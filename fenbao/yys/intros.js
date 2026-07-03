import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

//武将介绍
const characterIntros = {
	
};

//武将称号
const characterTitles = {
    //cyhycq_zhulianaige_meilu:"珠泪哀歌",
};

//同名替换
const characterReplaces = {};

//动态技能描述
const dynamicTranslates = {
    xinfan_miankongxiang: function (player) {
        if (!player.storage.xinfan_miankongxiang) {
            return '转换技，当你不因此技能，使用牌指定目标或成为牌的目标时，改为，<span class="firetext">阳：来源视为对自己使用此牌。</span>阴：目标视为对自己使用此牌。';
        }
        return '转换技，当你不因此技能，使用牌指定目标或成为牌的目标时，改为，阳：来源视为对自己使用此牌。<span class="bluetext">阴：目标视为对自己使用此牌。</span>';
    },
        xinfan_yuexvdan: player => {
        if (player.storage.xinfan_yuexvdan) return '转换技，当你使用牌或成为牌的目标或造成伤害时或受到伤害时，若此牌或伤害，阳：有，<span class="bluetext">阴：没有，对应的实体牌则无效。</span>';
        return '转换技，当你使用牌或成为牌的目标或造成伤害时或受到伤害时，若此牌或伤害，<span class="firetext">阳：有，</span>阴：没有，<span class="firetext">对应的实体牌则无效。</span>';
    },
    xinfan_yuetianji: player => {
        if (player.storage.xinfan_yuetianji) return '转换技，每回合各限一次，你可以，阳：视为，<span class="bluetext">阴：获得并，使用一张基本牌或普通锦囊牌。</span>';
        return '转换技，每回合各限一次，你可以，<span class="firetext">阳：视为，</span>阴：获得并，<span class="firetext">使用一张基本牌或普通锦囊牌。</span>';
    },
    xinfan_yuehuoxing: player => {
        if (player.storage.xinfan_yuehuoxing) return '转换技，每回合一次，当你使用牌后，你可以转换，阳：“虚诞”，<span class="bluetext">阴：“天极”的阴阳形态。</span>';
        return '转换技，每回合一次，当你使用牌后，你可以转换，<span class="firetext">阳：“虚诞”， </span>阴：“天极”<span class="firetext">的阴阳形态。</span>';
    },
    xinfan_chichan : function (player) {
        const tre = player.storage.xinfan_yuanningRe ? '其他' : '“爱”';
        return `锁定技，你使用的[杀]无视防具。你对${tre}角色，使用[杀]/造成伤害时，额外结算一次/改为获得其等量体力值。每轮结束时，你视为对${tre == '其他' ? '一名' + tre : tre}角色使用一张[杀]。`;
    },    
};

//武将皮肤
const characterSubstitute = {};

export { characterIntros, characterTitles, characterReplaces, dynamicTranslates, characterSubstitute };
