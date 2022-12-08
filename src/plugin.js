"use strict";
import { defaults as ChartDefaults } from "chart.js";
import customDefaults from "./custom-defaults.js";
import { getState, removeState } from "./state.js";
import classes from "./classes.js";

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

/**
 * Returns the bounding box of the given label elements.
 *
 * @param {*} elements List of chart elements
 * @returns Bounding box
 */
function getBoundingBox(elements) {
  const rect = {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity,
  };

  for (let i = 0, l = elements.length; i < l; i++) {
    const outlabel = elements[i][PLUGIN_KEY];
    if (!outlabel || !outlabel.labelRect) {
      continue;
    }

    const { labelRect } = outlabel;
    const { x, y, width, height } = labelRect;

    rect.left = Math.min(rect.left, x);
    rect.right = Math.max(rect.right, x + width);
    rect.top = Math.min(rect.top, y);
    rect.bottom = Math.max(rect.bottom, y + height);
  }

  return {
    ...rect,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
  };
}

/**
 * Returns the zoom percentage required to fit the given bounding box within the given bounding box.
 *
 * @param {*} boundingBoxToResize
 * @param {*} boundingBoxToFitWithin
 * @returns Zoom percentage
 */
function getResizeZoomPercentage(boundingBoxToResize, boundingBoxToFitWithin) {
  const { width, height } = boundingBoxToFitWithin;
  const deltas = [
    ((boundingBoxToFitWithin.left - boundingBoxToResize.left) / width) * 2,
    ((boundingBoxToFitWithin.top - boundingBoxToResize.top) / height) * 2,
    ((boundingBoxToResize.right - boundingBoxToFitWithin.right) / width) * 2,
    ((boundingBoxToResize.bottom - boundingBoxToFitWithin.bottom) / height) * 2,
  ];

  const maxDelta = Math.max(0, ...deltas);
  return 1 - maxDelta;
}

/**
 * Updates the labels of the given elements.
 * @param {*} elements
 */
function updateLabels(elements) {
  for (let i = 0, l = elements.length; i < l; i++) {
    const element = elements[i];
    const outlabel = element[PLUGIN_KEY];
    if (!outlabel) {
      continue;
    }

    outlabel.update(element, elements, i);
  }
}

function fitChartArea(chart) {
  const ctrl = chart._metasets[0].controller;
  const meta = ctrl.getMeta();
  const elements = meta.data || [];

  const boundingBox = getBoundingBox(elements);
  const zoom = getResizeZoomPercentage(boundingBox, chart.chartArea);

  if (zoom && zoom !== 1) {
    ctrl.outerRadius = ctrl.outerRadius * zoom;
    ctrl.innerRadius *= zoom;

    ctrl.updateElements(meta.data, 0, meta.data.length, "none");
    return true;
  }

  return false;
}

export default {
  id: "outlabels",
  resize: function (chart) {
    getState(chart).sizeChanged = true;
  },
  afterUpdate: (chart) => {
    const ctrl = chart._metasets[0].controller;
    const meta = ctrl.getMeta();
    const elements = meta.data || [];

    let fit = false;
    // Limit the number of steps to prevent infinite loops
    // It seems that using the number of elements will ensure that the chart
    // fits by positioning all labels in successive resizes
    let maxSteps = elements.length;

    // Avoid to draw labels while fitting the chart area
    getState(chart).fitting = true;

    while (!fit && maxSteps-- > 0) {
      updateLabels(elements);
      fit = !fitChartArea(chart);
    }

    getState(chart).fitting = false;
  },
  afterDatasetUpdate: function (chart, args, options) {
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
            percent: percent,
          };
          newLabel = new classes.OutLabel(chart, i, ctx, config, context);
        } catch (e) {
          newLabel = null;
        }
      }

      if (
        label &&
        newLabel &&
        !getState(chart).sizeChanged &&
        label.label === newLabel.label &&
        label.encodedText === newLabel.encodedText
      ) {
        newLabel.offset = label.offset;
      }
      el[PLUGIN_KEY] = newLabel;
    }

    ctx.restore();
    getState(chart).sizeChanged = false;
  },
  afterDatasetDraw: function (chart, args) {
    var elements = args.meta.data || [];
    var ctx = chart.ctx;

    if (getState(chart).fitting) {
      return;
    }

    elements.forEach((el, index) => {
      const outlabelPlugin = el[PLUGIN_KEY];
      if (!outlabelPlugin) {
        return;
      }
      outlabelPlugin.update(el, elements, index);
      outlabelPlugin.draw(ctx);
    });
  },
  afterDestroy: function (chart) {
    removeState(chart);
  },
};
