import { Channel } from './m3uParser';

export interface MergedChannel {
  id: string;
  name: string;
  logoUrl: string;
  streamUrls: string[];
  group: string;
}

export function normalizeChannelName(name: string): string {
  if (!name) return '';
  
  // Replace Đ and đ manually
  let normalized = name.replace(/Đ/g, 'D').replace(/đ/g, 'd');

  // 1. Remove accents/diacritics
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // 2. Convert to uppercase
  normalized = normalized.toUpperCase();
  
  // 3. Specific Vietnamese channel mappings for THVL
  if (normalized.includes('VINH LONG 1') || normalized.includes('THVL 1') || normalized.includes('THVL1')) {
    return 'THVL1';
  }
  if (normalized.includes('VINH LONG 2') || normalized.includes('THVL 2') || normalized.includes('THVL2')) {
    return 'THVL2';
  }
  if (normalized.includes('VINH LONG 3') || normalized.includes('THVL 3') || normalized.includes('THVL3')) {
    return 'THVL3';
  }
  if (normalized.includes('VINH LONG 4') || normalized.includes('THVL 4') || normalized.includes('THVL4')) {
    return 'THVL4';
  }

  // 4. Remove terms like HD, SD, FHD, 4K, 1080P, LIVE, GEOBLOCKED, etc.
  normalized = normalized.replace(/\b(HD|SD|FHD|4K|1080P|GEOBLOCKED|NOT247|LIVE|720P|540P|480P|406P)\b/g, '');
  
  // 5. Keep only letters and numbers and spaces
  normalized = normalized.replace(/[^A-Z0-9\s]/g, '');
  
  // 6. Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // 7. Merge letter and number, e.g. "VTV 1" -> "VTV1", "HTV 7" -> "HTV7", "VTC 1" -> "VTC1"
  normalized = normalized.replace(/([A-Z]+)\s+(\d+)/g, '$1$2');
  
  return normalized;
}

// Priority channels to show at the top of the grid
export const PRIORITY_CHANNELS = [
  'VTV1', 'VTV2', 'VTV3', 'VTV4', 'VTV5', 'VTV7', 'VTV8', 'VTV9',
  'HTV7', 'HTV9', 'HTV THE THAO', 'HTV KEY',
  'THVL1', 'THVL2', 'THVL3', 'THVL4',
  'VTC1', 'VTC2', 'VTC3', 'VTC7', 'VTC9', 'VTC14', 'VTC16'
];

// Stable Wikimedia Commons logo URLs (Imgur is blocked in Vietnam, causing original logos to fail to load)
export const STABLE_LOGOS: Record<string, string> = {
  'VTV1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/VTV1_logo_2013.png/200px-VTV1_logo_2013.png',
  'VTV2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/VTV2_logo_2013.png/200px-VTV2_logo_2013.png',
  'VTV3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/VTV3_logo_2013.png/200px-VTV3_logo_2013.png',
  'VTV4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/VTV4_logo_2013.png/200px-VTV4_logo_2013.png',
  'VTV5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/VTV5_logo_2013.png/200px-VTV5_logo_2013.png',
  'VTV6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/VTV6_logo_2013.png/200px-VTV6_logo_2013.png',
  'VTV7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VTV7_logo_2016.png/200px-VTV7_logo_2016.png',
  'VTV8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/VTV8_logo_2016.png/200px-VTV8_logo_2016.png',
  'VTV9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VTV9_logo_2016.png/200px-VTV9_logo_2016.png',
  'VTV10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Logo_VTV.svg/200px-Logo_VTV.svg.png',
  'HTV7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_HTV7.svg/200px-Logo_HTV7.svg.png',
  'HTV9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo_HTV9.svg/200px-Logo_HTV9.svg.png',
  'HTV THE THAO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/HTV_Sports_Logo.png/200px-HTV_Sports_Logo.png',
  'HTV KEY': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/HTV_Key_Logo.png/200px-HTV_Key_Logo.png',
  'THVL1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Logo_THVL1.svg/200px-Logo_THVL1.svg.png',
  'THVL2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Logo_THVL2.svg/200px-Logo_THVL2.svg.png',
  'ANTV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Logo_ANTV.svg/200px-Logo_ANTV.svg.png',
  'QPVN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Logo_QPVN.png/200px-Logo_QPVN.png',
  'VTC1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/VTC1_logo_2018.png/200px-VTC1_logo_2018.png',
  'VTC2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/VTC2_logo_2018.png/200px-VTC2_logo_2018.png',
  'VTC3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/VTC3_logo_2018.png/200px-VTC3_logo_2018.png',
  'VTC7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VTC7_logo_2018.png/200px-VTC7_logo_2018.png',
  'VTC9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/VTC9_logo_2018.png/200px-VTC9_logo_2018.png',
  'VTC14': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/VTC14_logo_2018.png/200px-VTC14_logo_2018.png',
  'VTC16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VTC16_logo_2018.png/200px-VTC16_logo_2018.png',
};

export function sortChannels(channels: MergedChannel[]): MergedChannel[] {
  return [...channels].sort((a, b) => {
    const aIndex = PRIORITY_CHANNELS.indexOf(a.name);
    const bIndex = PRIORITY_CHANNELS.indexOf(b.name);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) {
      return -1;
    }
    if (bIndex !== -1) {
      return 1;
    }
    // Default sorting alphabetically by name
    return a.name.localeCompare(b.name);
  });
}

export function mergeChannelSources(sources: Channel[][]): MergedChannel[] {
  const mergedMap = new Map<string, MergedChannel>();

  for (const channels of sources) {
    for (const ch of channels) {
      const normalizedName = normalizeChannelName(ch.name);
      if (!normalizedName) continue;

      const key = normalizedName;

      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!;
        
        // Add stream URL if it is not already included
        if (!existing.streamUrls.includes(ch.streamUrl)) {
          existing.streamUrls.push(ch.streamUrl);
        }
        
        // Keep first valid logo URL
        if (!existing.logoUrl && ch.logoUrl) {
          existing.logoUrl = STABLE_LOGOS[key] || ch.logoUrl;
        }
      } else {
        mergedMap.set(key, {
          id: key.toLowerCase().replace(/\s+/g, '-'),
          name: key, // Use normalized clean name as standard name
          logoUrl: STABLE_LOGOS[key] || ch.logoUrl || '',
          streamUrls: [ch.streamUrl],
          group: ch.group || 'Khác',
        });
      }
    }
  }

  const mergedList = Array.from(mergedMap.values());
  return sortChannels(mergedList);
}
