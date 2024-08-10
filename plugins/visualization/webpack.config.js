const webpack = require('webpack'); 
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry:  {
      entry: path.resolve(__dirname, 'entry.jsx')
    },
    output : {
        filename: 'visualization.js',
        path: path.resolve(__dirname, '../../build/visualization')
    },
    module: {
        rules: [{
            test: /\.(css)$/,
            use: ['style-loader', 'css-loader']
        },{
            test: /\.less$/,
            use: ['style-loader', 'css-loader', 'less-loader']
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