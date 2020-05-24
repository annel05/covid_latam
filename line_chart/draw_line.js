async function drawLine() {
  // 1. access data
  const dataset = await d3.csv('../data/mexico-20200519.csv');

  const xAccessor = d => +d.Days;
  const yAccessor = d => +d.avg_google_7d;
  const stateAccessor = d => d.State_Name;

  const datasetByState = d3.nest().key(stateAccessor).entries(dataset);
  // 2. create dimensions
  // 3. draw canvas
  // 4. create scales
  // 5. draw data
  // 6. draw peripherals
  // 7. act interactivity
}

drawLine();
