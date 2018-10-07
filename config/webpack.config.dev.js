'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';


const targetIsElectron = process.env.ELECTRON_ENV === "1";
console.log("Electron mode:", targetIsElectron, process.env.ELECTRON_ENV);

module.exports = {
    target: targetIsElectron ? 'electron-main' : 'web',
    devtool: 'cheap-module-source-map',
    entry: [
        require.resolve('webpack-dev-server/client') + '?/',
        require.resolve('webpack/hot/dev-server'),
        //require.resolve('react-dev-utils/webpackHotDevClient'),
        paths.appIndexJs,
    ],
    output: {
        // Add /* filename */ comments to generated require()s in the output.
        pathinfo: true,
        // This does not produce a real file. It's just the virtual path that is
        // served by WebpackDevServer in development. This is the JS bundle
        // containing code from all our entry points, and the Webpack runtime.
        filename: 'static/js/bundle.js',
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: 'static/js/[name].chunk.js',
        // This is the URL that app is served from. We use "/" in development.
        publicPath: publicPath,
        // Point sourcemap entries to original disk location (format as URL on Windows)
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    resolve: {
        modules: [
            'node_modules',
            paths.appNodeModules],
        extensions: ['.js', '.jsx'],
        plugins: [
            // Prevents users from importing files from outside of src/ (or node_modules/).
            // This often causes confusion because we only process files within src/ with babel.
            // To fix this, we prevent you from importing files out of src/ -- if you'd like to,
            // please link the files into your node_modules/ and let module-resolution kick in.
            // Make sure your source files are compiled, as they will not be processed in any way.
            new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
        ],
    },
    module: {
        strictExportPresence: true,
        rules: [
            // TODO: Disable require.ensure as it's not a standard language feature.
            // We are waiting for https://github.com/facebookincubator/create-react-app/issues/2176.
            // { parser: { requireEnsure: false } },

            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            {
                test: /\.(js|jsx)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            formatter: eslintFormatter,
                            eslintPath: require.resolve('eslint'),

                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: paths.appSrc,
            },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works like "file" loader except that it embeds assets
                    // smaller than specified limit in bytes as data URLs to avoid requests.
                    // A missing `test` is equivalent to a match.
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                    // Process JS with Babel.
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: paths.appSrc,
                        loader: require.resolve('babel-loader'),
                        options: {

                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                        },
                    },
                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // "style" loader turns CSS into JS modules that inject <style> tags.
                    // In production, we use a plugin to extract that CSS to a file, but
                    // in development "style" loader enables hot editing of CSS.
                    {
                        test: /\.css$/,
                        use: [
                            require.resolve('style-loader'),
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                },
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    // Necessary for external CSS imports to work
                                    // https://github.com/facebookincubator/create-react-app/issues/2677
                                    ident: 'postcss',
                                    plugins: () => [
                                        require('postcss-flexbugs-fixes'),
                                        autoprefixer({
                                            browsers: [
                                                '>1%',
                                                'last 4 versions',
                                                'Firefox ESR',
                                                'not ie < 9', // React doesn't support IE8 anyway
                                            ],
                                            flexbox: 'no-2009',
                                        }),
                                    ],
                                },
                            },
                        ],
                    },
                    // "file" loader makes sure those assets get served by WebpackDevServer.
                    // When you `import` an asset, you get its (virtual) filename.
                    // In production, they would get copied to the `build` folder.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
                        loader: require.resolve('file-loader'),
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]',
                        },
                    },
                ],
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
        ],
    },
    plugins: [
        // Generates an `index.html` file with the <script> injected.
        new HtmlWebpackPlugin({
            inject: true,
            template: paths.appHtml,
        }),
        // Add module names to factory functions so they appear in browser profiler.
        new webpack.NamedModulesPlugin(),
        // This is necessary to emit hot updates (currently CSS only):
        new webpack.HotModuleReplacementPlugin(),
        // Autoreload after npm install
        new WatchMissingNodeModulesPlugin(paths.appNodeModules),

    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
        hints: false,
    },
    externals: {
        serialport: "serialport"
    }
};


if (!targetIsElectron) {
  module.exports.plugins.push(new webpack.IgnorePlugin(/electron$/));
}
