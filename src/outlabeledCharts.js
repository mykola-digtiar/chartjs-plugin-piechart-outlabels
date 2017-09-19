'use strict';

import helpers from './helpers';
import defaults from './defaults';

export default {
	init: function() {
		Chart.defaults.outlabeledDoughnut = Chart.defaults.doughnut;
		Chart.defaults.outlabeledPie = Chart.defaults.pie;

		var customUpdate = function(reset) {
			Chart.controllers.doughnut.prototype.update.call(this);
			var me = this;
			var meta = me.getMeta();
			var zoomOutPercentage = me.chart.options.zoomOutPercentage || defaults.zoomOutPercentage;

			me.outerRadius *= 1 - zoomOutPercentage / 100;
			me.innerRadius *= 1 - zoomOutPercentage / 100;

			Chart.helpers.each(meta.data, function(arc, index) {
				me.updateElement(arc, index, reset);
			});
		}

		var customDoughnut = Chart.controllers.doughnut.extend({
			update: customUpdate
		});

		var customPie = Chart.controllers.pie.extend({
			update: customUpdate
		});

		Chart.controllers.outlabeledPie = customPie;
		Chart.controllers.outlabeledDoughnut = customDoughnut;
	}
}