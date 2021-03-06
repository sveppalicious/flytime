const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

require('dotenv').config();

module.exports = (options) => {
  const entry = [
    './app',
  ];

  const plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({
      fileName: 'index.html',
      template: 'app/template.html',
      inject: 'body',
    }),
  ];

  const loaders = [];

  if (options.hot) {
    entry.push('webpack-hot-middleware/client');
    plugins.push(new webpack.HotModuleReplacementPlugin());
    loaders.push({
      test: /\.jsx?$/,
      include: path.join(__dirname, 'app'),
      loaders: ['react-hot', 'babel'],
    });
  } else {
    loaders.push({
      test: /\.jsx?$/,
      include: path.join(__dirname, 'app'),
      loader: 'babel',
    });
  }

  if (options.separateStylesheet) {
    loaders.push({
      test: /\.css$/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1!postcss-loader'),
    });
    plugins.push(new ExtractTextPlugin(`styles${options.longTermCaching ? '.[hash]' : ''}.css`));
  } else {
    loaders.push({
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'],
    });
  }

  if (options.minimize) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.NoErrorsPlugin()
    );
  }

  plugins.push(new webpack.DefinePlugin({
    __DEV__: options.dev,
    GA_TRACKING_CODE: JSON.stringify(process.env.GA_TRACKING_CODE),
    FIREBASE_KEY: JSON.stringify(process.env.FIREBASE_KEY),
    FIREBASE_DOMAIN: JSON.stringify(process.env.FIREBASE_DOMAIN),
    FIREBASE_URL: JSON.stringify(process.env.FIREBASE_URL),
    FIREBASE_BUCKET: JSON.stringify(process.env.FIREBASE_BUCKET),
  }));

  return {
    devtool: options.devtool,
    entry,
    output: {
      path: path.join(__dirname, 'static'),
      filename: `bundle${options.longTermCaching ? '.[hash]' : ''}.js`,
      publicPath: '/_assets/',
    },
    plugins,
    resolve: {
      modulesDirectories: ['node_modules', 'app'],
      extensions: ['', '.js', '.jsx', '.css'],
    },
    module: { loaders },
    postcss: [
      require('postcss-import')({
        path: 'app',
      }),
      require('postcss-css-variables'),
      require('postcss-color-function'),
      require('autoprefixer'),
    ],
  };
};
