import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

//导入角色包相关文件
//武将
import characters from "./character.js";
//武将技能
import skills from "./skill.js";
//武将和技能相关翻译
import translates from "./translate.js";
//技能配音
import voices from "./voices.js";
//分包及分包翻译
import { characterSort, sortTranslate } from "./sort.js";
//杂项（武将介绍·武将称号·同名替换·动态技能描述·武将皮肤）
import { characterIntros, characterTitles, characterReplaces, dynamicTranslates, characterSubstitute } from "./intros.js";

//导入武将包[wulieCharacter]
game.import("character", function () {
	const wulie = {
		name: "wulie",//武将包名
		connect: true,
		character: { ...characters },
		characterSort: {
			wulie: characterSort,//记得这里也要改
		},
		characterTitle: { ...characterTitles },
		characterSubstitute: { ...characterSubstitute },
		dynamicTranslate: { ...dynamicTranslates },
		characterIntro: { ...characterIntros },
		characterReplace: { ...characterReplaces },
		skill: { ...skills },
		translate: { ...translates, ...voices, ...sortTranslate },
	};
	//为未设置图片/阵亡语音的武将设置默认路径
	//for (const name in wulieCharacter.character) {//记得这里也要改
	//	const info = wulieCharacter.character[name];//记得这里也要改
		//使用数组的形式定义武将，则使用如下的形式：
	//	info[4].add(`img:extension/联机恒宇苍穹/image/character/影之世界/`+ name +`.jpg`);
	//	info[4].addArray(["die:true", "die:ext:联机恒宇苍穹/audio/影之世界/die:true"])
		//如果使用类的形式定义武将，则需要使用下面的格式
		/*
		info.img ??= `extension/恒宇苍穹神殿/image/character/szb/${name}.jpg`;
		info.dieAudios ??= [true, "ext:恒宇苍穹神殿/audio/szb/die:true"];
		*/
//	}
	return wulie;
});
