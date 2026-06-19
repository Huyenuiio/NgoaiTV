import { mergeChannelSources, normalizeChannelName } from '../src/services/channelMerger';
import { Channel } from '../src/services/m3uParser';

describe('channelMerger', () => {
  describe('normalizeChannelName', () => {
    it('should normalize basic channel names', () => {
      expect(normalizeChannelName('VTV1 HD')).toBe('VTV1');
      expect(normalizeChannelName('vtv3 hd')).toBe('VTV3');
      expect(normalizeChannelName('VTV 1')).toBe('VTV1');
      expect(normalizeChannelName('HTV 7 HD')).toBe('HTV7');
    });

    it('should normalize THVL channel names', () => {
      expect(normalizeChannelName('Truyền hình Vĩnh Long 1')).toBe('THVL1');
      expect(normalizeChannelName('THVL 1 HD')).toBe('THVL1');
      expect(normalizeChannelName('THVL2')).toBe('THVL2');
    });
  });

  describe('mergeChannelSources', () => {
    it('should merge duplicate channels and group streamUrls', () => {
      const source1: Channel[] = [
        {
          id: 'vtv1-id-1',
          name: 'VTV1 HD',
          logoUrl: 'logo-vtv1.png',
          streamUrl: 'http://link1.com/vtv1.m3u8',
          group: 'VTV',
        },
        {
          id: 'vtv3-id',
          name: 'VTV3',
          logoUrl: 'logo-vtv3.png',
          streamUrl: 'http://link1.com/vtv3.m3u8',
          group: 'VTV',
        },
      ];

      const source2: Channel[] = [
        {
          id: 'vtv1-id-2',
          name: 'VTV 1',
          logoUrl: '',
          streamUrl: 'http://link2.com/vtv1-backup.m3u8',
          group: 'Vietnamese',
        },
      ];

      const merged = mergeChannelSources([source1, source2]);
      
      // VTV1 and VTV3 merged, and sorted VTV1 first then VTV3
      expect(merged).toHaveLength(2);
      
      const vtv1 = merged.find(c => c.name === 'VTV1');
      expect(vtv1).toBeDefined();
      expect(vtv1?.logoUrl).toBe('logo-vtv1.png');
      expect(vtv1?.streamUrls).toEqual([
        'http://link1.com/vtv1.m3u8',
        'http://link2.com/vtv1-backup.m3u8',
      ]);

      const vtv3 = merged.find(c => c.name === 'VTV3');
      expect(vtv3).toBeDefined();
      expect(vtv3?.streamUrls).toEqual([
        'http://link1.com/vtv3.m3u8',
      ]);
    });

    it('should sort channels putting priority channels on top', () => {
      const channels: Channel[] = [
        { id: 'ch-vtc1', name: 'VTC1', logoUrl: '', streamUrl: 'http://vtc1.m3u8', group: '' },
        { id: 'ch-vtv3', name: 'VTV3', logoUrl: '', streamUrl: 'http://vtv3.m3u8', group: '' },
        { id: 'ch-vtv1', name: 'VTV1', logoUrl: '', streamUrl: 'http://vtv1.m3u8', group: '' },
        { id: 'ch-htv7', name: 'HTV7', logoUrl: '', streamUrl: 'http://htv7.m3u8', group: '' },
      ];

      const merged = mergeChannelSources([channels]);
      
      // Expected order based on PRIORITY_CHANNELS = ['VTV1', 'VTV3', 'HTV7', ...]
      expect(merged[0].name).toBe('VTV1');
      expect(merged[1].name).toBe('VTV3');
      expect(merged[2].name).toBe('HTV7');
      expect(merged[3].name).toBe('VTC1');
    });
  });
});
