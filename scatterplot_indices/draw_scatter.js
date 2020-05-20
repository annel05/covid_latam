async function drawScatter() {
  // 1. access data
  let dataset = await d3.csv('./../data/mexico-20200508.csv');

  const xAccessor = d => d.avg_7d_mobility;
  const yAccessor = d => d.Policy_Index_Adjusted_Time;
  const stateNameAccessor = d => d.State_Name;
  const dateParser = d3.timeParse('%d %b %y');
  const dateAccessor = d => dateParser(d.Date);

  const nestedDataset = d3
    .nest()
    .key(dateAccessor)
    .key(stateNameAccessor)
    .entries(dataset);

  console.log(nestedDataset[0]);

  // 2. create dimensions
  const width = d3.min([window.innerWidth * 0.9, window.innerHeight * 0.9]);
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. draw canvas

  // 4. create scales
  // 5. draw data
  // 6. draw peripherals
  // 7. set up interactions
  let slider = d3.select('#myRange');
  slider.on('input', onSliderInput);
  function onSliderInput() {
    console.log(this.value);
  }
}
drawScatter();
