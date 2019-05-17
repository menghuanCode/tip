const path = require('path')
const merge = require('webpack-merge')
const baseConfig = require('./config')

function resolve(dir) {
    return path.resolve(__dirname, '../', dir)
}


let devConfig = {
    mode: 'development',
    devServer: {
        contentBase: resolve('dist'),
        compress: true,
        port: 8000
    }
}

module.exports = merge(baseConfig, devConfig)