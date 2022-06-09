'use strict';

import defaults from './defaults';
import Chart from 'chart.js';

export default {
	init: function() {
		Chart.defaults.outlabeledDoughnut = Chart.defaults.doughnut;
		Chart.defaults.outlabeledPie = Chart.defaults.pie;

		class OutlabeledPie extends Chart.PieController {
			update(reset) {
				super.update(reset);
				var meta = this.getMeta();
				var zoomOutPercentage = this.chart.options.zoomOutPercentage || defaults.zoomOutPercentage;

				this.outerRadius *= 1 - zoomOutPercentage / 100;
				this.innerRadius *= 1 - zoomOutPercentage / 100;

				this.updateElements(meta.data, 0, meta.data.length, 'resize');
			}
		}

		class OutlabeledDoughnut extends Chart.DoughnutController {
			update(reset) {
				super.update(reset);
				var meta = this.getMeta();
				var zoomOutPercentage = this.chart.options.zoomOutPercentage || defaults.zoomOutPercentage;

				this.outerRadius *= 1 - zoomOutPercentage / 100;
				this.innerRadius *= 1 - zoomOutPercentage / 100;

				this.updateElements(meta.data, 0, meta.data.length, 'resize');
			}
		}

		OutlabeledPie.id = 'outlabeledPie';
		OutlabeledDoughnut.id = 'outlabeledDoughnut';

		Chart.register(OutlabeledPie);
		Chart.register(OutlabeledDoughnut);
	}
};
