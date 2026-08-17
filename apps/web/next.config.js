const path = require('path');

const monorepoRoot = path.join(__dirname, '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: path.join(monorepoRoot, '.next-cache', 'web'),
  output: 'standalone',
  // Trace deps from the monorepo root so standalone output lands at a stable path in Docker.
  outputFileTracingRoot: monorepoRoot,
};

module.exports = nextConfig;
