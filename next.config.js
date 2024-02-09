/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "outfit-visualizer.s3.us-west-1.amazonaws.com",
      "oaidalleapiprodscus.blob.core.windows.net",
    ],
  },
  // (Optional) Export as a standalone site
  // See https://nextjs.org/docs/pages/api-reference/next-config-js/output#automatically-copying-traced-files
  output: "standalone", // Feel free to modify/remove this option

  // Indicate that these packages should not be bundled by webpack
  experimental: {
    serverComponentsExternalPackages: ["sharp", "onnxruntime-node"],
    nftTracing: true,
  },
};

module.exports = nextConfig;
