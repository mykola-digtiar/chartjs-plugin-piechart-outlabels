const pkg = require('./package.json');

const banner = `/*!
 * ` + pkg.name + `
 * http://chartjs.org/
 * Version: ` + pkg.version + `
 *
 * Copyright ` + (new Date().getFullYear()) + ` Neckster
 * Released under the MIT license
 * https://github.com/Neckster/` + pkg.name + `/blob/master/LICENSE
 */`;

export default {
	input: 'src/plugin.js',
	file: 'dist/' + pkg.name + '.js',
	banner: banner,
	format: 'umd',
	external: [
		'chart.js'
	],
	globals: {
		'chart.js': 'Chart'
	}
};
