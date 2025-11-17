module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
        vm: require.resolve('vm-browserify'),
        stream: require.resolve('stream-browserify')
      };
      return webpackConfig;
    },
  },
};
