const webpack = require('webpack');

module.exports = function override(config) {
    config.resolve = {
        ...config.resolve,
        fallback: {
            url: require.resolve('url'),
            fs: require.resolve('browserify-fs'),
            buffer: require.resolve('buffer'),
            util: require.resolve('util'),
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            process: false,
            path: false,
            os: false
        }
    };

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
        })
    ];

    return config;
};
