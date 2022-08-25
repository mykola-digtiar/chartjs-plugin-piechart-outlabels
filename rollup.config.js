const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * (c) 2017-${new Date().getFullYear()} ${pkg.name} contributors
 * Released under the ${pkg.license} license
 */`;

const fileName = pkg.name.split('/').at(-1);

module.exports = [
  {
    input: 'src/plugin.js',
    output: ['.js', '.min.js'].map((suffix) => {
      const config = {
        name: 'ChartPieChartOutlabels',
        file: `dist/${fileName}${suffix}`,
        banner: banner,
        format: 'umd',
        indent: false,
        plugins: [],
        globals: {
          'chart.js': 'Chart',
          'chart.js/helpers': 'Chart.helpers'
        }
      };

      if (suffix.match(/\.min\.js$/)) {
        config.plugins.push(
          terser({
            output: {
              comments: /^!/
            }
          })
        );
      }

      return config;
    }),
    external: [
      'chart.js',
      'chart.js/helpers',
    ]
  },
  {
    input: 'src/plugin.js',
    output: {
      file: pkg.module,
      banner: banner,
      format: 'esm',
      indent: false
    },
    external: [
      'chart.js',
      'chart.js/helpers',
    ]
  },
];
