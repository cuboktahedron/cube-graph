var path = require('path');
var LicensePack = require('license-pack').default;
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var configs = {
  entry: ['./src/app.ts'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [{
      test: /\.(html?)$/,
      use: {
        loader: 'file-loader',
        options: {
          name: './[name].[ext]'
        }
      }
    }, {
      test: /\.(css|sass|scss)$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader',
        {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('autoprefixer')
              ];
            }
          }
        }
      ]
    }, {
      test: /\.ts$/,
      use: [
        'ts-loader'
      ]
    }]
  },
  resolve: {
    extensions: ['*', '.js', '.ts'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins: []
};

var inProduction = process.env.NODE_ENV === 'production';
var inDevelopment = process.env.NODE_ENV === "development";

if (inProduction) {
  configs.plugins.push(new LicensePack({
    glob: '{LICENSE,license,License}*'
  }));

  configs.plugins.push(new UglifyJSPlugin({
    uglifyOptions: {
      beautify: false,
      ecma: 6,
      compress: true,
      comments: false
    }
  }));
}

module.exports = configs;
