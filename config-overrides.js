const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
        util: require.resolve('util'),
        url: require.resolve('url'),
        vm: require.resolve('vm-browserify'),
        os: require.resolve('os-browserify/browser'),
        path: require.resolve('path-browserify'),
        fs: require.resolve('browserify-fs'),
        process: require.resolve('process/browser')
    };

    config.resolve = {
        ...config.resolve,
        fallback: fallback
    };

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env)
        })
    ];

    return config;
};
