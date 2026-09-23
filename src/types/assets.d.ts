// Binary assets bundled by Metro (see metro.config.js): importing one gives its asset id.
declare module '*.db' {
  const assetId: number;
  export default assetId;
}
