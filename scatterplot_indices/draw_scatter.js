async function drawScatter() {
  // 1. access data
  let dataset = await d3.csv('./../data/mexico-20200519.csv');

  const xAccessor = d => d.Policy_Index_Adjusted_Time;
  const yAccessor = d => +d.avg_google_7d;
  const stateNameAccessor = d => d.State_Name;
  const dateParser = d3.timeParse('%d-%b-%y');
  const dateAccessor = d => dateParser(d.Date);
  const dayAccessor = d => +d.Days;

  const latestDate = d3.max(dataset.map(dateAccessor));
  const latestDay = d3.max(dataset.map(dayAccessor));
  // set slider maximum
  let slider = d3.select('#myRange');
  slider.attr('max', latestDay).attr('value', latestDay);

  const nestedDataset = d3.nest().key(dayAccessor).entries(dataset);
  let data = nestedDataset[latestDay - 1];

  // const nestedDataset = d3
  //   .nest()
  //   .key(stateNameAccessor)
  //   .entries(dataset);

  // TODO set slider max based on dataset.Days - 1.

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
  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bounds = wrapper
    .append('g')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    );

  // 4. create scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(dataset, xAccessor)])
    .range([0, dimensions.boundedWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();
  console.log(d3.extent(dataset, yAccessor));

  // 5. draw data
  // TODO compute mean lines
  // TODO draw quadrants
  // TODO draw circles
  // TODO draw mean lines

  // 6. draw peripherals
  // TODO draw grid lines
  // TODO draw text for quadrants
  const xAxisGenerator = d3.axisBottom().scale(xScale);

  const xAxis = bounds
    .append('g')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  const yAxisGenerator = d3.axisLeft().scale(yScale);

  const yAxis = bounds.append('g').call(yAxisGenerator);

  // 7. set up interactions
  // TODO on slider change, flip through the dates
  // TODO add tooltips

  slider.on('input', onSliderInput);
  function onSliderInput() {
    console.log(this.value);
  }
}
drawScatter();
