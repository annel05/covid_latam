<?php

/**
 * Template Name: HomePage
 *
 * Template for displaying a page without sidebar even if a sidebar widget is published.
 *
 * @package understrap
 */

// Exit if accessed directly.
defined('ABSPATH') || exit;

get_header();
$container = get_theme_mod('understrap_container_type');

if (is_front_page()) {
  get_template_part('global-templates/hero');
}
?>

<div class="wrapper" id="full-width-page-wrapper">

  <div class="<?php echo esc_attr($container); ?>" id="content">

    <div class="row">

      <div class="col-md-8 content-area" id="primary">

        <main class="site-main" id="main" role="main">

          <?php
          while (have_posts()) {
            the_post();
            get_template_part('loop-templates/content', 'page');
          }
          ?>

        </main><!-- #main -->


      </div><!-- #primary -->

      <!-- dashbard -->
      <div class="col-md-4 latest-numbers">
        <h3><?php _e('Latest Numbers', 'covid-19-theme'); ?></h3>


        <!-- COuntry COunter -->

        <script>
        async function countCases() {
          // 1. get data
          const datasetCases = await d3.csv(
            'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'
          );
          const datasetDeaths = await d3.csv(
            'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv'
          );
          const countryList = [
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

          const getPreviousColumn = (_dataset, _country) => {
            const data = _dataset.filter(d => countryAccessor(d) == _country);
            const columns = Object.getOwnPropertyNames(data[0]);
            const previous = columns[columns.length - 2];
            return data[0][previous];
          };
          const computeDelta = (_dataset, _country) => {
            const a = +getLatestColumn(_dataset, _country);
            const b = +getPreviousColumn(_dataset, _country);
            const value = Math.abs(a - b);
            let output;
            if (value > 0) {
              // add a + sign in front
              output = '+' + value;
            } else if (value < 0) {
              // add a - sign in front
              output = '-' + value;
            } else {
              // add no sign bc value is 0
              output = '0';
            }
            return output;
          };
          console.log(computeDelta(datasetCases, 'Venezuela'));
          countryList.forEach(element => {
            d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_cases`).html(
              getLatestColumn(datasetCases, element)
            );
            d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_deaths`).html(
              getLatestColumn(datasetDeaths, element)
            );
            d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_deltaCases`).html(
              computeDelta(datasetCases, element)
            );
            d3.select(`#${element.toLowerCase().replace(/\s+/g, '')}_deltaDeaths`).html(
              computeDelta(datasetDeaths, element)
            );
          });

          // Modify last updated section
          const cases_columns = Object.getOwnPropertyNames(datasetCases[0]);
          const latest_date_cases = cases_columns[cases_columns.length - 1];
          const dateParser = d3.timeParse('%-m/%-d/%y');
          const dateFormat = d3.timeFormat('%d %B %Y');

          d3.select('#last_updated').html(dateFormat(dateParser(latest_date_cases)));
        }
        countCases();
        </script>
        <div class="row">
          <div class="col-12">
            <table id="latest_numbers" class="table table-hover">
              <caption>
                Last Updated:
                <span id="last_updated"></span>
                <br />
                Source:
                <a href="https://coronavirus.jhu.edu/map.html">John Hopkins Coronavirus Resource Center</a>
              </caption>
              <thead>
                <th scope="col" class="text-left">Country</th>
                <th scope="col" class="text-right">Confirmed Cases</th>
                <th scope="col" class="text-right">Deaths</th>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Argentina</th>
                  <td class="text-right">
                    <span id="argentina_deltaCases" class="country_delta"></span>&nbsp;<span
                      id="argentina_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="argentina_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="argentina_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Belize</th>
                  <td class="text-right">
                    <span id="belize_deltaCases" class="country_delta"></span>&nbsp;<span id="belize_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="belize_deltaDeaths" class="country_delta"></span>&nbsp;<span id="belize_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Bolivia</th>
                  <td class="text-right">
                    <span id="bolivia_deltaCases" class="country_delta"></span>&nbsp;<span id="bolivia_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="bolivia_deltaDeaths" class="country_delta"></span>&nbsp;<span id="bolivia_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Brazil</th>
                  <td class="text-right">
                    <span id="brazil_deltaCases" class="country_delta"></span>&nbsp;<span id="brazil_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="brazil_deltaDeaths" class="country_delta"></span>&nbsp;<span id="brazil_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Chile</th>
                  <td class="text-right">
                    <span id="chile_deltaCases" class="country_delta"></span>&nbsp;<span id="chile_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="chile_deltaDeaths" class="country_delta"></span>&nbsp;<span id="chile_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Colombia</th>
                  <td class="text-right">
                    <span id="colombia_deltaCases" class="country_delta"></span>&nbsp;<span id="colombia_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="colombia_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="colombia_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Costa Rica</th>
                  <td class="text-right">
                    <span id="costarica_deltaCases" class="country_delta"></span>&nbsp;<span
                      id="costarica_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="costarica_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="costarica_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Cuba</th>
                  <td class="text-right">
                    <span id="cuba_deltaCases" class="country_delta"></span>&nbsp;<span id="cuba_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="cuba_deltaDeaths" class="country_delta"></span>&nbsp;<span id="cuba_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Dominican Republic</th>
                  <td class="text-right">
                    <span id="dominicanrepublic_deltaCases" class="country_delta"></span>&nbsp;<span
                      id="dominicanrepublic_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="dominicanrepublic_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="dominicanrepublic_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Ecuador</th>
                  <td class="text-right">
                    <span id="ecuador_deltaCases" class="country_delta"></span>&nbsp;<span id="ecuador_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="ecuador_deltaDeaths" class="country_delta"></span>&nbsp;<span id="ecuador_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">El Salvador</th>
                  <td class="text-right">
                    <span id="elsalvador_deltaCases" class="country_delta"></span>&nbsp;<span
                      id="elsalvador_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="elsalvador_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="elsalvador_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Guatemala</th>
                  <td class="text-right">
                    <span id="guatemala_deltaCases" class="country_delta"></span>&nbsp;<span
                      id="guatemala_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="guatemala_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="guatemala_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Honduras</th>
                  <td class="text-right">
                    <span id="honduras_deltaCases" class="country_delta"></span>&nbsp;<span id="honduras_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="honduras_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="honduras_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Mexico</th>
                  <td class="text-right">
                    <span id="mexico_deltaCases" class="country_delta"></span>&nbsp;<span id="mexico_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="mexico_deltaDeaths" class="country_delta"></span>&nbsp;<span id="mexico_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Nicaragua</th>
                  <td class="text-right">
                    <span id="nicaragua_deltaCases" class="country_delta"></span>&nbsp;<span
                      id="nicaragua_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="nicaragua_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="nicaragua_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Panama</th>
                  <td class="text-right">
                    <span id="panama_deltaCases" class="country_delta"></span>&nbsp;<span id="panama_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="panama_deltaDeaths" class="country_delta"></span>&nbsp;<span id="panama_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Paraguay</th>
                  <td class="text-right">
                    <span id="paraguay_deltaCases" class="country_delta"></span>&nbsp;<span id="paraguay_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="paraguay_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="paraguay_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Peru</th>
                  <td class="text-right">
                    <span id="peru_deltaCases" class="country_delta"></span>&nbsp;<span id="peru_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="peru_deltaDeaths" class="country_delta"></span>&nbsp;<span id="peru_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Uruguay</th>
                  <td class="text-right">
                    <span id="uruguay_deltaCases" class="country_delta"></span>&nbsp;<span id="uruguay_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="uruguay_deltaDeaths" class="country_delta"></span>&nbsp;<span id="uruguay_deaths"></span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">Venezuela</th>
                  <td class="text-right">
                    <span id="venezuela_deltaCases" class="country_delta"></span>&nbsp;<span
                      id="venezuela_cases"></span>
                  </td>
                  <td class="text-right">
                    <span id="venezuela_deltaDeaths" class="country_delta"></span>&nbsp;<span
                      id="venezuela_deaths"></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div><!-- .row end -->
    <div class="row">
      <div class="header-box col-12">
        <h2><?php _e('News', 'covid-19-theme'); ?></h2>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <?php $catquery = new WP_Query('posts_per_page=5'); ?>

        <?php while ($catquery->have_posts()) : $catquery->the_post(); ?>
        <h3><a href="<?php the_permalink() ?>" rel="bookmark"><?php the_title(); ?></a></h3>
        <div class="excerpt"><?php the_excerpt(); ?></div>
        <?php endwhile; ?>

        <?php wp_reset_postdata(); ?>
      </div>
    </div>
    <style>
    .partner {
      padding: 20px;
    }

    .partner img {
      max-height: 200px;
    }
    </style>
    <div class="row">
      <div class="col-12 text-center um">
        <br>
        <hr>
        <br><br>
        <a href="https://mia.as.miami.edu/">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/mia.png" width="500"
            alt="University of Miami Institute for Advanced Study of the Americas">
        </a>
        <br><br><br>
        <h2><?php _e('In collaboration with:', 'covid-19-theme'); ?></h2>
        <br>
      </div>
    </div>

    <div class="row">
      <div class="col-6 text-center partner">
        <a href="https://www.cide.edu" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/cide.png" alt="CIDE">
        </a>
      </div>
      <div class="col-6 text-center partner">
        <a href="www.tomateloapecho.org.mx" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/LOGO-TAP.png"
            alt="Tomatelo a Pecho - Cancer de Mama" width="200">
        </a>
      </div>
    </div>

    <div class="row">
      <div class="col-6 text-center partner">
        <a href="https://www.anahuac.mx/mexico/EscuelasyFacultades/cienciasdelasalud" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/cicsaanahuac.png" alt="CICSA" width="200">
        </a>

      </div>
      <div class="col-6 text-center partner">
        <a href="https://www.tufts.edu" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/Tufts_univ.png" alt="Tufts" width="200">
        </a>
      </div>
    </div>



    <div class="row">
      <div class="col-6 text-center partner">
        <a href="http://www.facmed.unam.mx" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/UNAM.png" alt="UNAM" width="200">
        </a>
      </div>
      <div class="col-6 text-center partner">
        <a href="https://www.smsp.org.mx" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/smsp.png" alt="SMPS">
        </a>
      </div>
    </div>

    <div class="row">
      <div class="col-6 text-center partner">
        <a href="http://mexicosocial.org" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/05/mexicosocial.png" alt="Mexico Social"
            width="200">
        </a>
      </div>
      <div class="col-6 text-center partner">
        <a href="https://br.linkedin.com/in/marcofaga" target="_blank">
          <img src="http://observcovid.miami.edu/wp-content/uploads/2020/06/MAF.png" alt="MAF Data Science">
        </a>
      </div>
    </div>
  </div>

</div><!-- #content -->

</div><!-- #full-width-page-wrapper -->

<?php
get_footer();