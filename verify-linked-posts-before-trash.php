<?php
/**
 * Plugin Name: Verify Linked Posts Before Trash
 * Plugin URI: https://github.com/chriswathen/verify-linked-posts-before-trash/
 * Description: Checks for internal links to a post before moving it to the trash.
 * Version: 1.0.0
 * Author: Chris Wathen
 * Author URI: https://chriswathen.dev
 */

class VerifyLinkedPostsBeforeTrash {
	/**
	 * Constructor method for the VerifyLinkedPostsBeforeTrash class.
	 * Registers the necessary action hooks for the plugin.
	 */
	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueueScripts' ) );
		add_action( 'wp_ajax_vlpbt_check_linked_posts', array( $this, 'checkLinkedPosts' ) );
	}

	/**
	 * Enqueues scripts and styles for the plugin.
	 *
	 * @param string $hook The current admin page hook.
	 */
	public function enqueueScripts( string $hook ) {
		if ( 'edit.php' !== $hook && 'post.php' !== $hook && 'post-new.php' !== $hook ) {
			return;
		}

		wp_enqueue_script( 'sweetalert2', 'https://cdn.jsdelivr.net/npm/sweetalert2@11.3.1/dist/sweetalert2.all.min.js', array(), '11.3.1', true );
		wp_enqueue_style( 'sweetalert2', 'https://cdn.jsdelivr.net/npm/sweetalert2@11.3.1/dist/sweetalert2.min.css', array(), '11.3.1' );
		wp_enqueue_style( 'vlpbt-admin-style', plugin_dir_url( __FILE__ ) . 'dist/css/style.css', array(), '1.0' );

		// Enqueue the scripts and styles for the post listing page
		if ( 'edit.php' === $hook ) {
			wp_enqueue_script( 'vlpbt-admin-script', plugin_dir_url( __FILE__ ) . 'dist/js/admin.js', array(
				'jquery',
				'sweetalert2'
			), '1.0', true );
			wp_localize_script( 'vlpbt-admin-script', 'vlpbt_data', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );
		}

		// Enqueue the scripts for the block editor
		if ( 'post.php' === $hook || 'post-new.php' === $hook ) {
			wp_enqueue_script( 'vlpbt-block-editor-script', plugin_dir_url( __FILE__ ) . 'dist/js/block-editor.js', array(
				'wp-data',
				'jquery',
				'sweetalert2'
			), '1.0', true );
			wp_localize_script( 'vlpbt-block-editor-script', 'vlpbt_data', array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );
		}
	}

	/**
	 * Returns an array of public post types.
	 *
	 * @return array Array of public post types.
	 */
	public function getPublicPostTypes() {
		$args = array(
			'public'   => true,
			'_builtin' => false,
		);

		$custom_post_types = get_post_types( $args, 'names', 'and' );
		$all_post_types    = array_merge( array( 'post', 'page' ), $custom_post_types );

		// Log all the post types if WP_DEBUG is enabled
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( 'All post types: ' . implode( ', ', $all_post_types ) );
		}

		return $all_post_types;
	}

	/**
	 * Searches for linked posts and returns them as a JSON response.
	 */
	public function checkLinkedPosts() {
		global $wpdb;

		$post_id         = intval( $_POST['post_id'] );
		$post_url        = get_permalink( $post_id );
		$post_url_quoted = preg_quote( $post_url, '/' );
		$linked_posts    = array();

		$post_types             = $this->getPublicPostTypes();
		$post_types_placeholder = implode( ', ', array_fill( 0, count( $post_types ), '%s' ) );

		$regexp_pattern = '<a[^>]*' . $post_url_quoted . '[^>]*>';
		$query          = $wpdb->prepare( "SELECT ID, post_title, post_type FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_type IN ($post_types_placeholder) AND post_content REGEXP %s", array_merge( $post_types, array( $regexp_pattern ) ) );
		$results        = $wpdb->get_results( $query );

		if ( ! empty( $results ) ) {
			foreach ( $results as $post ) {
				$linked_posts[] = array( 'ID' => $post->ID, 'title' => $post->post_title, 'post_type' => $post->post_type );
			}
		}

		echo json_encode( $linked_posts );
		wp_die();
	}
}

// Instantiate the class
new VerifyLinkedPostsBeforeTrash();
