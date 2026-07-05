import { lib, game, ui, get, ai, _status } from '../../noname.js';
import { precontent } from './daoru/precontent.js';
import { content } from './daoru/content.js';
import { Package } from './daoru/package.js';
import { config, help, files } from './daoru/config.js';
import update from './daoru/update.js';

export let type = 'extension';

export default async function () {
	return {
		name: "阴阳师杀",
		editable: false,
		content: content,
		precontent: precontent,
		config: config,
		help: help,
		package: Package,
		files: files,
	};
}