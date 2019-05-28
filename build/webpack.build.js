const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const merge = require('webpack-merge')
const baseConfig = require('./config')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let buildConfig = {
    mode: 'production',
    plugins: [
        // new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin()
    ],
}

module.exports = merge(baseConfig, buildConfig)