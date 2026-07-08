import { lib, game, ui, get, ai, _status } from '../../../noname.js';

//扩展预代码-大部分文件都在此处导入游戏
export async function precontent() {
	//武将包导入
	await import("../fenbao/yys/index.js");//武将包：阴阳师
	//await import("../fenbao/xingfan/index.js");//武将包：星繁
	//await import("../fenbao/wulie/index.js");//武将包：武烈
	
	//卡牌包导入
	//await import("../kapai/beta/index.js");
	
	//自定义机制/函数导入
	//自定义函数
	await import("../zidingyi/function.js");
	//导入自定义设置
	await import("../zidingyi/settle.js");
	//导入全局技能
	await import("../zidingyi/globalSkill.js");
	//导入buff
	await import("../zidingyi/buff.js");
    //导入Bgm
	await import("../zidingyi/Bgm.js");
	//导入其他机制格式相同
	//await import("../assets/xxx.js");
}
