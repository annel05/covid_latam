<?php

/**
 * Template Name: Country Template
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
<script src="<?php echo get_template_directory_uri(); ?>/js/pais.js"></script>

<div class="wrapper" id="full-width-page-wrapper">

  <div class="<?php echo esc_attr($container); ?>" id="content">

    <div class="row">

      <div class="col-md-12 content-area" id="primary">

        <main class="site-main" id="main" role="main">

          <?php
          while (have_posts()) {
            the_post();
            get_template_part('loop-templates/content', 'page');

            if (have_rows('country_data')) :

              while (have_rows('country_data')) : the_row();
                $content_type = get_row_layout();
                switch ($content_type) {
                  case 'chart':
          ?>
          <div class="x">
            <h3 class="title"><?php the_sub_field('title'); ?></h3>
            <h4 class="subtitle"><?php the_sub_field('subtitle'); ?></h4>
            <script>
            < ? php the_sub_field('script_source'); ? >
            </script>
            <style>
            <?php the_sub_field('css_source');
            ?>
            </style>
            <div class="chart">
              <?php the_sub_field('html'); ?>
            </div>
            <?php
                      if (get_sub_field('data_url')) : ?>
            <div class="download-data">
              <a class="btn btn-info" target="_blank"
                href="<?php the_sub_field('data_url'); ?>"><?php esc_html_e('Download data and charts', 'covid-19'); ?>
                <i class="fa fa-cloud-download" aria-hidden="true"></i></a>
            </div>
            <?php endif; ?>
            <div class="caption">
              <?php the_sub_field('caption'); ?>
            </div>
          </div>
          <?php
                    break;
                  case 'static_chart':
                  ?>
          <h3 class="title"><?php the_sub_field('title'); ?></h3>
          <h4 class="subtitle"><?php the_sub_field('subtitle'); ?></h4>
          <div class="image">
            <img src="<?php the_sub_field('image'); ?>" alt="<?php the_sub_field('caption'); ?>">
          </div>
          <?php if (get_sub_field('data_url')) : ?>
          <div class="download-data">
            <a class=" btn btn-info" target="_blank"
              href="<?php the_sub_field('data_url'); ?>"><?php esc_html_e('Download data and charts', 'covid-19'); ?> <i
                class="fa fa-cloud-download" aria-hidden="true"></i></a>
          </div>
          <?php endif; ?>
          <div class="caption">
            <?php the_sub_field('caption'); ?>
          </div>

          <?php
                    break;
                  case 'content_block':
                  ?>
          <h3 class="title"><?php the_sub_field('title'); ?></h3>
          <h4 class="subtitle"><?php the_sub_field('subtitle'); ?></h4>
          <p><?php the_sub_field('paragraph'); ?></p>
          <?php
                }

              // End loop.
              endwhile;

            // No value.
            else :
            // Do something...
            endif;


            // the_post();
            // get_template_part( 'loop-templates/content', 'page' );

            // // If comments are open or we have at least one comment, load up the comment template.
            // if ( comments_open() || get_comments_number() ) {
            // 	comments_template();
            // }
          }
          ?>

        </main><!-- #main -->

      </div><!-- #primary -->

    </div><!-- .row end -->

  </div><!-- #content -->

</div><!-- #full-width-page-wrapper -->

<?php
get_footer();