'use strict';

const env = process.env.NODE_ENV;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');
const useContentHash = false;


module.exports = {
    mode: env,
    entry: './src/index.ts',
    devtool: env === 'production' ? undefined : 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|jpeg|svg|gif)$/i,
                type: 'asset/resource'
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/inline'
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserJSPlugin({}),
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins:
        [
            new HtmlWebpackPlugin({template: './public/index.html'})
        ],
    output: {
        filename: env === 'production' && useContentHash ? '[name].[contenthash].js' : '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'BallGame',
        clean: true,
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};
