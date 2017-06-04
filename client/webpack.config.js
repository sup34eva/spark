const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const formatter = require('eslint-formatter-pretty');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const precss = require('precss');
const autoprefixer = require('autoprefixer');

const cssConfig = isModule => ExtractTextPlugin.extract({
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
                autoprefixer,
            ]),
        },
    }],
});

function envMerge(env, base, dev, prod = []) {
    if (env !== 'production') {
        return dev.concat(base);
    }

    return prod.concat(base);
}

module.exports = env => ({
    devtool: env !== 'production' ? 'inline-source-map' : undefined,

    entry: envMerge(env, [
        'babel-polyfill',
        './app/index.js',
    ], [
        'react-hot-loader/patch',
        'webpack/hot/only-dev-server',
    ]),

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
            name: 'main',
            children: true,
            minChunks: 2,
        }),
        new ExtractTextPlugin({
            filename: '[name].css',
            disable: env !== 'production',
        }),
        new HtmlWebpackPlugin({
            title: 'Spark',
            filename: 'index.html',
            chunks: ['main'],
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
        contentBase: path.join(__dirname, 'app'),
        overlay: {
            warnings: false,
            errors: true,
        },
    },

    externals: ['ws'],

    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: env !== 'production' ? '/' : undefined,
        chunkFilename: '[name].js',
        filename: '[name].js',
    },
});
