const path = require("path");
require("babel-register");
// Webpack Configuration
const config = {
  // Entry
  entry: {
    home: "./views/index.ejs"
  },
  // Output
  output: {
    path: path.resolve(__dirname, "./webpack"),
    filename: "bundle.js"
  },
  // Loaders
  module: {
    rules: [
      // JavaScript Files
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      // CSS Files
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.ejs$/,
        use: ["ejs-loader", "ejs-html-loader"]
      }
    ]
  },
  // Plugins
  plugins: [],
  context: path.resolve(__dirname, "./src/")
};
// Exports
module.exports = config;
