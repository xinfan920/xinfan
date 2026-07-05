import { lib, game, ui, get, ai, _status } from "../../../../noname.js";

const characters = {

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


};

export default characters;
