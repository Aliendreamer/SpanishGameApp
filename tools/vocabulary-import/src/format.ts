/** Thousands-separated count for progress lines and summaries: 19,826. */
export const count = (n: number): string => n.toLocaleString('en');

export const formatBytes = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`;
