const webpack = require('webpack'); 
const path = require('path');

module.exports = {
    entry:  path.resolve(__dirname, 'src/entry.js'),
    output : {
        filename: 'heatmap.js',
        //path: path.resolve(__dirname, '../../build/heatmap/test-2/')
        path: path.resolve(__dirname, '../../build/heatmap/')
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
                    loader: 'babel-loader'
                }
            ]
            
        }]
    },
    devtool: 'eval-source-map'
}