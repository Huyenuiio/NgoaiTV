import { parseM3U } from '../src/services/m3uParser';

const mockM3U = `
#EXTM3U
#EXTINF:-1 tvg-id="VTV1.vn" tvg-logo="https://example.com/logos/vtv1.png" group-title="VTV",VTV1 HD
http://live.example.com/vtv1/index.m3u8
#EXTINF:-1 tvg-id="VTV3.vn" tvg-logo="https://example.com/logos/vtv3.png" group-title="VTV",VTV3
https://live.example.com/vtv3/index.m3u8
#EXTINF:-1 tvg-id="" tvg-logo="" group-title="",Kênh Không Thông Tin
https://live.example.com/unknown/index.m3u8
`;

describe('m3uParser', () => {
  it('should correctly parse M3U content into Channel objects', () => {
    const channels = parseM3U(mockM3U);
    expect(channels).toHaveLength(3);

    expect(channels[0]).toEqual({
      id: 'VTV1.vn',
      name: 'VTV1 HD',
      logoUrl: 'https://example.com/logos/vtv1.png',
      streamUrl: 'http://live.example.com/vtv1/index.m3u8',
      group: 'VTV',
    });

    expect(channels[1]).toEqual({
      id: 'VTV3.vn',
      name: 'VTV3',
      logoUrl: 'https://example.com/logos/vtv3.png',
      streamUrl: 'https://live.example.com/vtv3/index.m3u8',
      group: 'VTV',
    });

    expect(channels[2]).toEqual({
      id: 'k-nh-kh-ng-th-ng-tin',
      name: 'Kênh Không Thông Tin',
      logoUrl: '',
      streamUrl: 'https://live.example.com/unknown/index.m3u8',
      group: 'Khác',
    });
  });

  it('should return empty list when given empty input', () => {
    expect(parseM3U('')).toEqual([]);
    expect(parseM3U('#EXTM3U')).toEqual([]);
  });
});
