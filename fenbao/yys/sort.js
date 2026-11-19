import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

const characterSort = {
	yys_lianji:["xinfan_qianji","xinfan_xinyouquanshen","xinfan_jinnaluo","xinfan_guiqie","xinfan_tianrenjianxinguiqie","xinfan_huojinshen","xinfan_huangkulou","xinfan_ji","xinfan_chanxinyunwaijing","xinfan_liuguangzhuiyueshen","xinfan_xiaolanghuangchuanzhizhu","xinfan_linghaijinyuji","xinfan_kongquemingwang","xinfan_yuedu","xinfan_huiyeji","xinfan_mengshanbaizangzhu","xinfan_yuyuanbore","xinfan_guiwangjiutuntongzi","xinfan_shiyaolongyechaji","xinfan_yaohu","xinfan_jiutuntongzi","xinfan_yuzaoqian","xinfan_liexvshu","xinfan_liepangtong","xinfan_xingzhangchunhua","xinfan_xingcaoren","xinfan_xingsimazhao","xinfan_xingsunjian"],
	yys_yys:["xinfan_shenqihuang","xinfan_qianji","xinfan_xinyouquanshen","xinfan_lingluyuqian","xinfan_fuguqingji","xinfan_longjue","xinfan_jinnaluo","xinfan_guiqie","xinfan_guitongwan","xinfan_xunsenxiaolunan","xinfan_dishitian","xinfan_yuanlaiguang","xinfan_cimutongzi","xinfan_tianrenjianxinguiqie","xinfan_chulingshanfeng","xinfan_chanbingxuenv","xinfan_huojinshen","xinfan_shenduobaqidashe","xinfan_huangkulou","xinfan_xueyuqian","xinfan_xuzuozhinan","xinfan_pingjiangmen","xinfan_ji","xinfan_chanxinyunwaijing","xinfan_liuguangzhuiyueshen","xinfan_kongxiangmianlingqi","xinfan_xiaolanghuangchuanzhizhu","xinfan_linghaijinyuji","xinfan_yanling","xinfan_kongquemingwang","xinfan_yixienamei","xinfan_longyechaji","xinfan_yuedu","xinfan_benzhensanweihu","xinfan_daoheshenyuzhuanjing","xinfan_xunxiangxing","xinfan_yinfanhuiyeji","xinfan_zhuiyueshen","xinfan_huiyeji","xinfan_geye","xinfan_fengyangjun","xinfan_mengshanbaizangzhu","xinfan_guiwangjiutuntongzi","xinfan_yuyuanbore","xinfan_bujianyue","xinfan_geliuduo","xinfan_beimihu","xinfan_shiyaolongyechaji","xinfan_yaohu","xinfan_jiutuntongzi","xinfan_hairen","xinfan_yuzaoqian"],
	yys_xingfan:["xinfan_xingsunjian","xinfan_xingcaocao","xinfan_xinghuangyueying","xinfan_xingsimayi","xinfan_xingcaoren","xinfan_xingjiangwei","xinfan_xingzhaoyun","xinfan_xingzhangchunhua","xinfan_xingtongyuan","xinfan_xingsunluban","xinfan_xingfeiyi","xinfan_xingzhonghui","xinfan_xingsimazhao","xinfan_xingzhoucang","xinfan_xingwolongfengchu","xinfan_xingxushi","xinfan_xingxiahoushi","xinfan_xingwangyi","xinfan_xingcaiwenji","xinfan_xingweiyan","xinfan_xingyuji","xinfan_xingzhugeguo","xinfan_xingzhouxuan"],
	yys_wulie:["xinfan_liehuanggai","xinfan_liezhangliao","xinfan_liezhangjiao","xinfan_liewangyi","xinfan_lieguanyu","xinfan_liejiangwei","xinfan_liecaocao","xinfan_liexvshu","xinfan_liezhaoyun","xinfan_lieyuanshao","xinfan_liezhugeliang","xinfan_liepangtong","xinfan_liegaoshun","xinfan_liewolongzhugeliang"],
	yys_yjsj:["xinfan_xiayuzhibozuozhu"],
	
};

const sortTranslate = {
	//武将包名
	// `${packName}_character_config`
	yys_character_config:"阴阳师",
	//分包翻译
	//yys_jialedi:"yys-迦勒底",
	yys_yys:"阴阳师",
	yys_xingfan:"星繁",
	yys_wulie:"武烈",
	yys_yjsj:"异戒神将",
	yys_lianji:"联机包",
};

export { characterSort, sortTranslate };
