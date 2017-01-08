const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const formatter = require('eslint-formatter-pretty');

module.exports = {
    debug: true,
    devtool: 'inline-source-map',

    entry: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
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
        }, {
            test: /\.global\.css$/,
            loaders: [
                'style-loader',
                'css-loader?sourceMap&importLoaders=1!postcss'
            ]
        }, {
            test: /^((?!\.global).)*\.css$/,
            loaders: [
                'style-loader',
                'css-loader?modules&sourceMap&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss'
            ]
        }],
    },

    eslint: {
        formatter,
    },

    postcss() {
        return [
            autoprefixer({
                browsers: [
                    'Chrome > 50',
                ],
            }),
        ];
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
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
