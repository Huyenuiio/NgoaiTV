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
  if (normalized.includes('VINH LONG') || normalized.includes('THVL')) {
    if (normalized.includes('1')) return 'THVL1';
    if (normalized.includes('2')) return 'THVL2';
    if (normalized.includes('3')) return 'THVL3';
    if (normalized.includes('4')) return 'THVL4';
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
  'VTV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv1.png',
  'VTV2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv2.png',
  'VTV3': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv3.png',
  'VTV4': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv4.png',
  'VTV5': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5.png',
  'VTV6': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv6.png',
  'VTV7': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv7.png',
  'VTV8': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv8.png',
  'VTV9': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv9.png',
  'VTV10': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv10.png',
  'HTV7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_HTV7.svg/250px-Logo_HTV7.svg.png',
  'HTV9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo_HTV9.svg/250px-Logo_HTV9.svg.png',
  'HTV THE THAO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/HTV_Sports_Logo.png/250px-HTV_Sports_Logo.png',
  'HTV SPORTS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/HTV_Sports_Logo.png/250px-HTV_Sports_Logo.png',
  'HTV KEY': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/HTV_Key_Logo.png/250px-HTV_Key_Logo.png',
  'THVL1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl1.png',
  'THVL2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl2.png',
  'THVL3': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl3.png',
  'THVL4': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl4.png',
  'ANTV': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Logoantv.png',
  'QPVN': 'https://upload.wikimedia.org/wikipedia/commons/a/af/QPVN_channel_logo.png',
  'VTC1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/VTC1_logo_2018.png/250px-VTC1_logo_2018.png',
  'VTC2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/VTC2_logo_2018.png/250px-VTC2_logo_2018.png',
  'VTC3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/VTC3_logo_2018.png/250px-VTC3_logo_2018.png',
  'VTC7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/VTC7_logo_2018.png/250px-VTC7_logo_2018.png',
  'VTC9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/VTC9_logo_2018.png/250px-VTC9_logo_2018.png',
  'VTC14': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/VTC14_logo_2018.png/250px-VTC14_logo_2018.png',
  'VTC16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VTC16_logo_2018.png/250px-VTC16_logo_2018.png',

  // Kênh địa phương / Kênh khác
  'AN GIANG TV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/an_giang_tv1.png',
  'AN GIANG TV2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/an_giang_tv2.png',
  'AN GIANG TV3': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/an_giang_tv3.png',
  'AN NINH TV': 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Logoantv.png',
  'CA MAU TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/ca_mau_tv.png',
  'CAN THO TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/can_tho_tv.png',
  'CAN THO TV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/can_tho_tv1.png',
  'CAN THO TV2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/can_tho_tv2.png',
  'CAN THO TV3': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/can_tho_tv3.png',
  'CAO BANG TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/cao_bang_tv.png',
  'DA NANG TV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/da_nang_tv1.png',
  'DAK LAK TV': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Dai_PT-TH_Dak_Lak.png',
  'DIEN BIEN TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dien_bien_tv.png',
  'DONG NAI 1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_1.png',
  'DONG NAI 2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_2.png',
  'DONG NAI TV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_tv1.png',
  'DONG NAI TV2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_tv2.png',
  'DONG THAP TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_thap_tv.png',
  'DONG THAP TV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_thap_tv1.png',
  'DONG THAP TV2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_thap_tv2.png',
  'HA TINH TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/ha_tinh_tv.png',
  'HANOITV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/hanoitv1.png',
  'HANOITV2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/hanoitv2.png',
  'LAM DONG TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/lam_dong_tv.png',
  'LAO SV TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/lao_sv_tv.png',
  'NGHE AN TV': 'https://upload.wikimedia.org/wikipedia/commons/5/54/Logo_NTV_Ngh%E1%BB%87_An_HD_2018.png',
  'SCTV2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/sctv2.png',
  'SCTV6': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/sctv6.png',
  'TAY NINH TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/tay_ninh_tv.png',
  'TEA TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/tea_tv.png',
  'THAI NGUYEN TV': 'https://thainguyentv.vn/modules/frontend/themes/ptthtn/images/logo.png',
  'THUA THIEN HUE TV': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/LogoHueTV_2025.png',
  'TIEN GIANG TV': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Logo_THTG_HD.png',
  'TRA VINH TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Logo_%C4%90%C3%A0i_Ph%C3%A1t_thanh_%26_Truy%E1%BB%81n_h%C3%ACnh_Tr%C3%A0_Vinh_-_THTV.svg/250px-Logo_%C4%90%C3%A0i_Ph%C3%A1t_thanh_%26_Truy%E1%BB%81n_h%C3%ACnh_Tr%C3%A0_Vinh_-_THTV.svg.png',
  'UNIQUELY THAI': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/uniquely_thai.png',
  'VIETNAM TODAY': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
  'VINH LONG TV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl1.png',
  'VTV5 TAY NAM BO': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5_tay_nam_bo.png',
  'VTV5 TAY NGUYEN': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5_tay_nguyen.png',
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
