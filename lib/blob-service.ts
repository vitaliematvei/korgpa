// lib/blob-service.ts
// Note: Vercel Blob does not support signed URLs with expiration.
// This function is modified to return the blob path as is, assuming it's a public URL.
// If expiration is needed, consider using a different storage service.

export async function generateTemporaryDownloadUrl(blobPath: string) {
  // For Vercel Blob, URLs are public and do not expire.
  // Return the blob path directly (assuming it's the full URL or can be constructed).
  return blobPath;
}
