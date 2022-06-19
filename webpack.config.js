const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require("webpack");



const devMode = process.env.NODE_ENV !== "production";


const optimization = ()=>{
    const config = {
        splitChunks:{
            chunks:'all',   
        },
    } 

    if(!devMode){
        config.minimizer = [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCssWebpackPlugin(),
            new TerserWebpackPlugin(),
        ]
    }

    return config;
}


const defaultCSSLoaders = (...extensions)=>{
    let loaders = [
        {loader: devMode?"style-loader":MiniCssExtractPlugin.loader },
        {loader: "css-loader"},
        {
            // Run postcss actions
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: function () {
                    return [
                        require('autoprefixer')
                    ];
                    }
                }
            }
        }
    ]

    return loaders.concat(extensions);
}

function plugins(isDev){
    let plugins = [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            Util: 'exports-loader?Util!bootstrap/js/dist/util'
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "index.html"),
            minify: {
                collapseWhitespace: !devMode,
            }
        }),
        new CleanWebpackPlugin()
    ]

    if(!isDev){
        return plugins.concat( 
            [
                new MiniCssExtractPlugin(
                    {
                        filename: "css/[name].[contenthash].css",
                        chunkFilename: "css/[id].[contenthash].css",
                    }
                ),
            ] 
        )
    }

    return plugins;
}

module.exports = {
    context: path.resolve(__dirname,'src'),
    mode:'development',
    entry: {
        main:['@babel/polyfill', './index.js',],
    },
    output:{
        filename:'js/[contenthash].[name].bundle.js',
        path: path.resolve(__dirname, 'dist/'),
    },

    resolve: {
        extensions:['.js', '.png', 'scss', 'css'],
        alias:{
            '@': path.resolve(__dirname, 'src'),
        },
    },

    plugins: plugins(devMode),

    module:{
        rules:[
            {
                test: /\.html$/,
                use: [
                  {
                    loader: 'html-loader'
                  }
                ]
            },
            {
                test: /\.css$/i,
                use: defaultCSSLoaders()
            },
            {
                test: /\.s[ac]ss$/i,
                use: defaultCSSLoaders("sass-loader")
            },
            {
                test: /\.(png|jpg|svg|gif)$/i,
                type: 'asset/resource',
                
                generator: {
                    filename: 'images/[hash][ext][query]'
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/[hash][ext][query]'
                }
              },
              {
                  test: /\.js$/,
                  exclude: /node_modules/,
                  use: [{
                      loader:'babel-loader',
                      options:{
                          presets: [
                              '@babel/preset-env',
                          ],
                          plugins:[],
                      }
                  }],
              },
        ]
    },

    optimization: optimization(),

    devServer:{
        port:4200,
        hot: devMode,
    },

    devtool: 'source-map',
}