const webpack = require('webpack'); 
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry:  {
      entry: path.resolve(__dirname, 'appEntry.jsx')
    },
    output : {
        filename: 'visualizationApp.js',
        path: path.resolve(__dirname, '../../build/visualization')
    },
    devtool: 'eval-source-map',
    module: {
        rules: [{
            test: /\.(css)$/,
            use: [{loader: 'style-loader', options: { attrs: { class: 'hubble-visual-style' },singleton: true }}, 'css-loader']
        },{
            test: /\.less$/,
            use: [{loader: 'style-loader', options: { attrs: { class: 'hubble-visual-style' },singleton: true }}, 'css-loader', 'less-loader']
        },{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015','react','stage-0']
                    }
                }
            ]
            
        }]
    }
}