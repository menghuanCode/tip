const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

function resolve(dir) {
    return path.resolve(__dirname, '..', dir)
}

module.exports = {
    mode: 'production',
    entry: {
        layout: resolve('src/main.js'),
    },
    output: {
        path: resolve('dist'),
        filename: 'js/[name].js',
        chunkFilename: 'js/[name].js'
    },
    module: {
        rules: [ {
            test: /\.scss$/,
            use: [{
                loader: MiniCssExtractPlugin.loader,
                options: {

                }
            }, {
                loader: "css-loader",
                options: {
                    importLoaders: 1
                }
            }, {
                loader: "postcss-loader",
                options: {
                    ident: 'postcss',
                    plugins: [
                        require('autoprefixer')(),
                        require('cssnano')()
                    ]
                }
            }, {
                loader: "sass-loader"
            }]
        }, {
            test: /\.js$/,
            exclude: /(node_modules|bower_components|libs)/,
            use: [ {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: ['@babel/plugin-transform-runtime']
                }
            }, {
                loader: "eslint-loader",
            }]
        }, {
            test: /\.(jpe?g|png|gif|svg)$/i,
            use: [{
                loader: "url-loader",
                options: {
                    limit: 10000,
                    publicPath: '../images',
                    outputPath: 'images',
                    name: '[name].[ext]'
                }
            }, {
                loader: "image-webpack-loader",
                options: {
                }
            }]
        }]
    },
    resolve: {
        alias: {
            zepto$: resolve('src/libs/zepto/dist/zepto.min.js')
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: resolve('src/index.html')
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
            chunkFilename: "[id].css",
        }),
        new webpack.ProvidePlugin({
            $: 'zepto'
        })
        // new CopyPlugin([
        //     { from: 'src/libs', to: 'libs' },
        // ])
    ]
}