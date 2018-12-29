const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const config = {
    context: path.resolve(__dirname),
    mode: "development",
    entry: {
      js: "./src/ts/index.tsx"
    },
    output: {
      filename: "[name]/bundle.[name]",
      path: path.resolve(__dirname, 'dist'),
    },
    // Enable sourcemaps for debugging webpack"s output.
    devtool: "source-map",

    resolve: {
      extensions: [".less", ".ts", ".tsx", ".js", ".json"]
    },

    module: {
      rules: [
        { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        { test: /\.tsx?$/, loader: "ts-loader" },
        { test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: false,
              }
            },
            "less-loader",
          ]
        },
        { test: /\.(png|svg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'img/'
              }
            }
          ]
        }
      ]
    },

    plugins: [
      new CleanPlugin(['dist']),
      new CopyPlugin([
        { from: "./src/index.html", to: __dirname + "/dist/" },
        { from: "./src/img", to: __dirname + "/dist/img" },
      ]),
      new MiniCssExtractPlugin({ filename: 'css/bundle.css' }),
    ],
};

module.exports = (env, argv) => {
  return config;
}
