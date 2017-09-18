# Quick Start

## First Steps

Include Chart.js library and piechart-outlabels plugin to HTML page.

```html
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=Edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<script 
		src="https://rawgit.com/chartjs/chartjs.github.io/master/dist/master/Chart.min.js"
	></script>
	<script
		src="https://cdn.jsdelivr.net/npm/chartjs-plugin-piechart-outlabels"
	></script>

	<title>Pie Chart Outlabels</title>
</head>
```

To make the chart look more fancy, the plugin also provides special chart type called `outlabeledPie`. Insert canvas element to HTML page.

> It is highly recommended to use `outlabeledPie` Chart type!

```html
<div id="chart-wrapper">
	<canvas id="outlabeledChart"></canvas>
</div>
```

Initialize chart.

```html
<script id="script-construct">
	var chart = new Chart('outlabeledChart', {
		type: 'outlabeledPie',
		data: {
			labels: [
				'ONE',
				'TWO',
				'THREE',
				'FOUR',
				'FIVE',
				'SIX',
				'SEVEN',
				'EIGHT',
				'NINE',
				'TEN'
			],
			datasets: [{
				backgroundColor: [
					'#FF3784',
					'#36A2EB',
					'#4BC0C0',
					'#F77825',
					'#9966FF',
					'#00A8C6',
					'#379F7A',
					'#CC2738',
					'#8B628A',
					'#8FBE00'
				],
				data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			}]
		},
		options: {
			zoomOutPercentage: 55, // makes chart 40% smaller (50% by default, if the preoprty is undefined)
			plugins: {
				legend: false,
				outlabels: {
					text: '%l %p',
					color: 'white',
					stretch: 45,
					font: {
						resizable: true,
						minSize: 12,
						maxSize: 18
					}
				}
			}
		}
	});
</script>
```

## Final Result

```html
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=Edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<script 
			src="https://rawgit.com/chartjs/chartjs.github.io/master/dist/master/Chart.min.js"
		></script>
		<script
			src="https://cdn.jsdelivr.net/npm/chartjs-plugin-piechart-outlabels"
		></script>

		<title>Pie Chart Outlabels</title>
	</head>
	<body>
		<div id="chart-wrapper">
			<canvas id="outlabeledChart"></canvas>
		</div>
		<script id="script-construct">
			var chart = new Chart('outlabeledChart', {
				type: 'outlabeledPie',
				data: {
					labels: [
						'ONE',
						'TWO',
						'THREE',
						'FOUR',
						'FIVE',
						'SIX',
						'SEVEN',
						'EIGHT',
						'NINE',
						'TEN'
					],
					datasets: [{
						backgroundColor: [
							'#FF3784',
							'#36A2EB',
							'#4BC0C0',
							'#F77825',
							'#9966FF',
							'#00A8C6',
							'#379F7A',
							'#CC2738',
							'#8B628A',
							'#8FBE00'
						],
						data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
					}]
				},
				options: {
					zoomOutPercentage: 55, // makes chart 55% smaller (50% by default, if the preoprty is undefined)
					plugins: {
						legend: false,
						outlabels: {
							text: '%l %p',
							color: 'white',
							stretch: 45,
							font: {
								resizable: true,
								minSize: 12,
								maxSize: 18
							}
						}
					}
				}
			});
		</script>
	</body>
</html>
```