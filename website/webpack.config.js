const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: __dirname + "/app/app.js",//已多次提及的唯一入口文件
  output: {
    path: __dirname + "/",//打包后的文件存放的地方
    filename: "bundle.js"//打包后输出文件的文件名
  },
  devServer: {
    contentBase: "./",//本地服务器所加载的页面所在的目录
    historyApiFallback: true,//不跳转
    inline: true//实时刷新
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: __dirname+'/app',
        use: ['babel-loader']
      },
      {
        test: /\.html$/,
        include: __dirname+'/app',
        use: ['raw-loader']
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          }, {
            loader: "css-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new UglifyJsPlugin()
  ]
};
