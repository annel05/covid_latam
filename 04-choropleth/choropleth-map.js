async function drawMap({metric, chartKeyword}) {
  // 1. load data
  // load country shapes
  // TODO change to latam geojson
  const countryShapes = await d3.json('./../data/world-geojson.json');

  // load JHU dataset
  let urlData;
  if (metric == 'deaths') {
    // load deaths time series
    urlData =
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
  } else {
    // load cases time series
    urlData =
      'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
  }
  const dataset = await d3.csv(urlData);
  // TODO update to permalink
  const populationData = await d3.csv('./../data/population.csv');

  //  create data accessors
  const countryNameAccessor = d => d['Country/Region'];

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastDay = `${d3.timeFormat('%-m/%-d/%y')(yesterday)}`;
  const latestMetricAccessor = d => d[lastDay];

  const getPopulation = _country => {
    const country = populationData.filter(d => d['Country'] == _country);
    const population = country[0]['2019'];
    return +population;
  };

  // filter dataset to only keep rows of countries we care about
  const countryWatchList = [
    'Mexico',
    'Ecuador',
    'Chile',
    'Argentina',
    'Bolivia',
    'Guyana',
    'Colombia',
    'Brazil',
    'Trinidad and Tobago',
    'Panama',
    'Nicaragua',
    'Honduras',
    'Paraguay',
    'Suriname',
    'Uruguay',
    'Peru',
    'Venezuela',
    'Belize',
    'Cuba',
    'Dominican Republic',
    'Guatemala',
    'Haiti',
    'Puerto Rico',
    'El Salvador',
  ].sort();

  const countryData = dataset.filter(d =>
    countryWatchList.some(i => countryNameAccessor(d) == i)
  );

  const getMetric = _country => {
    const country = countryData.filter(d => countryNameAccessor(d) == _country);
    return latestMetricAccessor(country[0]);
  };

  // 2. create dimensions
  const wrapperElt = `wrapper_${chartKeyword}`;

  let dimensions = {
    width: document.getElementById(wrapperElt).parentElement.clientWidth,
    margin: {
      top: 10,
      right: 40,
      bottom: 40,
      left: 40,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;

  const sphere = {type: 'Sphere'};
  const projection = d3
    .geoEqualEarth()
    .fitWidth(dimensions.boundedWidth, sphere);

  const pathGenerator = d3.geoPath(projection);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere);

  dimensions.boundedHeight = y1;
  dimensions.height =
    dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom;
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
  const latestMetricValues = [];
  const latestPopulation = [];
  const metricRate = [];
  const metricRateNormalized = [];
  countryWatchList.forEach(element => {
    // const metric = getMetric(element);
    const metric = 0;
    const population = getPopulation(element);
    const rate = metric / parseFloat(population);
    // latestMetricValues.push(metric);
    latestPopulation.push(population);
    metricRate.push(rate);
    metricRateNormalized.push(rate * 100000);
  });
  console.log(countryWatchList);
  console.log(latestPopulation);
  console.log(latestMetricValues);
  console.log(metricRate);
  console.log(metricRateNormalized);
}
