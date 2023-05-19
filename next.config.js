const withPreact = require("next-plugin-preact");

const nextConfig = withPreact({
  experimental: {
    esmExternals: false,
  },
  output: "standalone",
});

module.exports = nextConfig;
