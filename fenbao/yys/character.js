import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

const characters = {
//阴阳师
//神启荒
xinfan_shenqihuang: ["male", "qun",4,["xinfan_qishenqi","xinfan_qimingding","xinfan_qixinggui"], ["ext:阴阳师杀/fenbao/yys/juesebao/shenqihuang/xinfan_shenqihuang.jpg"]],

//千姬
xinfan_qianji: ["female", "qun",4,["xinfan_chaoge","xinfan_ningshuang"], ["ext:阴阳师杀/fenbao/yys/juesebao/qianji/xinfan_qianji.jpg"]],

//心友犬神
xinfan_xinyouquanshen: ["male", "qun",4,["xinfan_xinyou","xinfan_shouhu","xinfan_youli"], ["ext:阴阳师杀/fenbao/yys/juesebao/xinyouquanshen/xinfan_xinyouquanshen.jpg"]],

//铃鹿御前
xinfan_lingluyuqian: ["female", "qun","3/3/2",["xinfan_lulanggui","xinfan_luyili"], ["ext:阴阳师杀/fenbao/yys/juesebao/lingluyuqian/xinfan_lingluyuqian.jpg"]],

//缚骨清姬
xinfan_fuguqingji: ["female", "qun",4,["xinfan_qingchanxin","xinfan_qingshigu","xinfan_qingjianggu"], ["ext:阴阳师杀/fenbao/yys/juesebao/fuguqingji/xinfan_fuguqingji.jpg"]],

//龙珏
xinfan_longjue: ["female", "qun",4,["xinfan_longcuijian","xinfan_longlongxi"], ["ext:阴阳师杀/fenbao/yys/juesebao/longjue/xinfan_longjue.jpg"]],

//紧那罗
xinfan_jinnaluo: ["female", "qun",5,["xinfan_jinzouxu","xinfan_jinyayin"], ["ext:阴阳师杀/fenbao/yys/juesebao/jinnaluo/xinfan_jinnaluo.jpg"]],

//鬼切
xinfan_guiqie: ["male", "qun",4,["xinfan_guijianshan","xinfan_guiguiren"], ["ext:阴阳师杀/fenbao/yys/juesebao/guiqie/xinfan_guiqie.jpg"]],

//鬼童丸
xinfan_guitongwan: ["male", "qun",3,["xinfan_guiyueyin","xinfan_guihaisuo","xinfan_guikuanglie"], ["ext:阴阳师杀/fenbao/yys/juesebao/guitongwan/xinfan_guitongwan.jpg"]],

//寻森小鹿男
xinfan_xunsenxiaolunan: ["male", "qun",5,["xinfan_lusenxin","xinfan_lusenqi"], ["ext:阴阳师杀/fenbao/yys/juesebao/xunsenxiaolunan/xinfan_xunsenxiaolunan.jpg"]],

//帝释天
xinfan_dishitian: ["male", "qun",5,["xinfan_dizhanfang","xinfan_dilianhua","xinfan_dijinlian"], ["ext:阴阳师杀/fenbao/yys/juesebao/dishitian/xinfan_dishitian.jpg"]],

//源赖光
xinfan_yuanlaiguang: ["male", "qun",4,["xinfan_guangxueqi","xinfan_guangbuwu","xinfan_guangzhuijiao"], ["ext:阴阳师杀/fenbao/yys/juesebao/yuanlaiguang/xinfan_yuanlaiguang.jpg"]],

//茨木童子
xinfan_cimutongzi: ["male", "qun",4,["xinfan_cihaoyi","xinfan_ciqiannu"], ["ext:阴阳师杀/fenbao/yys/juesebao/cimutongzi/xinfan_cimutongzi.jpg"]],

//天韧剑心鬼切
xinfan_tianrenjianxinguiqie: ["male", "qun",4,["xinfan_qietianren","xinfan_qieduane"], ["ext:阴阳师杀/fenbao/yys/juesebao/tianrenjianxinguiqie/xinfan_tianrenjianxinguiqie.jpg"]],

//初翎山风
xinfan_chulingshanfeng: ["male", "qun","3/3/2",["xinfan_shanchuling","xinfan_shanxunyu"], ["ext:阴阳师杀/fenbao/yys/juesebao/chulingshanfeng/xinfan_chulingshanfeng.jpg"]],

//蝉冰雪女
xinfan_chanbingxuenv: ["female", "qun","3/3/1",["xinfan_xueyongdong","xinfan_xueshuanghan","xinfan_xuechungao"], ["ext:阴阳师杀/fenbao/yys/juesebao/chanbingxuenv/xinfan_chanbingxuenv.jpg"]],

//祸津神
xinfan_huojinshen: ["female", "qun","3/3/1",["xinfan_huohuozhou","xinfan_huodaogao"], ["ext:阴阳师杀/fenbao/yys/juesebao/huojingshen/xinfan_huojinshen.jpg"]],

//神堕八岐大蛇
xinfan_shenduobaqidashe: ["male", "qun",4,["xinfan_sheqiying","xinfan_shezhongyan"], ["ext:阴阳师杀/fenbao/yys/juesebao/shenduobaqidashe/xinfan_shenduobaqidashe.jpg"]],

//巫女之怨
xinfan_wunvzhiyuan: ["female", "qun",2,["xinfan_shebeiming","xinfan_shejishen"], ["ext:阴阳师杀/fenbao/yys/juesebao/wunvzhiyuan/xinfan_wunvzhiyuan.jpg"]],

//荒骷髅
xinfan_huangkulou: ["male", "qun",4,["xinfan_kuhaixi","xinfan_kuliehun","xinfan_kuzhanqi"], ["ext:阴阳师杀/fenbao/yys/juesebao/huangkulou/xinfan_huangkulou.jpg"]],

//雪御前
xinfan_xueyuqian: ["female", "qun",3,["xinfan_xueqianxue","xinfan_xuexuezhan","xinfan_xuelongli"], ["ext:阴阳师杀/fenbao/yys/juesebao/xueyuqian/xinfan_xueyuqian.jpg"]],

//须佐之男
xinfan_xuzuozhinan: ["male", "qun",4,["xinfan_xushenyou","xinfan_xushenfa"], ["ext:阴阳师杀/fenbao/yys/juesebao/xuzuozhinan/xinfan_xuzuozhinan.jpg"]],

//天羽羽斩
xinfan_tianyuyuzhan: ["male", "qun",2,["xinfan_xuxingjian"], ["ext:阴阳师杀/fenbao/yys/juesebao/tianyuyuzhan/xinfan_tianyuyuzhan.jpg"]],

//平将门
xinfan_pingjiangmen: ["male", "qun",5,["xinfan_pingluanzhen","xinfan_pingbudu","xinfan_pingjiaoyang"], ["ext:阴阳师杀/fenbao/yys/juesebao/pingjiangmen/xinfan_pingjiangmen.jpg"]],

//季
xinfan_ji: ["female", "qun",3,["xinfan_jisiji","xinfan_jiliuzhuan"], ["ext:阴阳师杀/fenbao/yys/juesebao/ji/xinfan_ji_chun.jpg"]],

//禅心云外镜
xinfan_chanxinyunwaijing: ["female", "qun",4,["xinfan_chanjiekong","xinfan_chanjingming"], ["ext:阴阳师杀/fenbao/yys/juesebao/chanxinyunwaijing/xinfan_chanxinyunwaijing.jpg"]],

//流光追月神
xinfan_liuguangzhuiyueshen: ["female", "qun",3,["xinfan_zhuiliuguang","xinfan_zhuiqiwu","xinfan_zhuininghui"], ["ext:阴阳师杀/fenbao/yys/juesebao/liuguangzhuiyueshen/xinfan_liuguangzhuiyueshen.jpg"]],

//空相面灵气
xinfan_kongxiangmianlingqi: ["female", "qun",3,["xinfan_miankongxiang","xinfan_mianweiwo"], ["ext:阴阳师杀/fenbao/yys/juesebao/kongxiangmianlingqi/xinfan_kongxiangmianlingqi_bai.jpg"]],

//骁浪荒川之主
xinfan_xiaolanghuangchuanzhizhu: ["male", "qun",4,["xinfan_chuanxiaolang","xinfan_chuanchuannu","xinfan_chuanyili"], ["ext:阴阳师杀/fenbao/yys/juesebao/xiaolanghuangchuanzhizhu/xinfan_xiaolanghuangchuanzhizhu.jpg"]],

//聆海金鱼姬
xinfan_linghaijinyuji: ["female", "qun",4,["xinfan_yulinghai","xinfan_yulingbo"], ["ext:阴阳师杀/fenbao/yys/juesebao/linghaijinyuji/xinfan_linghaijinyuji.jpg"]],

//言灵
xinfan_yanling: ["female", "qun",3,["xinfan_yanyuzui","xinfan_yankuangmo","xinfan_yanzhenyan"], ["ext:阴阳师杀/fenbao/yys/juesebao/yanling/xinfan_yanling.jpg"]],

//孔雀明王
xinfan_kongquemingwang: ["female", "qun",4,["xinfan_quemili","xinfan_quekaiping"], ["ext:阴阳师杀/fenbao/yys/juesebao/kongquemingwang/xinfan_kongquemingwang.jpg"]],

//伊邪娜美
xinfan_yixienamei: ["female", "qun",4,["xinfan_meifenzheng","xinfan_meichenlun"], ["ext:阴阳师杀/fenbao/yys/juesebao/yixienamei/xinfan_yixienamei.jpg"]],

//泷夜叉姬
xinfan_longyechaji: ["female", "qun",3,["xinfan_chalongyue","xinfan_chayueheng"], ["ext:阴阳师杀/fenbao/yys/juesebao/longyechaji/xinfan_longyechaji.jpg"]],

//月读
xinfan_yuedu: ["male", "qun",4,["xinfan_yuexvdan","xinfan_yuetianji","xinfan_yuehuoxing"], ["ext:阴阳师杀/fenbao/yys/juesebao/yuedu/xinfan_yuedu.jpg"]],

//本真三尾狐
xinfan_benzhensanweihu: ["female", "qun","3/3/3",["xinfan_huhuying","xinfan_hushexin","xinfan_hulinghe"], ["ext:阴阳师杀/fenbao/yys/juesebao/benzhensanweihu/xinfan_benzhensanweihu.jpg"]],

//稻荷神御馔津
xinfan_daoheshenyuzhuanjing: ["female", "qun",4,["xinfan_daofengmou","xinfan_daoriyao","xinfan_daoyueying"], ["ext:阴阳师杀/fenbao/yys/juesebao/daoheshenyuzhuanjing/xinfan_daoheshenyuzhuanjing.jpg"]],

//寻香行
xinfan_xunxiangxing: ["male", "qun",4,["xinfan_xunxiangyin","xinfan_xunmingxiang"], ["ext:阴阳师杀/fenbao/yys/juesebao/xunxiangxing/xinfan_xunxiangxing.jpg"]],

//因幡辉夜姬
xinfan_yinfanhuiyeji: ["female", "qun","3/3/2",["xinfan_fanyuanman","xinfan_fanyueying"], ["ext:阴阳师杀/fenbao/yys/juesebao/yinfanhuiyeji/xinfan_yinfanhuiyeji.jpg"]],

//追月神
xinfan_zhuiyueshen: ["female", "qun",3,["xinfan_zhuiqinghui","xinfan_zhuiyaoyue"], ["ext:阴阳师杀/fenbao/yys/juesebao/zhuiyueshen/xinfan_zhuiyueshen.jpg"]],

//辉夜姬
xinfan_huiyeji: ["female", "qun",5,["xinfan_huiyuejing","xinfan_huihuiye"], ["ext:阴阳师杀/fenbao/yys/juesebao/huiyeji/xinfan_huiyeji.jpg"]],

//葛叶
xinfan_geye: ["female", "qun",4,["xinfan_gehuanhua","xinfan_geheshou"], ["ext:阴阳师杀/fenbao/yys/juesebao/geye/xinfan_geye.jpg"]],

//封阳君
xinfan_fengyangjun: ["male", "qun",4,["xinfan_fengfengyang","xinfan_fengwangyue","xinfan_fengxunbu"], ["ext:阴阳师杀/fenbao/yys/juesebao/fengyangjun/xinfan_fengyangjun1.jpg"]],

//梦山白藏主
xinfan_mengshanbaizangzhu: ["male", "qun",4,["xinfan_baizhanmeng","xinfan_baiyushou","xinfan_baishanshi"], ["ext:阴阳师杀/fenbao/yys/juesebao/mengshanbaizangzhu/xinfan_mengshanbaizangzhu.jpg"]],

//鬼王酒吞童子
xinfan_guiwangjiutuntongzi: ["male", "qun",5,["xinfan_tunfentian","xinfan_tunguiwang","xinfan_tunnuyan"], ["ext:阴阳师杀/fenbao/yys/juesebao/guiwangjiutuntongzi/xinfan_guiwangjiutuntongzi.jpg"]],

//御怨般若
xinfan_yuyuanbore: ["male", "qun",5,["xinfan_boyuyuan","xinfan_bohenfan"], ["ext:阴阳师杀/fenbao/yys/juesebao/yuyuanbore/xinfan_yuyuanbore.jpg"]],

//不见岳
xinfan_bujianyue: ["male", "qun",4,["xinfan_bushanxing","xinfan_buguyue"], ["ext:阴阳师杀/fenbao/yys/juesebao/bujianyue/xinfan_bujianyue.jpg"]],

//歌留多
xinfan_geliuduo: ["female", "qun",4,["xinfan_gewuguang","xinfan_gehuayi","xinfan_geqingduan"], ["ext:阴阳师杀/fenbao/yys/juesebao/geliuduo/xinfan_geliuduo.jpg"]],

//修罗鬼童丸
xinfan_xiuluoguitongwan: ["male", "qun",5,["xinfan_guiluowang","xinfan_guishouyi","xinfan_xiuguikuanglie"], ["ext:阴阳师杀/fenbao/yys/juesebao/xiuluoguitongwan/xinfan_xiuluoguitongwan.jpg"]],

//卑弥呼
xinfan_beimihu: ["female", "qun",5,["xinfan_beirihui","xinfan_beirilun"], ["ext:阴阳师杀/fenbao/yys/juesebao/beimihu/xinfan_beimihu.jpg"]],

//时耀泷夜叉姬
xinfan_shiyaolongyechaji: ["female", "qun",4,["xinfan_chashiyao","xinfan_chalunzhuan","xinfan_chashiji"], ["ext:阴阳师杀/fenbao/yys/juesebao/shiyaolongyechaji/xinfan_shiyaolongyechaji.jpg"]],

//狐妖
xinfan_yaohu: ["male", "qun",4,["xinfan_hujuqi","xinfan_hukuanglan"], ["ext:阴阳师杀/fenbao/yys/juesebao/yaohu/xinfan_yaohu.jpg"]],

//酒吞童子
xinfan_jiutuntongzi: ["male", "qun",4,["xinfan_guikuangqi","xinfan_guikuangxiao","xinfan_guiguishen"], ["ext:阴阳师杀/fenbao/yys/juesebao/jiutuntongzi/xinfan_jiutuntongzi.jpg"]],

//海忍
xinfan_hairen: ["female", "qun",3,["xinfan_haiyingren","xinfan_haihuiren","xinfan_haiqianying"], ["ext:阴阳师杀/fenbao/yys/juesebao/hairen/xinfan_hairen.jpg"]],

//玉藻前
xinfan_yuzaoqian: ["male", "qun",4,["xinfan_yuduotian"], ["ext:阴阳师杀/fenbao/yys/juesebao/yuzaoqian/xinfan_yuzaoqian.jpg"]],


//武烈
	//烈黄盖
xinfan_liehuanggai: ["male", "wu", 4, ["xinfan_zhaxiang", "xinfan_kurou" ,"xinfan_renhuo"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liehuanggai.jpg"]],
    //烈张辽
xinfan_liezhangliao: ["male", "wei", 4, ["xinfan_tuxi",  "xinfan_kuibing",  "xinfan_wucuo"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liezhangliao.jpg"]],
    //烈张角
xinfan_liezhangjiao: ["male", "qun", 3, ["xinfan_jiaoyi",  "xinfan_xingdao","xinfan_zhangshi"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liezhangjiao.jpg"]],
    //烈王异
xinfan_liewangyi: ["female", "wei", 3, ["xinfan_liezhenlie", "xinfan_liemiji"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liewangyi.jpg"]],	
    //烈关羽
xinfan_lieguanyu: ["male","shu",  4, ["xinfan_zhonglun", "xinfan_aoyi"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_lieguanyu.jpg"]], 
    //烈姜维
xinfan_liejiangwei: ["male", "shu", 4, ["xinfan_weijian", "xinfan_kuzhi"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liejiangwei.jpg"]],
    //烈曹操
xinfan_liecaocao: ["male", "qun", 4, ["xinfan_kuaichou", "xinfan_jisi", "xinfan_fuji"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liecaocao.jpg"]],
    //烈徐庶
xinfan_liexvshu: ["male", "qun", 4, ["xinfan_yixing", "xinfan_renxia"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liexvshu.jpg"]],
    //烈赵云
xinfan_liezhaoyun: ["male", "shu", 4, ["xinfan_jvqi", "xinfan_nuzhan"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liezhaoyun.jpg"]],
    //烈袁绍
xinfan_lieyuanshao: ["male", "qun", 4, ["xinfan_lirui", "xinfan_shiya"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_lieyuanshao.jpg"]],
    //烈诸葛亮
xinfan_liezhugeliang: ["male", "shu", 7, ["xinfan_jieze", "xinfan_zhisheng"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liezhugeliang.jpg"]],  
    //烈庞统
xinfan_liepangtong: ["male", "shu", 3, ["xinfan_lianhuan", "xinfan_niepan"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liepangtong.jpg"]], 
    //烈高顺
xinfan_liegaoshun: ["male","qun",  4, ["xinfan_xianzhen", "xinfan_yongjue"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liegaoshun.jpg"]],
    //烈卧龙诸葛亮
xinfan_liewolongzhugeliang: ["male", "shu", 3, ["xinfan_liangtianshu", "xinfan_liangqihe"], ["ext:阴阳师杀/fenbao/yys/juesebao/wulie/xinfan_liewolongzhugeliang.jpg"]], 

//星繁
//星孙坚
xinfan_xingsunjian: ["male", "wu", 4, ["xinfan_yinghun"],["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingsunjian.jpg"]],

//星曹操
xinfan_xingcaocao: ["male", "qun", 4, ["xinfan_zhiyuan", "xinfan_haina"],["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingcaocao.jpg"]],

//星黄月英
xinfan_xinghuangyueying: ["female", "qun", 3, ["xinfan_lingdong", "xinfan_lingqiao"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xinghuangyueying.jpg"]],

//星司马懿
xinfan_xingsimayi: ["male", "wei", 3, ["xinfan_yingshi", "xinfan_chengbing"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingsimayi.jpg"]],

//星曹仁
xinfan_xingcaoren: ["male", "wei", 4, ["xinfan_dingjun", "xinfan_jiyuan"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingcaoren.jpg"]],

//星姜维
xinfan_xingjiangwei: ["male", "shu", 4, ["xinfan_tiaoxin","xinfan_hemou","xinfan_zhiji"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingjiangwei.jpg"]],

//星赵云
xinfan_xingzhaoyun:["male","shu",4,["xinfan_qiangshi","xinfan_zhenjun","xinfan_youlong"],['doublegroup:qun:shu',"ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingzhaoyun.jpg"]], 

//星张春华
xinfan_xingzhangchunhua: ["female", "wei", 3, ["xinfan_jueqin", "xinfan_zhinian"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingzhangchunhua.jpg"]],

//星童渊
xinfan_xingtongyuan: ["male", "qun", 4, ["xinfan_bailian", "xinfan_cba", "xinfan_cad", "xinfan_cbd"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingtongyuan.jpg"]],

//星孙鲁班
xinfan_xingsunluban: ["female", "wu", 3, ["xinfan_fugu", "xinfan_gongfu"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingsunluban.jpg"]],

//星费祎
xinfan_xingfeiyi: ["male", "shu", 3, ["xinfan_huyuan", "xinfan_zhige"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingfeiyi.jpg"]],

//星钟会
xinfan_xingzhonghui: ["male", "wei", 4, ["xinfan_quanji", "xinfan_zili"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingzhonghui.jpg"]],

//星司马昭
xinfan_xingsimazhao: ["male", "wei", 4, ["xinfan_daigong", "xinfan_qiantun"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingsimazhao.jpg"]],

//星周仓
xinfan_xingzhoucang: ["male", "shu", "4/4/4", ["xinfan_zhongyong","xinfan_xiezhan"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingzhoucang.jpg"]],

//星卧龙凤雏
xinfan_xingwolongfengchu: ["male", "shu", "2/4/2", ["xinfan_longpo","xinfan_fengming","xinfan_huizhuan"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingwolongfengchu.jpg"]],

//星徐氏
xinfan_xingxushi: ["female", "wu", 3, ["xinfan_bugua", "xinfan_bixiong"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingxushi.jpg"]],

//星夏侯氏
xinfan_xingxiahoushi: ["female", "wei", 3, ["xinfan_degui", "xinfan_qiaoshi", "xinfan_yanyv"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingxiahoushi.jpg"]],

//星王异
xinfan_xingwangyi: ["female", "wei", 3, ["xinfan_zhenlie", "xinfan_miji"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingwangyi.jpg"]],

//星蔡文姬
xinfan_xingcaiwenji: ["female","wei",  3, ["xinfan_boyue", "xinfan_moshi"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingcaiwenji.jpg"]],

//星魏延
xinfan_xingweiyan:["male","shu",4,["xinfan_kuanggu","xinfan_yexi","xinfan_zhukou"],['doublegroup:qun:shu',"ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingweiyan.jpg"]],

//星于吉
xinfan_xingyuji: ["male", "qun", 3, ["xinfan_guanshi",  "xinfan_rushi"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingyuji.jpg"]],

//星诸葛果
xinfan_xingzhugeguo: ["female", "qun", 3, ["xinfan_chenyuan", "xinfan_chaotuo"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingzhugeguo.jpg"]],

//星周宣
xinfan_xingzhouxuan: ["male", "wei", 3, ["xinfan_wuwei", "xinfan_qingmeng"], ["ext:阴阳师杀/fenbao/yys/juesebao/xingfan/xinfan_xingzhouxuan.jpg"]],

//异戒神将
//侠隐江湖-宇智波佐助
xinfan_xiayuzhibozuozhu: ["male", "qun",4,["xinfa_xiazyanhuang","xinfa_xiazyujie","xinfa_xiazjingzhe","xinfan_xiazbianzhen"], ["ext:阴阳师杀/fenbao/yys/juesebao/yjsj/xiayuzhibozuozhu/xinfan_xiayuzhibozuozhu.jpg"]],

};

export default characters;
