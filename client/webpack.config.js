const path = require('path');
const webpack = require('webpack');
const formatter = require('eslint-formatter-pretty');
const FlowStatusPlugin = require('flow-status-webpack-plugin');

module.exports = {
    debug: true,
    devtool: 'inline-source-map',

    entry: [
        'babel-polyfill',
        './app/index.js',
    ],

    module: {
        preLoaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'eslint-loader',
        }],
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },

    eslint: {
        formatter,
    },

    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
    ],

    output: {
        path: path.join(__dirname, 'app'),
        publicPath: '/dist/',
        fileName: 'bundle.js',
    },
};
