const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
var GitRevisionPlugin = require('git-revision-webpack-plugin')

module.exports = env => {
    let output;
    if (!env) {
        output = {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
            publicPath: ''
        }
    } else {
        output = {
            filename: `[name].bundle.js`,
            path: path.resolve(__dirname, `demos/demo_[git-revision-branch]`),
            publicPath: ''
        }
    }

    return {
        context: __dirname,
        node: {
            __filename: true
        },
        entry: './src/app/index.js',
        devtool: 'inline-source-map',
        devServer: {
            contentBase: './src/public',
            port: 9000,
            inline: true,
            hot: true
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: __dirname + "/src/public/index.html",
                inject: 'body'
            }),
            new GitRevisionPlugin({
                branch: true
            }),
            // new webpack.WatchIgnorePlugin([
            //     /\.vert$/,
            //     /\.frag$/
            // ]),
            new webpack.NamedModulesPlugin()
        ],
        output,
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [{
                        loader: "style-loader" // creates style nodes from JS strings
                    }, {
                        loader: "css-loader" // translates CSS into CommonJS
                    }, {
                        loader: "sass-loader" // compiles Sass to CSS
                    }]
                },
                {
                    test: /\.(ogg|mp3|jpe?g|png|gif|frag|vert|obj|svg|wav|mpe?g)$/i,
                    loader: 'file-loader'
                },
                {
                    test: /\.js$/,
                    use: 'babel-loader',
                    exclude: [
                        /node_modules/
                    ]
                },
                {
                    test: /node_modules/,
                    loader: 'ify-loader'
                },
                {
                    enforce: 'post',
                    test: /\.js$/,
                    loader: 'ify-loader'
                }
            ]
        }
    }
}

