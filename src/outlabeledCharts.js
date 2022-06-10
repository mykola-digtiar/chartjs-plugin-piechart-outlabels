'use strict';

import defaults from './defaults';
import {PieController, DoughnutController, Chart, defaults as ChartDefaults} from 'chart.js';

export default {
  init: function() {
    ChartDefaults.outlabeledDoughnut = ChartDefaults.doughnut;
    ChartDefaults.outlabeledPie = ChartDefaults.pie;

    class OutlabeledPie extends PieController {
      update(reset) {
        super.update(reset);
        var meta = this.getMeta();
        var zoomOutPercentage = this.chart.options.zoomOutPercentage || defaults.zoomOutPercentage;

        this.outerRadius *= 1 - zoomOutPercentage / 100;
        this.innerRadius *= 1 - zoomOutPercentage / 100;

        this.updateElements(meta.data, 0, meta.data.length, 'resize');
      }
    }

    class OutlabeledDoughnut extends DoughnutController {
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
