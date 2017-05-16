const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const formatter = require('eslint-formatter-pretty');

const precss = require('precss');
const autoprefixer = require('autoprefixer');
const springCss = require('./plugins/postcssSpringPlugin');

function cssConfig(isModule) {
    return [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                sourceMap: true,
                importLoaders: 1,
                modules: isModule,
                localIdentName: isModule ? '[name]__[local]___[hash:base64:5]' : undefined,
            },
        },
        {
            loader: 'postcss-loader',
            options: {
                sourceMap: true,
                plugins: () => ([
                    precss,
                    springCss,
                    autoprefixer,
                ]),
            },
        },
    ];
}

module.exports = {
    devtool: 'source-map',

    entry: {
        window: [
            'babel-polyfill',
            './window/index.js',
        ],
        app: [
            'react-hot-loader/patch',
            'webpack-hot-middleware/client',
            'babel-polyfill',
            './app/index.js',
        ],
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|libsignal-protocol)/,
            enforce: 'pre',
            loader: 'eslint-loader',
            options: {
                formatter,
            },
        }, {
            test: /\.js$/,
            exclude: /(node_modules|libsignal-protocol)/,
            loader: 'babel-loader',
        }, {
            test: /\.global\.css$/,
            use: cssConfig(false),
        }, {
            test: /^((?!\.global).)*\.css$/,
            use: cssConfig(true),
        }, {
            test: /\.json$/,
            loader: 'json-loader'
        }],
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'global.GENTLY': false,
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            filename: 'common.js',
        }),
    ],

    target: 'electron-renderer',
    node: {
        __dirname: false,
        __filename: false,
    },

    devServer: {
        hot: true,
        // inline: true,
        host: 'spark.leops.me',
        publicPath: '/dist/',
        contentBase: [
            path.join(__dirname, 'window'),
            path.join(__dirname, 'app'),
        ],
        https: {
            key: fs.readFileSync(path.join(__dirname, '..', 'key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '..', 'cert.pem')),
        },
        overlay: {
            warnings: false,
            errors: true,
        },
    },

    externals: {
        'libsignal-protocol': 'libsignal',
    },

    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/dist/',
        filename: '[name].js',
    },
};
