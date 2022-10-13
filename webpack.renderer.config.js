const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push(
  {
    test: /\.s[ac]ss$/i,
    use: [
      { loader: "style-loader" },
      { loader: "css-loader" },
      {
        loader: "sass-loader",
        options: {
          implementation: require("sass"),
        },
      },
    ],
  },
  {
    test: /\.html$/,
    use: [
      {
        loader: "html-loader",
      },
    ],
  }
);

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
