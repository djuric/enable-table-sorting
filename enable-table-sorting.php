<?php
/**
 * Plugin Name:       Enable Table Sorting
 * Description:       Enable table sorting for Table block
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Zarko Duric
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       enable-table-sorting
 *
 * @package           enable-table-sorting
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Enqueue block editor assets.
 */
function enable_table_sorting_enqueue_editor_assets() {
	$assets = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	wp_enqueue_script(
		'enable-table-sorting-editor',
		plugin_dir_url( __FILE__ ) . '/build/index.js',
		$assets['dependencies'],
		$assets['version'],
		true
	);
}

add_action( 'enqueue_block_editor_assets', 'enable_table_sorting_enqueue_editor_assets' );

/**
 * Register frontend script as module
 */
function enable_table_sorting_register_frontend_script() {
	$assets = include plugin_dir_path( __FILE__ ) . 'build/view.asset.php';

	wp_register_script_module(
		'enable-table-sorting-frontend',
		plugin_dir_url( __FILE__ ) . 'build/view.js',
		$assets['dependencies'],
		$assets['version']
	);
}

add_action( 'init', 'enable_table_sorting_register_frontend_script' );

/**
 * Register additional table block styles
 */
function enable_table_sorting_register_styles() {
	$assets = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

	wp_enqueue_block_style(
		'core/table',
		array(
			'handle'  => 'enable-table-sorting-style',
			'src'     => plugin_dir_url( __FILE__ ) . 'build/style-index.css',
			'version' => $assets['version'],
		)
	);
}

add_action( 'init', 'enable_table_sorting_register_styles' );

/**
 * Add viewScriptModule to table block metadata.
 * This will load the script whenever table block is present on the frontend.
 */
function enable_table_sorting_add_view_script_to_metadata( array $metadata ) {
	if ( 'core/table' === $metadata['name'] ) {
		$metadata['viewScriptModule'] = 'enable-table-sorting-frontend';
	}

	return $metadata;
}

add_filter( 'block_type_metadata', 'enable_table_sorting_add_view_script_to_metadata' );

/**
 * Add Interactivity attributes to table block.
 */
function enable_table_sorting_add_block_interactivity( string $content, array $block ) {
	if ( empty( $block['attrs']['isSortable'] ) ) {
		return $content;
	}

	$processor = new WP_HTML_Tag_Processor( $content );
	$processor->next_tag();
	$processor->add_class( 'is-style-sortable' );

	$attr = [
		'data-wp-interactive' => 'enable-table-sorting/is-sortable',
		'data-wp-context'     => '{ "validForSorting": false }',
		'data-wp-init--setup' => 'callbacks.setup',
	];

	foreach ( $attr as $name => $value ) {
		$processor->set_attribute( $name, $value );
	}

	$inside_thead = false;

	while ( $processor->next_tag( [ 'tag_closers' => 'visit' ] ) ) {
		if ( $processor->get_tag() === 'THEAD' ) {
			$inside_thead = $processor->is_tag_closer() ? false : true;
		}

		if ( $inside_thead && $processor->get_tag() === 'TH' && ! $processor->is_tag_closer() ) {
			$processor->set_attribute( 'role', 'button' );
			$processor->set_attribute( 'tabindex', '0' );
			$processor->set_attribute( 'aria-sort', 'none' );
			$processor->set_attribute( 'data-wp-on--click', 'actions.toggleSort' );
		}
	}

	return $processor->get_updated_html();
}

add_filter( 'render_block_core/table', 'enable_table_sorting_add_block_interactivity', 10, 2 );
