/**
 * MyProtector WooCommerce Integration Plugin
 * 
 * This plugin adds MyProtector trust badges and review functionality
 * to WooCommerce-powered WordPress sites.
 * 
 * @package MyProtector
 * @version 1.0.0
 * @author MyProtector
 */

<?php
/**
 * Plugin Name: MyProtector for WooCommerce
 * Plugin URI: https://myprotector.org/woocommerce
 * Description: Add MyProtector trust badges, reviews, and traffic light verification to your WooCommerce store
 * Version: 1.0.0
 * Author: MyProtector
 * Author URI: https://myprotector.org
 * License: GPL v2 or later
 * Text Domain: myprotector-woocommerce
 * Domain Path: /languages
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('MPWC_VERSION', '1.0.0');
define('MPWC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MPWC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('MPWC_API_URL', 'https://api.myprotector.org');
define('MPWC_WIDGETS_URL', 'https://cdn.myprotector.org/widgets');

/**
 * Main MyProtector WooCommerce Class
 */
class MyProtector_WooCommerce {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
    /**
     * Get instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('plugins_loaded', array($this, 'init'));
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Check WooCommerce is active
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', array($this, 'woo_missing_notice'));
            return;
        }
        
        // Load text domain
        load_plugin_textdomain('myprotector-woocommerce', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Admin hooks
        if (is_admin()) {
            add_action('admin_menu', array($this, 'add_admin_menu'));
            add_action('admin_init', array($this, 'register_settings'));
        }
        
        // Frontend hooks
        add_action('wp_head', array($this, 'output_header_scripts'));
        add_action('woocommerce_after_shop_loop_item', array($this, 'display_product_rating_badge'), 20);
        add_action('woocommerce_single_product_summary', array($this, 'display_product_trust_badge'), 5);
        add_action('woocommerce_widget_layered_nav_end', array($this, 'display_filter_trust_badge'));
        
        // Shortcodes
        add_shortcode('myprotector_badge', array($this, 'shortcode_badge'));
        add_shortcode('myprotector_carousel', array($this, 'shortcode_carousel'));
        add_shortcode('myprotector_reviews', array($this, 'shortcode_reviews'));
        
        // AJAX handlers
        add_action('wp_ajax_mpwc_submit_review', array($this, 'ajax_submit_review'));
        add_action('wp_ajax_nopriv_mpwc_submit_review', array($this, 'ajax_submit_review'));
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        
        // Webhook handler for incoming reviews
        add_action('rest_api_init', array($this, 'register_webhook_endpoint'));
    }
    
    /**
     * Admin notice for missing WooCommerce
     */
    public function woo_missing_notice() {
        ?>
        <div class="notice notice-error">
            <p><?php _e('MyProtector requires WooCommerce to be installed and active.', 'myprotector-woocommerce'); ?></p>
        </div>
        <?php
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_menu_page(
            __('MyProtector', 'myprotector-woocommerce'),
            __('MyProtector', 'myprotector-woocommerce'),
            'manage_options',
            'myprotector-woocommerce',
            array($this, 'admin_page'),
            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZhtlcz0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZmZmIi8+PC9yZWN0PjxwYXRoIGQ9Ik0xMCAxM2MtMS42NiAwLTMtMS4zNC0zLTMwcyIxLjM0LTMgMy0zIDMgMS4zNCAzIDMgMy0xLjM0IDMtMy0xLjM0LTMtMyAzLTEuMzQgMy0zIDMuMzRMMTEgMTFoOHYtMmgtOHptMC0zaC0yLjc2TDcuMjQgN2wzLjc2IDMgMy43Ni0zTDEzIDdaIiBmaWxsPSIjZmZmIi8+PC9wYXRoPjwvc3ZnPg==',
            56
        );
        
        add_submenu_page(
            'myprotector-woocommerce',
            __('Settings', 'myprotector-woocommerce'),
            __('Settings', 'myprotector-woocommerce'),
            'manage_options',
            'myprotector-woocommerce',
            array($this, 'admin_page')
        );
        
        add_submenu_page(
            'myprotector-woocommerce',
            __('Reviews', 'myprotector-woocommerce'),
            __('Reviews', 'myprotector-woocommerce'),
            'manage_options',
            'mpwc-reviews',
            array($this, 'reviews_page')
        );
        
        add_submenu_page(
            'myprotector-woocommerce',
            __('Widgets', 'myprotector-woocommerce'),
            __('Embed Widgets', 'myprotector-woocommerce'),
            'manage_options',
            'mpwc-widgets',
            array($this, 'widgets_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('mpwc_settings', 'mpwc_api_key');
        register_setting('mpwc_settings', 'mpwc_business_id');
        register_setting('mpwc_settings', 'mpwc_auto_reviews');
        register_setting('mpwc_settings', 'mpwc_display_position');
        register_setting('mpwc_settings', 'mpwc_badge_theme');
        register_setting('mpwc_settings', 'mpwc_trust_signals');
        
        add_settings_section('mpwc_general', __('General Settings', 'myprotector-woocommerce'), array($this, 'section_general'), 'mpwc_settings');
        add_settings_field('mpwc_api_key', __('API Key', 'myprotector-woocommerce'), array($this, 'field_api_key'), 'mpwc_settings', 'mpwc_general');
        add_settings_field('mpwc_business_id', __('Business ID', 'myprotector-woocommerce'), array($this, 'field_business_id'), 'mpwc_settings', 'mpwc_general');
        add_settings_field('mpwc_auto_reviews', __('Auto-send review invites', 'myprotector-woocommerce'), array($this, 'field_auto_reviews'), 'mpwc_settings', 'mpwc_general');
    }
    
    /**
     * Section callback
     */
    public function section_general() {
        echo '<p>' . __('Configure your MyProtector integration settings.', 'myprotector-woocommerce') . '</p>';
    }
    
    /**
     * API Key field
     */
    public function field_api_key() {
        $value = get_option('mpwc_api_key', '');
        echo '<input type="text" name="mpwc_api_key" value="' . esc_attr($value) . '" class="regular-text" placeholder="mp_live_..." />';
        echo '<p class="description">' . __('Get your API key from your MyProtector dashboard.', 'myprotector-woocommerce') . '</p>';
    }
    
    /**
     * Business ID field
     */
    public function field_business_id() {
        $value = get_option('mpwc_business_id', '');
        echo '<input type="text" name="mpwc_business_id" value="' . esc_attr($value) . '" class="regular-text" placeholder="Your Business Slug" />';
    }
    
    /**
     * Auto reviews field
     */
    public function field_auto_reviews() {
        $value = get_option('mpwc_auto_reviews', 'yes');
        echo '<select name="mpwc_auto_reviews">
            <option value="yes" ' . selected($value, 'yes', false) . '>' . __('Yes', 'myprotector-woocommerce') . '</option>
            <option value="no" ' . selected($value, 'no', false) . '>' . __('No', 'myprotector-woocommerce') . '</option>
        </select>';
        echo '<p class="description">' . __('Automatically send review invitations after order completion.', 'myprotector-woocommerce') . '</p>';
    }
    
    /**
     * Admin page content
     */
    public function admin_page() {
        if (!current_user_can('manage_options')) return;
        ?>
        <div class="wrap">
            <h1><?php _e('MyProtector Settings', 'myprotector-woocommerce'); ?></h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('mpwc_settings'); ?>
                <?php do_settings_sections('mpwc_settings'); ?>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * Reviews page
     */
    public function reviews_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('MyProtector Reviews', 'myprotector-woocommerce'); ?></h1>
            
            <div class="mpwc-reviews-list">
                <p><?php _e('View and manage reviews from your MyProtector dashboard.', 'myprotector-woocommerce'); ?></p>
                <a href="https://myprotector.org/dashboard/business/reviews" target="_blank" class="button button-primary">
                    <?php _e('Open MyProtector Dashboard', 'myprotector-woocommerce'); ?>
                </a>
            </div>
            
            <h2><?php _e('Recent Reviews', 'myprotector-woocommerce'); ?></h2>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th><?php _e('Product', 'myprotector-woocommerce'); ?></th>
                        <th><?php _e('Rating', 'myprotector-woocommerce'); ?></th>
                        <th><?php _e('Review', 'myprotector-woocommerce'); ?></th>
                        <th><?php _e('Customer', 'myprotector-woocommerce'); ?></th>
                        <th><?php _e('Date', 'myprotector-woocommerce'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $reviews = $this->get_external_reviews();
                    if (!empty($reviews)) {
                        foreach ($reviews as $review) {
                            echo '<tr>';
                            echo '<td>' . esc_html($review['product']) . '</td>';
                            echo '<td>' . str_repeat('★', $review['rating']) . str_repeat('☆', 5 - $review['rating']) . '</td>';
                            echo '<td>' . esc_html(wp_trim_words($review['content'], 10)) . '</td>';
                            echo '<td>' . esc_html($review['customer']) . '</td>';
                            echo '<td>' . esc_html($review['date']) . '</td>';
                            echo '</tr>';
                        }
                    } else {
                        echo '<tr><td colspan="5">' . __('No reviews yet.', 'myprotector-woocommerce') . '</td></tr>';
                    }
                    ?>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    /**
     * Widgets page
     */
    public function widgets_page() {
        $business_id = get_option('mpwc_business_id', '');
        ?>
        <div class="wrap">
            <h1><?php _e('Embed Widgets', 'myprotector-woocommerce'); ?></h1>
            
            <p><?php _e('Add these widgets to your WooCommerce store to display trust badges and reviews.', 'myprotector-woocommerce'); ?></p>
            
            <h2><?php _e('Trust Badge', 'myprotector-woocommerce'); ?></h2>
            <p><?php _e('Add this code to display the main trust badge:', 'myprotector-woocommerce'); ?></p>
            <textarea readonly class="widefat" rows="3">[myprotector_badge business="<?php echo esc_attr($business_id); ?>"]</textarea>
            
            <h2><?php _e('Reviews Carousel', 'myprotector-woocommerce'); ?></h2>
            <p><?php _e('Add this shortcode to display customer reviews:', 'myprotector-woocommerce'); ?></p>
            <textarea readonly class="widefat" rows="3">[myprotector_carousel business="<?php echo esc_attr($business_id); ?>" count="5"]</textarea>
            
            <h2><?php _e('Product Reviews', 'myprotector-woocommerce'); ?></h2>
            <p><?php _e('Display reviews for a specific product:', 'myprotector-woocommerce'); ?></p>
            <textarea readonly class="widefat" rows="3">[myprotector_reviews product_id="123"]</textarea>
        </div>
        <?php
    }
    
    /**
     * Output header scripts
     */
    public function output_header_scripts() {
        $api_key = get_option('mpwc_api_key', '');
        $business_id = get_option('mpwc_business_id', '');
        
        if (empty($api_key) || empty($business_id)) return;
        
        ?>
        <script>
            window.mpConfig = {
                apiKey: '<?php echo esc_js($api_key); ?>',
                businessId: '<?php echo esc_js($business_id); ?>',
                url: '<?php echo esc_url(MPWC_API_URL); ?>'
            };
        </script>
        <?php
    }
    
    /**
     * Display product rating badge
     */
    public function display_product_rating_badge() {
        global $product;
        if (!$product) return;
        
        $rating = $product->get_average_rating();
        if ($rating == 0) return;
        
        $badge_theme = get_option('mpwc_badge_theme', 'light');
        $theme_class = $badge_theme === 'dark' ? 'mp-badge-dark' : 'mp-badge-light';
        
        echo '<div class="mpwc-product-badge ' . esc_attr($theme_class) . '">';
        echo '<span class="mpwc-stars">' . str_repeat('★', round($rating)) . '</span>';
        echo '<span class="mpwc-rating">' . number_format($rating, 1) . '</span>';
        echo '</div>';
    }
    
    /**
     * Display product trust badge
     */
    public function display_product_trust_badge() {
        $business_id = get_option('mpwc_business_id', '');
        if (empty($business_id)) return;
        
        echo '<div class="mpwc-trust-section">';
        echo '<div class="mpwc-badge-container" data-business="' . esc_attr($business_id) . '"></div>';
        echo '</div>';
    }
    
    /**
     * Display filter trust badge
     */
    public function display_filter_trust_badge() {
        $show_trust = get_option('mpwc_trust_signals', 'yes');
        if ($show_trust !== 'yes') return;
        
        echo '<div class="mpwc-filter-badge">';
        echo '<small>' . __('Powered by MyProtector Trust Signals', 'myprotector-woocommerce') . '</small>';
        echo '</div>';
    }
    
    /**
     * Shortcode: Badge
     */
    public function shortcode_badge($atts) {
        $atts = shortcode_atts(array(
            'business' => get_option('mpwc_business_id', ''),
            'theme' => 'light',
        ), $atts, 'myprotector_badge');
        
        return '<div class="mp-badge mp-badge-' . esc_attr($atts['theme']) . '" data-business="' . esc_attr($atts['business']) . '"></div>';
    }
    
    /**
     * Shortcode: Carousel
     */
    public function shortcode_carousel($atts) {
        $atts = shortcode_atts(array(
            'business' => get_option('mpwc_business_id', ''),
            'count' => '5',
        ), $atts, 'myprotector_carousel');
        
        return '<div class="mp-carousel" data-business="' . esc_attr($atts['business']) . '" data-count="' . esc_attr($atts['count']) . '"></div>';
    }
    
    /**
     * Shortcode: Reviews
     */
    public function shortcode_reviews($atts) {
        $atts = shortcode_atts(array(
            'product_id' => '',
            'limit' => '10',
        ), $atts, 'myprotector_reviews');
        
        if (empty($atts['product_id'])) return '';
        
        return '<div class="mp-reviews mp-reviews-product-' . esc_attr($atts['product_id']) . '" data-limit="' . esc_attr($atts['limit']) . '"></div>';
    }
    
    /**
     * Enqueue scripts
     */
    public function enqueue_scripts() {
        $api_key = get_option('mpwc_api_key', '');
        
        if (empty($api_key)) return;
        
        wp_enqueue_style('mpwc-styles', MPWC_PLUGIN_URL . 'assets/css/frontend.css', array(), MPWC_VERSION);
        wp_enqueue_script('mpwc-script', MPWC_WIDGETS_URL . '/embed.js', array(), MPWC_VERSION, true);
    }
    
    /**
     * AJAX: Submit review
     */
    public function ajax_submit_review() {
        check_ajax_referer('mpwc_nonce', 'nonce');
        
        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;
        $rating = isset($_POST['rating']) ? absint($_POST['rating']) : 0;
        $content = isset($_POST['content']) ? sanitize_textarea_field($_POST['content']) : '';
        
        if (!$product_id || !$rating || !$content) {
            wp_send_json_error(array('message' => __('Missing required fields.', 'myprotector-woocommerce')));
        }
        
        // Get customer info
        $customer_id = get_current_user_id();
        $customer = $customer_id ? get_userdata($customer_id) : null;
        
        // Prepare API call
        $api_key = get_option('mpwc_api_key', '');
        $business_id = get_option('mpwc_business_id', '');
        
        $response = wp_remote_post(MPWC_API_URL . '/api/reviews', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'businessId' => $business_id,
                'productId' => $product_id,
                'userId' => $customer ? $customer->user_email : 'guest',
                'rating' => $rating,
                'title' => __('WooCommerce Review', 'myprotector-woocommerce'),
                'content' => $content,
            )),
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => $response->get_error_message()));
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($body && isset($body['id'])) {
            wp_send_json_success(array('message' => __('Review submitted successfully!', 'myprotector-woocommerce')));
        } else {
            wp_send_json_error(array('message' => __('Failed to submit review.', 'myprotector-woocommerce')));
        }
    }
    
    /**
     * Register webhook endpoint
     */
    public function register_webhook_endpoint() {
        register_rest_route('myprotector-woocommerce/v1', '/webhook', array(
            'methods' => 'POST',
            'callback' => array($this, 'handle_webhook'),
            'permission_callback' => '__return_true',
        ));
    }
    
    /**
     * Handle webhook
     */
    public function handle_webhook($request) {
        $payload = $request->get_json_params();
        
        if (isset($payload['type'])) {
            switch ($payload['type']) {
                case 'new_review':
                    $this->handle_new_review_webhook($payload);
                    break;
                case 'review_approved':
                    $this->handle_review_approved_webhook($payload);
                    break;
            }
        }
        
        return new WP_REST_Response(array('success' => true), 200);
    }
    
    /**
     * Handle new review webhook
     */
    private function handle_new_review_webhook($payload) {
        // Log new review
        error_log('MyProtector New Review: ' . print_r($payload, true));
        
        // Could send admin notification here
        do_action('mpwc_new_review_received', $payload);
    }
    
    /**
     * Handle review approved webhook
     */
    private function handle_review_approved_webhook($payload) {
        // Update product rating if needed
        if (isset($payload['product_id'])) {
            $product_id = $payload['product_id'];
            $product = wc_get_product($product_id);
            
            if ($product) {
                // Recalculate average rating
                $args = array(
                    'post_type' => 'product_review',
                    'status' => 'approve',
                    'meta_key' => 'rating',
                    'post_id' => $product_id,
                );
                $comments = get_comments($args);
                
                $total = 0;
                $count = 0;
                foreach ($comments as $comment) {
                    $rating = get_comment_meta($comment->comment_ID, 'rating', true);
                    if ($rating) {
                        $total += intval($rating);
                        $count++;
                    }
                }
                
                if ($count > 0) {
                    update_post_meta($product_id, '_wc_average_rating', round($total / $count, 2));
                }
            }
        }
        
        do_action('mpwc_review_approved', $payload);
    }
    
    /**
     * Get external reviews from API
     */
    private function get_external_reviews() {
        $api_key = get_option('mpwc_api_key', '');
        $business_id = get_option('mpwc_business_id', '');
        
        if (empty($api_key) || empty($business_id)) {
            return array();
        }
        
        $response = wp_remote_get(MPWC_API_URL . '/api/businesses/' . $business_id . '/reviews', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
            ),
        ));
        
