async function indexLineChart_LATAM({
  yVariable,
  useRegion,
  useBaseline,
  usePercentage,
  chartKeyword,
}) {
  // This function works with country datasets and takes in the following to create a chart
  // country: name of country to load data file
  // yVariable: y-axis variable
  // useRegion: boolean for drawing latam/region data.
  // useBaseline: boolean for drawing a 0 baseline or not.
  // usePercentage: boolean for using % symbol in y axis.
  // chartKeyword: keyword for picking the ids from the document.

  // 0. set language for dates
  setLocale();

  // 1. Get data
  // TODO replace with latest data once it works
  const dataset = await d3.csv(
    `https://raw.githubusercontent.com/lennymartinez/covid_latam/master/data/latam_working.csv`
  );

  // set data accessors
  const yAccessor = d => +d[`${yVariable}`];
  const dateParser = d3.timeParse('%Y-%m-%d');
  const xAccessor = d => dateParser(d.date);
  const countryCodeAccessor = d => d.country_short;
  const countryNameAccessor = d => d.country;

  // organize data into country and region
  const datasetByCountryCode = d3
    .nest()
    .key(countryCodeAccessor)
    .entries(dataset);

  const latam = datasetByCountryCode.filter(d => d.key == 'LATAM');
  const countries = datasetByCountryCode.filter(d => d.key != 'LATAM');

  // 2. create dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;
  const width = document.getElementById(wrapperElt).parentElement.clientWidth;

  let dimensions = {
    width: width,
    height: 600,
    margin: {top: 15, right: 15, bottom: 40, left: 60},
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. draw canvas

  const wrapper = d3
    .select(`#${wrapperElt}`)
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

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  const countriesOnly = dataset.filter(d => countryCodeAccessor(d) != 'LATAM');
  const countryCodeList = d3.map(countriesOnly, countryCodeAccessor).keys();
  const colorScale = d3
    .scaleOrdinal()
    .domain(countryCodeList)
    .range(colorGroup);

  // 6. draw peripherals -- axes
  const yAxisGenerator = d3
    .axisLeft()
    .scale(yScale)
    .tickSize(-dimensions.boundedWidth);

  // add percentage to tick values if true
  if (usePercentage) {
    yAxisGenerator.tickFormat(d => d + '%');
  }

  const yAxis = bounds.append('g').attr('class', 'y_axis').call(yAxisGenerator);

  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickSize(-dimensions.boundedHeight)
    .tickFormat(d3.timeFormat('%d %b'));

  const xAxis = bounds
    .append('g')
    .attr('class', 'x_axis')
    .call(xAxisGenerator)
    .style('transform', `translateY(${dimensions.boundedHeight}px)`);

  xAxis.selectAll('text').attr('dy', 20);
  xAxis.selectAll('.tick line').attr('y1', dimensions.margin.bottom * 0.25);

  // draw 0-baseline if true
  if (useBaseline) {
    bounds
      .append('line')
      .attr('class', 'baseline')
      .attr('stroke-width', 2)
      .attr('stroke', '#333333')
      .attr('x1', 0)
      .attr('x2', dimensions.boundedWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0));
  }

  // 5. draw data

  const lineGenerator = d3
    .line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)));

  bounds
    .selectAll('.country')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', d => `country ${d.key}_${chartKeyword}`)
    .attr('fill', 'none')
    .attr('stroke-width', 1.25)
    .attr('stroke', '#d2d3d4')
    .attr('d', d => lineGenerator(d.values));

  // add national data
  if (useRegion) {
    bounds
      .selectAll('.region')
      .data(latam)
      .enter()
      .append('path')
      .attr('class', 'region')
      .attr('fill', 'none')
      .attr('stroke', '#333333')
      .attr('stroke-dasharray', '9px 2px')
      .attr('stroke-width', 2.5)
      .attr('d', d => lineGenerator(d.values));
  }

  const addCountryLine = _countryCode => {
    // This function draws the active version of a country line.
    const specificCountry = dataset.filter(
      d => countryCodeAccessor(d) == _countryCode
    );

    bounds
      .append('path')
      .attr('id', `${_countryCode}_${chartKeyword}`)
      .attr('class', `active_${chartKeyword}`)
      .attr('fill', 'none')
      .attr('stroke', colorScale(_countryCode))
      .attr('stroke-width', 3)
      .attr('d', () => lineGenerator(specificCountry));
  };

  addCountryLine('MEX');
  addCountryLine('BRA');

  const tooltipLine = bounds
    .append('line')
    .attr('id', `tooltipLine_${chartKeyword}`);

  // 7. add interactivity

  // Toggle Country Lines, part 1 start -- populate country checklist

  // const stateList = d3
  //   .select(`#stateList_${chartKeyword}`)
  //   .selectAll('input')
  //   .data(states)
  //   .enter()
  //   .append('li')
  //   .attr('class', d => `${stateCodeAccessor(d.values[0])}_input`);

  // stateList
  //   .append('input')
  //   .attr('class', `input_box_${chartKeyword}`)
  //   .attr('type', 'checkbox')
  //   .attr('name', d => `${stateCodeAccessor(d.values[0])}_${chartKeyword}`);

  // stateList
  //   .append('label')
  //   .attr('class', 'input_label')
  //   .attr('for', d => `${stateCodeAccessor(d.values[0])}_${chartKeyword}`)
  //   .html(d => stateNameAccessor(d.values[0]));
  // // Toggle State Lines, part 1 end

  // // Toggle State Lines, part 2 start -- turn on the boxes for the state we highlighted earlier.
  // [bestStateCode, worstStateCode].forEach(element => {
  //   const inputBox = stateList.select(`[name=${element}_${chartKeyword}]`);
  //   const inputLabel = stateList.select(`[for=${element}_${chartKeyword}]`);

  //   inputBox.property('checked', true);
  //   inputLabel.style('color', colorScale(element)).style('font-weight', 'bold');
  // });
  // // Toggle State Lines, part 2 end

  // // Toggle State Lines, part 3 start -- toggle on/off any state by checking the corresponding input box.
  // d3.selectAll(`.input_box_${chartKeyword}`).on('input', toggleStateLine);

  // function toggleStateLine() {
  //   const stateCode = this.name.split('_')[0];
  //   const inputLabel = stateList.select(`[for=${this.name}]`);

  //   if (this.checked) {
  //     // input box has become active. Draw the color line and have the inputLabel match.
  //     addStateLine(stateCode);
  //     inputLabel
  //       .style('color', colorScale(stateCode))
  //       .style('font-weight', 'bold');
  //   } else {
  //     // input box has become inactive. Remove the color line and the inputLabel styles.
  //     const line = bounds.select(`#${stateCode}_${chartKeyword}`);
  //     line.remove();
  //     inputLabel.style('color', '#000').style('font-weight', 'normal');
  //   }
  // }
  // // Toggle State Lines, part 3 end

  // // Tooltip, part 1 start -- create listening rect and tooltip

  // const listeningRect = bounds
  //   .append('rect')
  //   .attr('class', 'listening_rect')
  //   .attr('width', dimensions.boundedWidth)
  //   .attr('height', dimensions.boundedHeight)
  //   .on('mousemove', onMouseMove)
  //   .on('mouseleave', onMouseLeave);

  // const tooltip = d3
  //   .select(`#tooltip_${chartKeyword}`)
  //   .style('top', `${dimensions.margin.top * 2}px`)
  //   .style('left', `${dimensions.margin.left * 1.25}px`);

  // const tooltipHeader = tooltip.select(`#tooltipHeader_${chartKeyword}`);
  // const tooltipContent = tooltip.select(`#tooltipContent_${chartKeyword}`);

  // function onMouseMove() {
  //   tooltip.style('opacity', 1);

  //   // 1. get mouse position and translate it into date and y-value. Use this to find the closest date to your mouse position in the dataset.
  //   const mousePosition = d3.mouse(this);
  //   const hoveredDate = xScale.invert(mousePosition[0]);

  //   const getDistanceFromHoveredDate = d =>
  //     Math.abs(xAccessor(d) - hoveredDate);

  //   const closestIndex = d3.scan(
  //     dataset,
  //     (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
  //   );
  //   const closestDate = dataset[closestIndex];

  //   // 2. Filter data from the closest date to get X and Y values
  //   // const data = states.filter(d => d.date == closestDate.date);

  //   const closestXValue = xAccessor(closestDate);
  //   const closestYValue = yAccessor(closestDate);

  //   // 3. Get list of all active states into one array. Make sure national data is first, and then every other thing that follows is alphabetized
  //   const activeStates = ['Nacional'];
  //   const unsortedStates = [];
  //   let displayFormat;
  //   let nationalSpelling;
  //   if (_lang == 'pt-br' || _lang == 'es-ES') {
  //     displayFormat = d3.timeFormat('%d %B');
  //     nationalSpelling = 'Nacional';
  //   } else {
  //     displayFormat = d3.timeFormat('%B %d');
  //     nationalSpelling = 'National';
  //   }

  //   const activeElements = document.getElementsByClassName(
  //     `active_${chartKeyword}`
  //   );

  //   Array.from(activeElements).forEach(element => {
  //     const code = element.getAttribute('id').split('_')[0];
  //     unsortedStates.push(code);
  //   });
  //   unsortedStates.sort().forEach(element => {
  //     activeStates.push(element);
  //   });

  //   // 4. clear any tooltip information
  //   tooltipHeader.selectAll('*').remove();
  //   tooltipContent.selectAll('*').remove();
  //   bounds.selectAll(`.intersection_${chartKeyword}`).remove();

  //   // 5. add display date to tooltip box.

  //   tooltipHeader
  //     .append('span')
  //     .html(displayFormat(dateParser(closestDate.date)));

  //   // 6. position tooltipLine
  //   tooltipLine
  //     .attr('x1', xScale(closestXValue))
  //     .attr('x2', xScale(closestXValue))
  //     .attr('y1', 0)
  //     .attr('y2', dimensions.boundedHeight)
  //     .attr('stroke-width', 2)
  //     .attr('stroke-dasharray', '7px 2px')
  //     .attr('stroke', '#000')
  //     .style('opacity', 1);

  //   // 7. add value for each active state to the tooltip

  //   activeStates.forEach(element => {
  //     // a) get the data for the specific state filtered on that specific day
  //     const point = dataset
  //       .filter(d => stateCodeAccessor(d) == element)
  //       .filter(d => d.date == closestDate.date);

  //     const yValue = yAccessor(point[0]);
  //     const xValue = xAccessor(point[0]);
  //     const stateName = stateNameAccessor(point[0]);

  //     const getColor = _code => {
  //       if (_code == 'Nacional') {
  //         return '#171717';
  //       } else {
  //         return colorScale(stateCodeAccessor(point[0]));
  //       }
  //     };

  //     // add data to tooltip table
  //     const pointInfo = tooltipContent
  //       .append('tr')
  //       .attr('class', 'tooltip_state');

  //     pointInfo
  //       .append('td')
  //       .attr('class', 'tooltip_state_name')
  //       .html(() => {
  //         if (stateName == 'Nacional') {
  //           return nationalSpelling;
  //         } else {
  //           return stateName;
  //         }
  //       })
  //       .style('color', getColor(element));

  //     pointInfo
  //       .append('td')
  //       .attr('class', 'tooltip_value')
  //       .html(() => {
  //         const suffix = usePercentage ? '%' : '';
  //         return yValue.toFixed(1) + suffix;
  //       });

  //     // create a temporary dot on the line chat for that day
  //     bounds
  //       .append('circle')
  //       .attr('cx', xScale(xValue))
  //       .attr('cy', yScale(yValue))
  //       .attr('r', 7)
  //       .attr('fill', getColor(element))
  //       .attr('class', `intersection_${chartKeyword}`);
  //   });
  // }

  // // pause
  // function onMouseLeave() {
  //   activeStates = ['Nacional'];
  //   tooltip.style('opacity', 0);
  //   tooltipLine.style('opacity', 1);
  //   bounds.selectAll(`intersection_${keyword}`).remove();
  // }
}
