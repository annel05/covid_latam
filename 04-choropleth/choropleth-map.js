async function drawMap({metric}) {
  // 1. load data
  // load country shapes
  // TODO change to latam geojson
  const countryShapes = await d3.json('./../data/world-geojson.json');
  console.log(countryShapes);

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
  // step 3. feed it into url
  const dataset = await d3.csv(urlData);
  
}
drawMap({metric: 'deaths'});
