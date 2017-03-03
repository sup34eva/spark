const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const precss = require('precss');
const springCss = require('./plugins/postcssSpringPlugin');
const autoprefixer = require('autoprefixer');
const formatter = require('eslint-formatter-pretty');

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
    devtool: 'cheap-eval-source-map',

    entry: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        'babel-polyfill',
        './app/index.js',
    ],

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
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
    ],

    target: 'electron-renderer',
    node: {
        __dirname: false,
        __filename: false,
    },

    devServer: {
        hot: true,
        overlay: true,
        contentBase: path.join(__dirname, 'app'),
        publicPath: '/dist/',
        https: {
            key: fs.readFileSync(path.join(__dirname, '..', 'key.pem')),
            cert: fs.readFileSync(path.join(__dirname, '..', 'cert.pem')),
        },
    },

    externals: {
        'libsignal-protocol': 'libsignal',
    },

    output: {
        path: path.join(__dirname, 'app'),
        publicPath: '/dist/',
        filename: 'bundle.js',
    },
};
