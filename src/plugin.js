'use strict';
import {defaults as ChartDefaults} from 'chart.js';
import customDefaults from './custom-defaults.js';

import classes from './classes.js';


ChartDefaults.plugins.outlabels = customDefaults;


var PLUGIN_KEY = customDefaults.PLUGIN_KEY;

function configure(dataset, options) {
  var override = dataset.outlabels;
  var config = {};

  if (override === false) {
    return null;
  }
  if (override === true) {
    override = {};
  }

  return Object.assign({}, config, options, override);

}

export default {
  id: 'outlabels',
  resize: function(chart) {
    chart.sizeChanged = true;
  },
  afterUpdate: (chart) => {
    const ctrl = chart._metasets[0].controller;
    var meta = ctrl.getMeta();

    var elements = meta.data || [];
    const rect = {
      x1: Infinity,
      x2: 0,
      y1: Infinity,
      y2: 0
    };
    elements.forEach((el, index) => {
      const outlabelPlugin = el[PLUGIN_KEY];
      if (!outlabelPlugin) {
        return;
      }

      outlabelPlugin.update(el, elements, index);
      const x = outlabelPlugin.labelRect.x + (!outlabelPlugin.labelRect.isLeft ? 0 : outlabelPlugin.labelRect.width);
      const y = outlabelPlugin.labelRect.y + (outlabelPlugin.labelRect.isTop ? -outlabelPlugin.labelRect.height : 0);
      if (x < rect.x1) {
        rect.x1 = x;
      }
      if (x > rect.x2) {
        rect.x2 = x;
      }
      if (y < rect.y1) {
        rect.y1 = y;
      }
      if (y > rect.y2) {
        rect.y2 = y;
      }
    });
    const maxXDiff = Math.max(...[
      chart.chartArea.left - rect.x1,
      rect.x2 - (chart.chartArea.width - chart.chartArea.left),
    ]);
    const diffX = maxXDiff > 0 ? maxXDiff : 0;
    const maxYDiff = Math.max(...[
      chart.chartArea.top - rect.y1,
      rect.y2 - (chart.chartArea.height - chart.chartArea.top),
    ]);
    const diffY = maxYDiff > 0 ? maxYDiff : 0;
    const diff = Math.max(diffX, diffY) * 2;

    var max = chart.options.zoomOutPercentage || customDefaults.zoomOutPercentage;

    ctrl.outerRadius -= Math.min(diff, max);
    ctrl.innerRadius = ctrl.outerRadius / 2;

    ctrl.updateElements(meta.data, 0, meta.data.length, 'resize');
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
      label = el[PLUGIN_KEY];
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
          newLabel = new classes.OutLabel(chart, i, ctx, config, context);
        } catch (e) {
          newLabel = null;
        }
      }

      if (
        label && newLabel && !chart.sizeChanged &&
    (label.label === newLabel.label) && (label.encodedText === newLabel.encodedText)
      ) {
        newLabel.offset = label.offset;
      }
      el[PLUGIN_KEY] = newLabel;
    }

    ctx.restore();
    chart.sizeChanged = false;
  },
  afterDatasetDraw: function(chart, args) {
    var elements = args.meta.data || [];
    var ctx = chart.ctx;

    elements.forEach((el, index) => {
      const outlabelPlugin = el[PLUGIN_KEY];
      if (!outlabelPlugin) {
        return;
      }
      outlabelPlugin.update(el, elements, index);
      outlabelPlugin.draw(ctx);
    });
  },
};
