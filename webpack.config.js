module.exports = {
  mode: 'production',
  output: {
    path: __dirname + "/dist",
    filename: "[name].min.js",
    libraryTarget: 'commonjs2',
    library: "JS-Charts"
  },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  }
}
