async function countCases() {
  // 1. get data
  const datasetCases = await d3.csv(
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
  );
  const datasetDeaths = await d3.csv(
    'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
  );

  const ourDate = '5/21/20';
  const countryList = [
    ,
    'Argentina',
    'Belize',
    'Bolivia',
    'Brazil',
    'Chile',
    'Colombia',
    'Costa Rica',
    'Cuba',
    'Dominican Republic',
    'Ecuador',
    'El Salvador',
    'Guatemala',
    'Honduras',
    'Mexico',
    'Nicaragua',
    'Panama',
    'Paraguay',
    'Peru',
    'Uruguay',
    'Venezuela',
  ];
  const countryAccessor = d => d['Country/Region'];

  const getLatestColumn = (_dataset, _country) => {
    const data = _dataset.filter(d => countryAccessor(d) == _country);
    const columns = Object.getOwnPropertyNames(data[0]);
    const latest = columns[columns.length - 1];
    return data[0][latest];
  };
  countryList.forEach(element => {
    // const countryCases = datasetCases.filter(
    //   d => countryAccessor(d) == element
    // );
    // const columnsCases = Object.getOwnPropertyNames(countryCases[0]);
    // const latestCases = columnsCases[columnsCases.length - 1];
    d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_cases`).html(
      getLatestColumn(datasetCases, element)
    );

    d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_deaths`).html(
      getLatestColumn(datasetDeaths, element)
    );
  });

  // const columns = Object.getOwnPropertyNames(data[0]);
  // const latest = columns[columns.length - 1];
  // console.table(data[0][latest]);
}
countCases();
