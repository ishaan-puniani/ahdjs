const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = [
  {
    mode: "development",
    devtool: "cheap-module-source-map",
    entry: "./src/demo/index.ts",
    output: {
      filename: "index.js",
    },
    optimization: {
      minimize: false,
    },
    devServer: {
      open: true,
      hot: true,
      host: "localhost",
      port: 9000,
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: "html-loader",
          options: {
            minimize: {
              caseSensitive: true,
              collapseWhitespace: true,
              conservativeCollapse: true,
              keepClosingSlash: true,
              minifyCSS: false,
              minifyJS: true,
              removeComments: true,
              removeRedundantAttributes: true,
              removeScriptTypeAttributes: true,
              removeStyleLinkTypeAttributes: true,
            },
          },
        },
        {
          test: /\.(m|j|t)s$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
              },
            },
            "sass-loader",
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/index.css",
      }),
      new HtmlWebpackPlugin(),
    ],
    resolve: {
      extensions: [".ts", ".js", ".json"],
    },
  },
];
