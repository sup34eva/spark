const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const formatter = require('eslint-formatter-pretty');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const precss = require('precss');
const autoprefixer = require('autoprefixer');
const springCss = require('./plugins/postcssSpringPlugin');

function cssConfig(isModule) {
    return ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
            loader: 'css-loader',
            options: {
                sourceMap: true,
                importLoaders: 1,
                modules: isModule,
                localIdentName: isModule ? '[name]__[local]___[hash:base64:5]' : undefined,
            },
        }, {
            loader: 'postcss-loader',
            options: {
                sourceMap: true,
                plugins: () => ([
                    precss,
                    springCss,
                    autoprefixer,
                ]),
            },
        }],
    });
}

function envMerge(env, base, dev, prod = []) {
    if (env !== 'production') {
        return dev.concat(base);
    }

    return prod.concat(base);
}

const entries = (env, path) => envMerge(env, [
    'babel-polyfill',
    path,
], [
    'react-hot-loader/patch',
    'webpack/hot/only-dev-server',
]);

module.exports = env => ({
    devtool: 'inline-source-map',

    entry: {
        window: entries(env, './window/index.js'),
        app: entries(env, './app/index.js'),
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            enforce: 'pre',
            loader: 'eslint-loader',
            options: {
                formatter,
            },
        }, {
            test: /\.js$/,
            exclude: /node_modules/,
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

    plugins: envMerge(env, [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'common',
            filename: 'common.js',
            chunks: ['window', 'app'],
        }),
        new ExtractTextPlugin('[name].css'),
        new HtmlWebpackPlugin({
            title: 'Spark',
            filename: 'window.html',
            chunks: ['common', 'window'],
        }),
        new HtmlWebpackPlugin({
            title: 'Spark',
            filename: 'app.html',
            chunks: ['common', 'app'],
        }),
    ], [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
    ]),

    target: 'electron-renderer',
    node: {
        __dirname: false,
        __filename: false,
    },

    devServer: {
        hot: true,
        host: 'spark.leops.me',
        publicPath: '/',
        contentBase: [
            path.join(__dirname, 'window'),
            path.join(__dirname, 'app'),
        ],
        overlay: {
            warnings: false,
            errors: true,
        },
    },

    externals: ['ws'],

    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: env !== 'production' ? '/' : undefined,
        filename: '[name].js',
    },
});