        if (is_wp_error($response)) {
            return array();
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        return isset($body['items']) ? $body['items'] : array();
    }
    
    /**
     * Send review invitation after order
     */
    public function send_review_invitation($order_id) {
        $auto_reviews = get_option('mpwc_auto_reviews', 'yes');
        if ($auto_reviews !== 'yes') return;
        
        $order = wc_get_order($order_id);
        if (!$order) return;
        
        $customer_email = $order->get_billing_email();
        $customer_name = $order->get_billing_first_name();
        $business_id = get_option('mpwc_business_id', '');
        
        if (empty($customer_email) || empty($business_id)) return;
        
        // Send to MyProtector API
        $api_key = get_option('mpwc_api_key', '');
        
        wp_remote_post(MPWC_API_URL . '/api/review-invites', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ),
            'body' => json_encode(array(
                'businessId' => $business_id,
                'customerEmail' => $customer_email,
                'customerName' => $customer_name,
                'orderId' => $order_id,
            )),
        ));
    }
}

// Hook into WooCommerce order completion
add_action('woocommerce_order_status_completed', function($order_id) {
    $mpwc = MyProtector_WooCommerce::get_instance();
    $mpwc->send_review_invitation($order_id);
});

// Initialize
MyProtector_WooCommerce::get_instance();