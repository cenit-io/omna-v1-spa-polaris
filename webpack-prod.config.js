const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: [
        join(__dirname, 'src/index.js'),
    ],
    output: {
        path: join(__dirname, 'build'),
        filename: 'bundle_' + (new Date()).getTime() + '.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                include: join(__dirname, 'src'),
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        presets: ['env', 'react'],
                    },
                }],
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|jpg|gif|icon)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images/',
                            publicPath: 'https://omna-dev.s3.amazonaws.com/images/'
                        }
                    }
                ]
            }
        ],
    },
};
