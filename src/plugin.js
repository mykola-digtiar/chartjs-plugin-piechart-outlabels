'use strict';

import Chart from 'chart.js';
import defaults from './defaults.js';

import classes from './classes.js';
import helpers from './helpers';

Chart.defaults.outlabeledPie = Chart.defaults.doughnut;

var custom = Chart.controllers.doughnut.extend({
	update: function(reset) {
		var me = this;
		var chart = me.chart;
		var chartArea = chart.chartArea;
		var opts = chart.options;
		var arcOpts = opts.elements.arc;
		var availableWidth = chartArea.right - chartArea.left - arcOpts.borderWidth;
		var availableHeight = chartArea.bottom - chartArea.top - arcOpts.borderWidth;
		var minSize = Math.min(availableWidth, availableHeight);
		var offset = {x: 0, y: 0};
		var meta = me.getMeta();
		var cutoutPercentage = opts.cutoutPercentage;
		var zoomOutPercentage = opts.zoomOutPercentage || 50;
		var circumference = opts.circumference;

		// If the chart's circumference isn't a full circle, calculate minSize as a ratio of the width/height of the arc
		if (circumference < Math.PI * 2.0) {
			var startAngle = opts.rotation % (Math.PI * 2.0);
			startAngle += Math.PI * 2.0 * (startAngle >= Math.PI ? -1 : startAngle < -Math.PI ? 1 : 0);
			var endAngle = startAngle + circumference;
			var start = {x: Math.cos(startAngle), y: Math.sin(startAngle)};
			var end = {x: Math.cos(endAngle), y: Math.sin(endAngle)};
			var contains0 = (startAngle <= 0 && endAngle >= 0) || (startAngle <= Math.PI * 2.0 && Math.PI * 2.0 <= endAngle);
			var contains90 = (startAngle <= Math.PI * 0.5 && Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 2.5 && Math.PI * 2.5 <= endAngle);
			var contains180 = (startAngle <= -Math.PI && -Math.PI <= endAngle) || (startAngle <= Math.PI && Math.PI <= endAngle);
			var contains270 = (startAngle <= -Math.PI * 0.5 && -Math.PI * 0.5 <= endAngle) || (startAngle <= Math.PI * 1.5 && Math.PI * 1.5 <= endAngle);
			var cutout = cutoutPercentage / 100.0;
			var min = {x: contains180 ? -1 : Math.min(start.x * (start.x < 0 ? 1 : cutout), end.x * (end.x < 0 ? 1 : cutout)), y: contains270 ? -1 : Math.min(start.y * (start.y < 0 ? 1 : cutout), end.y * (end.y < 0 ? 1 : cutout))};
			var max = {x: contains0 ? 1 : Math.max(start.x * (start.x > 0 ? 1 : cutout), end.x * (end.x > 0 ? 1 : cutout)), y: contains90 ? 1 : Math.max(start.y * (start.y > 0 ? 1 : cutout), end.y * (end.y > 0 ? 1 : cutout))};
			var size = {width: (max.x - min.x) * 0.5, height: (max.y - min.y) * 0.5};
			minSize = Math.min(availableWidth / size.width, availableHeight / size.height);
			offset = {x: (max.x + min.x) * -0.5, y: (max.y + min.y) * -0.5};
		}

		chart.borderWidth = me.getMaxBorderWidth(meta.data);
		chart.outerRadius = Math.max((minSize - chart.borderWidth) / 2, 0);
		chart.innerRadius = Math.max(cutoutPercentage ? (chart.outerRadius / 100) * (cutoutPercentage) : 0, 0);
		chart.radiusLength = (chart.outerRadius - chart.innerRadius) / chart.getVisibleDatasetCount();
		chart.offsetX = offset.x * chart.outerRadius;
		chart.offsetY = offset.y * chart.outerRadius;

		meta.total = me.calculateTotal();

		me.outerRadius = chart.outerRadius - (chart.radiusLength * me.getRingIndex(me.index));
		me.innerRadius = Math.max(me.outerRadius - chart.radiusLength, 0);

		me.outerRadius *= zoomOutPercentage / 100;
		me.innerRadius *= zoomOutPercentage / 100;

		Chart.helpers.each(meta.data, function(arc, index) {
			me.updateElement(arc, index, reset);
		});
	}
});

Chart.controllers.outlabeledPie = custom;


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
		if (options.font.resizable) {
			options.font.size = (size.height / 100) * 2.5;
			if(options.font.minSize && options.font.size < options.font.minSize) {
				options.font.size = options.font.minSize;
			}
			if(options.font.maxSize && options.font.size > options.font.maxSize) {
				options.font.size = options.font.maxSize;
			}
			options.font.changed = true;
		}
	},
	afterInit: function(chart, options) {
		var size = chart.canvas.style;
		if (options.font.resizable) {
			options.font.size = (size.height.slice(0, -2) / 100) * 2.5;
			if(options.font.minSize && options.font.size < options.font.minSize) {
				options.font.size = options.font.minSize;
			}
			if(options.font.maxSize && options.font.size > options.font.maxSize) {
				options.font.size = options.font.maxSize;
			}
		}
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
				!options.font.changed && 
				(label.label === newLabel.label) && 
				(label.encodedText === newLabel.encodedText)
			) {
				newLabel.offset = label.offset;
			}

			el[LABEL_KEY] = newLabel;
		}

		ctx.restore();

		if (options.font.changed) {
			options.font.changed = false;
		}
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
