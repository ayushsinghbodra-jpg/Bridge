const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: path.join('..', '..', '.next-cache', 'web'),
  output: 'standalone',
};

module.exports = nextConfig;
