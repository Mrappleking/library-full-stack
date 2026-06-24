/**
 * Cover Service — resolves book covers from free APIs.
 * Strategy: OpenLibrary (free) → CSS placeholder
 */
export async function resolveCover(isbn: string): Promise<string | null> {
  // 1. OpenLibrary Covers API (free, no auth required)
  const olUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
  try {
    const resp = await fetch(olUrl, { signal: AbortSignal.timeout(5000) });
    if (resp.ok) {
      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('image')) return olUrl;
    }
  } catch {
    // OpenLibrary unreachable — skip
  }

  // 2. Return null → frontend uses CSS gradient placeholder
  return null;
}
