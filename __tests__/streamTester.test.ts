import { testStreamUrl } from '../src/services/streamTester';

describe('streamTester', () => {
  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should return true when fetch returns ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    const result = await testStreamUrl('http://ok.com/stream.m3u8');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('http://ok.com/stream.m3u8', expect.any(Object));
  });

  it('should return false when fetch returns not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await testStreamUrl('http://notfound.com/stream.m3u8');
    expect(result).toBe(false);
  });

  it('should return false when fetch throws error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await testStreamUrl('http://error.com/stream.m3u8');
    expect(result).toBe(false);
  });
});
