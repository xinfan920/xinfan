import { lib, game, ui, get, ai, _status } from '../../../noname.js';

//扩展预代码-大部分文件都在此处导入游戏
export async function precontent() {
	//武将评级
	lib.arenaReady.push(function () {
		//至臻
		const pj_prestige = [
			"xinfan_geye","xinfan_xiuluoguitongwan","xinfan_tianyuyuzhan","xinfan_wunvzhiyuan"
		];
		//传说 SSS
		var pj_sss = [
			"xinfan_shenduobaqidashe","xinfan_dishitian","xinfan_chulingshanfeng","xinfan_xunxiangxing","xinfan_zhuiyueshen","xinfan_huiyeji",
			"xinfan_liezhangjiao","xinfan_lieliuhong","xinfan_liehuanggai","xinfan_liezhaoyun","xinfan_liejiangwei",
			"xinfan_liegaoshun","xinfan_xingjiangwei","xinfan_xingsimayi","xinfan_xingcaocao","xinfan_xinghuangyueying","xinfan_xingyuji","xinfan_xingzhouxuan",
			"xinfan_xiayuzhibozuozhu"
		];
		//史诗 SS
		var pj_ss = [
			"xinfan_longjue","xinfan_lingluyuqian","xinfan_guitongwan","xinfan_xunsenxiaolunan","xinfan_yuanlaiguang",
			"xinfan_cimutongzi","xinfan_tianrenjianxinguiqie","xinfan_chanbingxuenv","xinfan_xueyuqian","xinfan_xuzuozhinan",
			"xinfan_pingjiangmen","xinfan_kongxiangmianlingqi","xinfan_kongquemingwang","xinfan_yixienamei","xinfan_benzhensanweihu",
			"xinfan_yinfanhuiyeji","xinfan_fengyangjun","xinfan_mengshanbaizangzhu","xinfan_guiwangjiutuntongzi","xinfan_bujianyue",
			"xinfan_beimihu","xinfan_liezhugeliang","xinfan_liecaocao","xinfan_liezhangliao","xinfan_liewolongzhugeliang","xinfan_xingsunluban",
			"xinfan_xingzhonghui","xinfan_xingfeiyi","xinfan_xingtongyuan","xinfan_xingzhugeguo","xinfan_xingzhaoyun","xinfan_xingzhoucang",
			"xinfan_xingxushi","xinfan_xingxiahoushi","xinfan_xingwangyi","xinfan_xingcaiwenji"
		];
		//精品 S
		var pj_s = [
			"xinfan_qianji","xinfan_shenqihuang","xinfan_xinyouquanshen","xinfan_fuguqingji","xinfan_jinnaluo","xinfan_guiqie",
			"xinfan_huojinshen","xinfan_huangkulou","xinfan_ji","xinfan_chanxinyunwaijing","xinfan_liuguangzhuiyueshen",
			"xinfan_xiaolanghuangchuanzhizhu","xinfan_linghaijinyuji","xinfan_yanling","xinfan_longyechaji","xinfan_yuedu",
			"xinfan_daoheshenyuzhuanjing","xinfan_yuyuanbore","xinfan_geliuduo","xinfan_shiyaolongyechaji","xinfan_yaohu","xinfan_jiutuntongzi",
			"xinfan_hairen","xinfan_yuzaoqian","xinfan_liexvshu","xinfan_liewangyi","xinfan_lieguanyu","xinfan_liepangtong","xinfan_xingzhangchunhua",
			"xinfan_xingcaoren","xinfan_xingweiyan","xinfan_xingsimazhao","xinfan_xingwolongfengchu","xinfan_xingsunjian"
		];
		//平凡
		var pj_a = ["xinfan_lieyuanshao"];

		lib.rank.rarity.prestige ??= [];
		lib.rank.rarity.prestige.addArray(pj_prestige);
		lib.translate.prestige = "至臻";
		const originalGetRarity = game.getRarity;
		game.getRarity = function (name) {
			if (lib.rank.rarity.prestige.includes(name)) return "prestige";
			return originalGetRarity.apply(this, arguments);
		};
		const originalCreateRarity = ui.create.rarity;
		ui.create.rarity = function (button) {
			if (game.getRarity(button.link) !== "prestige") {
				return originalCreateRarity.apply(this, arguments);
			}
			if (!lib.config.show_rarity) return;
			const intro = button.node.intro;
			intro.classList.add("showintro");
			// 与 REACGN 的至臻外观一致，直接设置标签样式以支持不同选将布局。
			intro.style.fontFamily = "yuanli";
			intro.style.fontSize = "16px";
			intro.style.bottom = "6px";
			intro.style.left = "6px";
			intro.style.textShadow = "rgb(200, 20, 20) 0px 0px 2px, rgb(200, 20, 20) 0px 0px 5px, rgb(200, 20, 20) 0px 0px 5px, rgb(200, 20, 20) 0px 0px 5px, black 0px 0px 1px";
			intro.dataset.nature = "prestigem";
			intro.textContent = get.translation("prestige");
		};

		for (var i = 0; i < pj_sss.length; i++) {
			lib.rank.rarity.legend.push(pj_sss[i]);
		}
		for (var i = 0; i < pj_ss.length; i++) {
			lib.rank.rarity.epic.push(pj_ss[i]);
		}
		for (var i = 0; i < pj_s.length; i++) {
			lib.rank.rarity.rare.push(pj_s[i]);
		}
		for (var i = 0; i < pj_a.length; i++) {
			lib.rank.rarity.junk.push(pj_a[i]);
		}
	});
	//武将包导入
	await import("../fenbao/yys/index.js");//武将包：阴阳师

	
	//卡牌包导入
	//await import("../kapai/index.js");
	
	//自定义机制/函数导入
	//自定义函数
	await import("../zidingyi/function.js");
	//导入自定义设置
	await import("../zidingyi/settle.js");
	//导入全局技能
	await import("../zidingyi/globalSkill.js");
	//导入Yuhun
	await import("../zidingyi/Yuhun.js");
    //导入Bgm
	await import("../zidingyi/Bgm.js");
	//导入其他机制格式相同
	//await import("../assets/xxx.js");
}
