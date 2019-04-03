'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const {
  dependencies
} = require('../package.json')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

let mainConfig = {
  entry: {
    main: path.join(__dirname, '../src/main/index')
  },
  externals: [
    ...Object.keys(dependencies || {})
  ],
  optimization: {
    minimize: false
  },
  module: {
    rules: [{
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          ignoreDiagnostics: [],
          logLevel: "warn"
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: {
          loader: 'sm-node-loader',
          options: {
            rewritePath: "./lib/zoomsdk"
          }
        }
      },
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron')
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../src/lib'),
      to: path.resolve(__dirname, '../dist/electron/lib'),
      ignore: ['.*']
    }])
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node']
  },
  resolveLoader: {
    // 去哪个目录下寻找 Loader
    modules: ['node_modules', './loaders/'],
    // 入口文件的后缀
    extensions: ['.js', '.json'],
    // 指明入口文件位置的字段
    mainFields: ['loader', 'main']
  },
  target: 'electron-main'
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig