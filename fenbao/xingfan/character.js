import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

const characters = {

//星孙坚
xinfan_xingsunjian: ["male", "wu", 4, ["xinfan_yinghun"],["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingsunjian.jpg"]],

//星曹操
xinfan_xingcaocao: ["male", "qun", 4, ["xinfan_zhiyuan", "xinfan_haina"],["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingcaocao.jpg"]],

//星黄月英
xinfan_xinghuangyueying: ["female", "qun", 3, ["xinfan_lingdong", "xinfan_lingqiao"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xinghuangyueying.jpg"]],

//星司马懿
xinfan_xingsimayi: ["male", "wei", 3, ["xinfan_yingshi", "xinfan_chengbing"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingsimayi.jpg"]],

//星曹仁
xinfan_xingcaoren: ["male", "wei", 4, ["xinfan_dingjun", "xinfan_jiyuan"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingcaoren.jpg"]],

//星姜维
xinfan_xingjiangwei: ["male", "shu", 4, ["xinfan_tiaoxin","xinfan_hemou","xinfan_zhiji"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingjiangwei.jpg"]],

//星赵云
xinfan_xingzhaoyun:["male","shu",4,["xinfan_qiangshi","xinfan_zhenjun","xinfan_youlong"],['doublegroup:qun:shu',"ext:新繁/fenbao/xingfan/juesebao/xinfan_xingzhaoyun.jpg"]], 

//星张春华
xinfan_xingzhangchunhua: ["female", "wei", 3, ["xinfan_jueqin", "xinfan_zhinian"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingzhangchunhua.jpg"]],

//星童渊
xinfan_xingtongyuan: ["male", "qun", 4, ["xinfan_bailian", "xinfan_cba", "xinfan_cad", "xinfan_cbd"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingtongyuan.jpg"]],

//星孙鲁班
xinfan_xingsunluban: ["female", "wu", 3, ["xinfan_fugu", "xinfan_gongfu"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingsunluban.jpg"]],

//星费祎
xinfan_xingfeiyi: ["male", "shu", 3, ["xinfan_huyuan", "xinfan_zhige"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingfeiyi.jpg"]],

//星钟会
xinfan_xingzhonghui: ["male", "wei", 4, ["xinfan_quanji", "xinfan_zili"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingzhonghui.jpg"]],

//星司马昭
xinfan_xingsimazhao: ["male", "wei", 4, ["xinfan_daigong", "xinfan_qiantun"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingsimazhao.jpg"]],

//星周仓
xinfan_xingzhoucang: ["male", "shu", "4/4/4", ["xinfan_zhongyong","xinfan_xiezhan"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingzhoucang.jpg"]],

//星卧龙凤雏
xinfan_xingwolongfengchu: ["male", "shu", "2/4/2", ["xinfan_longpo","xinfan_fengming","xinfan_huizhuan"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingwolongfengchu.jpg"]],

//星徐氏
xinfan_xingxushi: ["female", "wu", 3, ["xinfan_bugua", "xinfan_bixiong"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingxushi.jpg"]],

//星夏侯氏
xinfan_xingxiahoushi: ["female", "wei", 3, ["xinfan_degui", "xinfan_qiaoshi", "xinfan_yanyv"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingxiahoushi.jpg"]],

//星王异
xinfan_xingwangyi: ["female", "wei", 3, ["xinfan_zhenlie", "xinfan_miji"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingwangyi.jpg"]],

//星蔡文姬
xinfan_xingcaiwenji: ["female","wei",  3, ["xinfan_boyue", "xinfan_moshi"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingcaiwenji.jpg"]],

//星魏延
xinfan_xingweiyan:["male","shu",4,["xinfan_kuanggu","xinfan_yexi","xinfan_zhukou"],['doublegroup:qun:shu',"ext:新繁/fenbao/xingfan/juesebao/xinfan_xingweiyan.jpg"]],

//星于吉
xinfan_xingyuji: ["male", "qun", 3, ["xinfan_guanshi",  "xinfan_rushi"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingyuji.jpg"]],

//星诸葛果
xinfan_xingzhugeguo: ["female", "qun", 3, ["xinfan_chenyuan", "xinfan_chaotuo"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingzhugeguo.jpg"]],

//星周宣
xinfan_xingzhouxuan: ["male", "wei", 3, ["xinfan_wuwei", "xinfan_qingmeng"], ["ext:新繁/fenbao/xingfan/juesebao/xinfan_xingzhouxuan.jpg"]],

};

export default characters;