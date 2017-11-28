'use strict';

import Chart from 'chart.js';
import outlabeledCharts from './outlabeledCharts'
import defaults from './defaults.js';

import classes from './classes.js';
import helpers from './helpers';


outlabeledCharts.init();

Chart.defaults.global.plugins.outlabels = defaults;

var LABEL_KEY = defaults.LABEL_KEY;

function configure(dataset, options) {
	var override = dataset.outlabels;
	var config = {};

	if (override === false) {
		return null;
	}
	if (override === true) {
		override = {};
	}

	return helpers.merge(config, [options, override]);
}

Chart.plugins.register({
	id: 'outlabels',

	resize: function(chart, size, options) {
		chart.sizeChanged = true;
	},

	afterDatasetUpdate: function(chart, args, options) {
		var labels = chart.config.data.labels;
		var dataset = chart.data.datasets[args.index];
		var config = configure(dataset, options);
		var display = config && config.display;
		var elements = args.meta.data || [];
		var ctx = chart.ctx;
		var el, label, percent, newLabel, context, i;

		ctx.save();

		for (i = 0; i < elements.length; ++i) {
			el = elements[i];
			label = el[LABEL_KEY];
			percent = dataset.data[i] / args.meta.total;
			newLabel = null;

			if (display && el && !el.hidden) {
				try {
					context = {
						chart: chart,
						dataIndex: i,
						dataset: dataset,
						labels: labels,
						datasetIndex: args.index,
						percent: percent
					};
					newLabel = new classes.OutLabel(el, i, ctx, config, context);
				} catch(e) {
					newLabel = null;
				}
			}

			if (
				label && 
				newLabel && 
				!chart.sizeChanged &&
				(label.label === newLabel.label) && 
				(label.encodedText === newLabel.encodedText)
			) {
				newLabel.offset = label.offset;
			}

			el[LABEL_KEY] = newLabel;
		}

		ctx.restore();
		chart.sizeChanged = false;
	},
	afterDatasetDraw: function(chart, args) {
		var elements = args.meta.data || [];
		var ctx = chart.ctx;
		var el, label, index;

		for (var i = 0; i < 2 * elements.length; ++i) {
			index = i < elements.length ? i : i - elements.length;

			el = elements[index];
			label = el[LABEL_KEY];
			if (!label) {
				continue;
			}

			if (i < elements.length) {
				label.update(el._view, elements, i);
				label.drawLine(ctx);
			} else {
				label.draw(ctx);
			}
		}
	}
});
