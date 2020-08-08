async function drawMap() {
  // 1. load data
  // load country shapes
  // TODO change to latam geojson
  const countryShapes = await d3.json('./../data/world-geojson.json');
  console.log(countryShapes);

  // TODO load JHU dataset
  // step 1. calculate yesterday's date
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const formatTime = d3.timeFormat('%m-%d-%Y');

  // step 2. turn it into a string of format mm-dd-yyyy
  const date = formatTime(yesterday);
  // step 3. feed it into url
  const dataset = await d3.csv(
    `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${date}.csv`
  );

  // data accessors
  const countryNameAccessor = d.properties['Country_Region'];
  const provinceNameAccessor = d.properties['Province_State'];
  const combinedKeyAccessor = d.properties['Combined_Key'];
}
drawMap();
