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

  // 4. Remove terms like HD, SD, FHD, 4K, 1080P
  normalized = normalized.replace(/\b(HD|SD|FHD|4K|1080P)\b/g, '');
  
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
          existing.logoUrl = ch.logoUrl;
        }
      } else {
        mergedMap.set(key, {
          id: key.toLowerCase().replace(/\s+/g, '-'),
          name: key, // Use normalized clean name as standard name
          logoUrl: ch.logoUrl || '',
          streamUrls: [ch.streamUrl],
          group: ch.group || 'Khác',
        });
      }
    }
  }

  const mergedList = Array.from(mergedMap.values());
  return sortChannels(mergedList);
}
