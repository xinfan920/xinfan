import { lib, game, ui, get, ai, _status } from "../../../noname.js";
import update from '../daoru/update.js';
//扩展设置
export const config = {
	"xinfan_Yuhun": {
		name: `<font color="#E661A0">开启 御魂<small>(下局生效)`,
		init: false,
		intro: `开启御魂后，游戏开始时，所有角色依次选择一个御魂(技能)获得<br>下局游戏生效`,
	},
    "xinfan_bgm": {
				name: `<font color="#e91e63">专属BGM<small>(下局生效)`,
				init: true,
				intro: "场上存在本扩展角色时是否播放BGM<br><small>(下局生效)</small><br>开启后，部分的角色的角色曲将会加入背景BGM<small>(重启2次生效)",
	},
			update_source: {
				name: `<font color="#9c27b0">更新镜像源`,
				init: "0",
				item: {
					0: "扩展官方源",
					1: "GitHub官方源",
					2: "gh-proxy全球镜像",
					3: "gh-proxy国内镜像",
					4: "tvv.tw镜像源",
				}
			},
			update_method: {
				name: `<font color="#2196f3">极速更新`,
				init: false,
				intro: "开启后，在线更新将跳过音频、视频和图片等大文件，仅更新 .js 和 .css 代码文件，显著加快更新速度。",
			},
			auto_update: {
				name: `<font color="#e91e63">自动检测更新`,
				init: true,
				intro: "启动游戏时自动检查更新",
			},
			check_update: {
				name: `<span style="color:#4caf50;text-decoration: underline">检查更新`,
				clear: true,
				onclick: async function () {
					this.innerHTML = `<span style="color:#f61515ff;text-decoration: underline">正在检测更新...`;
					try {
						await update(true);
						this.innerHTML = `<span style="color:#4caf50;text-decoration: underline">更新完成`;
					} catch {
						this.innerHTML = `<span style="color:#f44336;text-decoration: underline">更新失败`;
					}
					setTimeout(() => {
						this.innerHTML = `<span style="color:#4caf50;text-decoration: underline">检查更新`;
					}, 2000);
				}
			},
};

//帮助内容
export const help = {};

//资源文件
export const files = {
	character: [],
	card: [],
	skill: [],
};
