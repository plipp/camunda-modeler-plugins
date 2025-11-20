const path = require('path');

module.exports = {
  mode: 'development',
  entry: './client/client.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.bundle.js',
  },
  devtool: 'cheap-module-source-map',
};
