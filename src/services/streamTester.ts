/**
 * Tests if a stream URL is active and reachable.
 * Uses AbortController to implement timeout.
 */
export async function testStreamUrl(url: string, timeoutMs: number = 5000): Promise<boolean> {
  if (!url) return false;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // We attempt a GET request. Since .m3u8 files are small text files,
    // this is fast and more reliable than HEAD as many IPTV hosts block/disallow HEAD requests.
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    clearTimeout(timeoutId);
    return response.ok; // status is 200-299
  } catch (error) {
    clearTimeout(timeoutId);
    return false;
  }
}
