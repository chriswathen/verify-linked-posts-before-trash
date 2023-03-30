const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		entry: {
			admin: './assets/js/admin.js',
			'block-editor': './assets/js/block-editor.js',
			style: './assets/css/style.css',
		},
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: 'js/[name].js',
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [
						MiniCssExtractPlugin.loader,
						'css-loader',
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									plugins: [
										require('postcss-preset-env')({
											autoprefixer: { grid: true },
										}),
									],
								},
							},
						},
					],
				},
			],
		},
		plugins: [
			new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
			new RemoveEmptyScriptsPlugin(),
		],
		optimization: {
			minimize: isProduction,
			minimizer: [
				new TerserPlugin({
					extractComments: false,
				}),
				new CssMinimizerPlugin(),
			],
		},
	};
};
