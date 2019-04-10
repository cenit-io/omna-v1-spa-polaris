let path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: [
        path.join(__dirname, 'src/index.js'),
    ],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle_[hash].js',
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({ filename: 'index.html', template: './src/index.html' }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        presets: ['react'],
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
                            outputPath: 'images/'
                        }
                    }
                ]
            }
        ],
    },

    optimization: {
        splitChunks: {
            cacheGroups: {
                shopify: {
                    test: /[\\/]node_modules[\\/](@shopify)[\\/]/,
                    chunks: 'all',
                    priority: -10,
                    filename: 'bundle_[name].js'
                },
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'all',
                    priority: -20,
                    filename: 'bundle_[name].js'
                },
            }
        }
    }
};
