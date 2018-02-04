const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");

const srcDir = path.resolve(__dirname, "src");
const distDir = path.resolve(__dirname, "dist");

module.exports = {
	watch: false,
	context: srcDir,
	entry: [
		// Examples of what might make sense to split into bundles
		/*
		framework: ["react", "react-router-dom", "react-loadable", "preact-compat"],
		common: ["styled-components", "marked"],
		*/

		// Your main entry point, usually a .js or .jsx file
		// Since we've not provided a name like above, it will be called main.[chunkhash].js
		"./main.js"
	],
	output: {
		path: distDir,
		filename: "[name].[chunkhash].js",
		publicPath: "/"
	},
	resolve: {
		modules: [path.resolve(__dirname, "node_modules"), path.resolve(__dirname, "src")],
		extensions: [".js", ".jsx", ".html", ".scss", ".sass", ".css"],
		/*
		In case you are using React, alias React with Preact to minimize footprint
		There way be similar ways to handle this scenario with other frameworks

		alias: {
			"react": "preact-compat",
			"react-dom": "preact-compat"
		}
		*/
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: "babel-loader",
						options: {
							plugins: [
								"lodash" // So we can trim down any Lodash weight later on (from dependencies that are highly likely to use it)
							],
						}
					}
				],
				exclude: /node_modules/
			},
			// Accept only modern fonts
			{
				test: /\.(woff|woff2)$/,
				loader: "url-loader",
				options: {
					limit: 1,
					name: "./assets/fonts/[name].[ext]"
				}
			},
			// Accept a range of image type
			{
				test: /\.(jpeg|jpg|png|svg|gif)$/,
				loader: "url-loader", // Use file-loader if you want to deal with the images; url-loader is because we later copy all images and then optimize them through a separate imageoptim pass
				options: {
					limit: 0, // Make sure we don't inline any of the content, but rather copy files instead
				}
			},
			// Accept CSS and Sass
			{
				test: /\.(sass|scss|css)$/,
				loader: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: [
						{
							loader: "css-loader",
							options: {
								importLoaders: 1
							}
						},
						"postcss-loader"
					]
				}),
				exclude: /node_modules/
			},
			// Accept HTML
			{
				test: /\.html$/,
				loader: "raw-loader",
				exclude: /node_modules/
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, "src/assets/images/"),
			to: path.resolve(__dirname, "dist/assets/images/")
		}]),
		new ExtractTextPlugin({
			filename: "assets/styles/[name].css",
			allChunks: true
		}),
		new HtmlWebpackPlugin({
			template: path.join(srcDir, "index-example.html"),
			inject: true,
			path: distDir,
			filename: "index.html",
			minify: {
				collapseWhitespace: true,
				collapseInlineTagWhitespace: false,
				removeComments: true,
				removeRedundantAttributes: true
			}
		}),
		new ScriptExtHtmlWebpackPlugin({
			defaultAttribute: "defer"
		}),
	],
	performance: {
		maxEntrypointSize: 300000,
		maxAssetSize: 300000,
		hints: "warning"
	}
};
