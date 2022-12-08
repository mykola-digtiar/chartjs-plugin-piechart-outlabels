const chartStates = new WeakMap();

export function getState(chart) {
  let state = chartStates.get(chart);
  if (!state) {
    state = {
      sizeChanged: false,
      fitting: false,
    };
    chartStates.set(chart, state);
  }
  return state;
}

export function removeState(chart) {
  chartStates.delete(chart);
}
