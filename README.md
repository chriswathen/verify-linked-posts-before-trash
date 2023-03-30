# Verify Linked Posts Before Trash

Verify Linked Posts Before Trash is a WordPress plugin that checks for internal links to a post before moving it to the trash. This helps ensure that you do not inadvertently delete a post that is still being referenced by other pages on your site.

## Features

- Displays a warning popup if any internal links to a post are found before moving the post to the trash
- Shows a list of linked posts within the warning popup
- Allows users to choose whether to proceed with moving the post to the trash or cancel the action

## Installation

1. Upload the plugin files to the `/wp-content/plugins/verify-linked-posts-before-trash` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.

## Development

This plugin uses Webpack to compile the JavaScript and CSS files. To set up the development environment, follow these steps:

1. Clone the repository.
2. Run `npm install` to install the required dependencies.
3. Run `npm run watch` to watch for file changes during development with real-time compilation.
4. Make changes to the source files in the `assets` folder. The compiled files will be automatically updated in the `dist` folder.
5. For production, run `npm run build` to compile and minify the assets.

## License

This plugin is released under the [GPLv2 or later license](https://www.gnu.org/licenses/gpl-2.0.html).
