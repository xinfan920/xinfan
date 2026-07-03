import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

const characters = {
	//烈黄盖
xinfan_liehuanggai: ["male", "wu", 4, ["xinfan_zhaxiang", "xinfan_kurou" ,"xinfan_renhuo"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liehuanggai.jpg"]],
    //烈张辽
xinfan_liezhangliao: ["male", "wei", 4, ["xinfan_tuxi",  "xinfan_kuibing",  "xinfan_wucuo"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liezhangliao.jpg"]],
    //烈张角
xinfan_liezhangjiao: ["male", "qun", 3, ["xinfan_jiaoyi",  "xinfan_xingdao","xinfan_zhangshi"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liezhangjiao.jpg"]],
    //烈王异
xinfan_liewangyi: ["female", "wei", 3, ["xinfan_liezhenlie", "xinfan_liemiji"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liewangyi.jpg"]],	
    //烈关羽
xinfan_lieguanyu: ["male","shu",  4, ["xinfan_zhonglun", "xinfan_aoyi"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_lieguanyu.jpg"]], 
    //烈姜维
xinfan_liejiangwei: ["male", "shu", 4, ["xinfan_weijian", "xinfan_kuzhi"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liejiangwei.jpg"]],
    //烈曹操
xinfan_liecaocao: ["male", "qun", 4, ["xinfan_kuaichou", "xinfan_jisi", "xinfan_fuji"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liecaocao.jpg"]],
    //烈徐庶
xinfan_liexvshu: ["male", "qun", 4, ["xinfan_yixing", "xinfan_renxia"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liexvshu.jpg"]],
    //烈赵云
xinfan_liezhaoyun: ["male", "shu", 4, ["xinfan_jvqi", "xinfan_nuzhan"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liezhaoyun.jpg"]],
    //烈袁绍
xinfan_lieyuanshao: ["male", "qun", 4, ["xinfan_lirui", "xinfan_shiya"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_lieyuanshao.jpg"]],
    //烈诸葛亮
xinfan_liezhugeliang: ["male", "shu", 7, ["xinfan_jieze", "xinfan_zhisheng"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liezhugeliang.jpg"]],  
    //烈庞统
xinfan_liepangtong: ["male", "shu", 3, ["xinfan_lianhuan", "xinfan_niepan"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liepangtong.jpg"]], 
    //烈高顺
xinfan_liegaoshun: ["male","qun",  4, ["xinfan_xianzhen", "xinfan_yongjue"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liegaoshun.jpg"]],
    //烈卧龙诸葛亮
xinfan_liewolongzhugeliang: ["male", "shu", 3, ["xinfan_liangtianshu", "xinfan_liangqihe"], ["ext:新繁/fenbao/wulie/juesebao/xinfan_liewolongzhugeliang.jpg"]], 
};

export default characters;