import { lib, game, ui, get, ai, _status } from '../../../noname.js'
import update from '../daoru/update.js';
//扩展主文件
//联机扩展一般不用设置
export async function content(config, pack) {
			//【更新说明】
			let xinfan_gengxin = [
				{
					type: "text",
					data: `○新增武将：`,
				},
				{
					type: "players", data: [
						"xinfan_beimihu",

					]
				},
				{
					type: "text",
					data: `○武将调整：`,
				},
				{
					type: "players", data: [
						"xinfan_pingjiangmen",
						"xinfan_huangkulou"
					]
				},
			];
			game.showExtensionChangeLog(xinfan_gengxin, "新繁");
			if (lib.config.extension_新繁_auto_update && navigator.onLine) update(false);
};