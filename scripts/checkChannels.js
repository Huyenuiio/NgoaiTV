const fs = require('fs');
const path = require('path');

const CHANNELS_API_URL = 'https://iptv-org.github.io/api/channels.json';
const STREAMS_API_URL = 'https://iptv-org.github.io/api/streams.json';
const OUTPUT_FILE = path.join(__dirname, '../channels-verified.json');

// Danh sách các kênh ưu tiên hiển thị ở hàng đầu (Đầy đủ VTV, HTV, THVL, VTC)
const PRIORITY_CHANNELS = [
  'VTV1', 'VTV2', 'VTV3', 'VTV4', 'VTV5', 'VTV7', 'VTV8', 'VTV9',
  'HTV7', 'HTV9', 'HTV THE THAO', 'HTV KEY',
  'THVL1', 'THVL2', 'THVL3', 'THVL4',
  'VTC1', 'VTC2', 'VTC3', 'VTC7', 'VTC9', 'VTC14', 'VTC16'
];

// Bản đồ logo ổn định từ Wikimedia Commons để tránh bị chặn Imgur tại Việt Nam
// Bản đồ logo ổn định từ Wikimedia Commons để tránh bị chặn Imgur tại Việt Nam
const STABLE_LOGOS = {
  'VTV1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/VTV1_logo_2013_final.svg/250px-VTV1_logo_2013_final.svg.png',
  'VTV2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/VTV2_logo_2013.png/250px-VTV2_logo_2013.png',
  'VTV3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/VTV3_logo_2013.png/250px-VTV3_logo_2013.png',
  'VTV4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/VTV4_logo_2013.png/250px-VTV4_logo_2013.png',
  'VTV5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/VTV5_logo_2013.png/250px-VTV5_logo_2013.png',
  'VTV6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/VTV6_logo_2013.png/250px-VTV6_logo_2013.png',
  'VTV7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/VTV7_logo_2016.png/250px-VTV7_logo_2016.png',
  'VTV8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/VTV8_logo_2016.png/250px-VTV8_logo_2016.png',
  'VTV9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/VTV9_logo_2016.png/250px-VTV9_logo_2016.png',
  'VTV10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Logo_VTV.svg/250px-Logo_VTV.svg.png',
  'HTV7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_HTV7.svg/250px-Logo_HTV7.svg.png',
  'HTV9': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo_HTV9.svg/250px-Logo_HTV9.svg.png',
  'HTV THE THAO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/HTV_Sports_Logo.png/250px-HTV_Sports_Logo.png',
  'HTV SPORTS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/HTV_Sports_Logo.png/250px-HTV_Sports_Logo.png',
  'HTV KEY': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/HTV_Key_Logo.png/250px-HTV_Key_Logo.png',
  'THVL1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Logo_THVL1_HD.png/250px-Logo_THVL1_HD.png',
  'THVL2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Logo_THVL2_HD.png/250px-Logo_THVL2_HD.png',
  'ANTV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Logo_ANTV.svg/250px-Logo_ANTV.svg.png',
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
  'AN NINH TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Logo_ANTV.svg/250px-Logo_ANTV.svg.png',
  'CA MAU TV': 'https://upload.wikimedia.org/wikipedia/commons/8/88/Ctvcamau-logo2026.png',
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
  'TAY NINH TV': 'https://tayninhtv.vn/static/images/logo.png',
  'TEA TV': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/tea_tv.png',
  'THAI NGUYEN TV': 'https://thainguyentv.vn/modules/frontend/themes/ptthtn/images/logo.png',
  'THUA THIEN HUE TV': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/LogoHueTV_2025.png',
  'TIEN GIANG TV': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Logo_THTG_HD.png',
  'TRA VINH TV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Logo_%C4%90%C3%A0i_Ph%C3%A1t_thanh_%26_Truy%E1%BB%81n_h%C3%ACnh_Tr%C3%A0_Vinh_-_THTV.svg/250px-Logo_%C4%90%C3%A0i_Ph%C3%A1t_thanh_%26_Truy%E1%BB%81n_h%C3%ACnh_Tr%C3%A0_Vinh_-_THTV.svg.png',
  'UNIQUELY THAI': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/uniquely_thai.png',
  'VIETNAM TODAY': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
  'VINH LONG TV1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Logo_THVL1_HD.png/250px-Logo_THVL1_HD.png',
  'VTV5 TAY NAM BO': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5_tay_nam_bo.png',
  'VTV5 TAY NGUYEN': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5_tay_nguyen.png',
};

function normalizeChannelName(name) {
  if (!name) return '';
  
  // Thay thế Đ/đ
  let normalized = name.replace(/Đ/g, 'D').replace(/đ/g, 'd');
  
  // Loại bỏ dấu tiếng Việt
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  normalized = normalized.toUpperCase();
  
  // Loại bỏ các ký tự đặc biệt (như dấu ngoặc, gạch ngang, chéo) để xử lý từ khóa sạch
  normalized = normalized.replace(/-/g, '');
  normalized = normalized.replace(/[^A-Z0-9\s]/g, ' ');
  
  // Gom các kênh Vinh Long về chuẩn THVL
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

  normalized = normalized.replace(/\b(HD|SD|FHD|4K|1080P|GEOBLOCKED|NOT247|LIVE|720P|540P|480P|406P)\b/g, '');
  normalized = normalized.replace(/\s+/g, ' ').trim();
  normalized = normalized.replace(/([A-Z]+)\s+(\d+)/g, '$1$2');
  
  return normalized;
}

async function testStreamUrl(url, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    return false;
  }
}

async function run() {
  console.log('Downloading raw iptv-org database (channels.json)...');
  let channels = [];
  try {
    const response = await fetch(CHANNELS_API_URL);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    channels = await response.json();
    console.log(`Downloaded ${channels.length} channels.`);
  } catch (e) {
    console.error('Failed to download channels:', e.message);
    process.exit(1);
  }

  console.log('Downloading raw iptv-org database (streams.json)...');
  let streams = [];
  try {
    const response = await fetch(STREAMS_API_URL);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    streams = await response.json();
    console.log(`Downloaded ${streams.length} stream links.`);
  } catch (e) {
    console.error('Failed to download streams:', e.message);
    process.exit(1);
  }

  // Tải danh sách vn.m3u để trích xuất logo kênh địa phương/các kênh cập nhật
  console.log('Downloading vn.m3u to extract up-to-date logos...');
  const m3uLogoMap = new Map();
  try {
    const m3uRes = await fetch('https://iptv-org.github.io/iptv/countries/vn.m3u');
    if (m3uRes.ok) {
      const m3uText = await m3uRes.text();
      const m3uRegex = /#EXTINF:-1[^,]*tvg-logo="([^"]*)"[^,]*,(.*)/g;
      let m3uMatch;
      while ((m3uMatch = m3uRegex.exec(m3uText)) !== null) {
        const logo = m3uMatch[1];
        const rawName = m3uMatch[2].trim();
        if (logo && rawName) {
          const normalized = normalizeChannelName(rawName);
          if (normalized) {
            m3uLogoMap.set(normalized, logo);
          }
        }
      }
      console.log(`Extracted ${m3uLogoMap.size} logos from vn.m3u.`);
    }
  } catch (e) {
    console.warn('Failed to fetch/parse vn.m3u for logos, skipping:', e.message);
  }

  // Lọc các kênh liên quan đến Việt Nam (quốc gia VN hoặc ngôn ngữ chứa vie)
  console.log('Filtering Vietnamese channels...');
  const vnChannelIds = new Set();
  const channelMap = new Map();

  for (const ch of channels) {
    const isVN = ch.country === 'VN';
    const isVie = Array.isArray(ch.languages) && ch.languages.includes('vie');

    if (isVN || isVie) {
      vnChannelIds.add(ch.id);
      channelMap.set(ch.id, ch);
    }
  }
  console.log(`Found ${channelMap.size} Vietnamese channels in iptv-org database.`);

  // Lọc các luồng phát thuộc về các kênh này
  console.log('Filtering streams for Vietnamese channels...');
  const channelStreams = new Map();
  const channelDetails = new Map();

  for (const str of streams) {
    if (vnChannelIds.has(str.channel)) {
      const ch = channelMap.get(str.channel);
      const normalized = normalizeChannelName(ch.name);
      if (!normalized) continue;

      if (!channelStreams.has(normalized)) {
        channelStreams.set(normalized, []);
      }
      
      const urls = channelStreams.get(normalized);
      if (!urls.includes(str.url)) {
        urls.push(str.url);
      }

      if (!channelDetails.has(normalized)) {
        channelDetails.set(normalized, {
          logoUrl: STABLE_LOGOS[normalized] || m3uLogoMap.get(normalized) || ch.logo || '',
          group: ch.categories && ch.categories.length > 0 ? ch.categories[0] : 'Khác',
          originalName: ch.name
        });
      } else {
        const existing = channelDetails.get(normalized);
        if (!existing.logoUrl) {
          existing.logoUrl = STABLE_LOGOS[normalized] || m3uLogoMap.get(normalized) || ch.logo || '';
        }
      }
    }
  }

  const mergedChannels = [];
  for (const [name, urls] of channelStreams.entries()) {
    const details = channelDetails.get(name);
    mergedChannels.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      logoUrl: details.logoUrl,
      streamUrls: urls,
      group: details.group
    });
  }

  console.log(`Total unique merged Vietnamese channels: ${mergedChannels.length}`);

  // Kiểm tra kết nối luồng phát
  console.log('Verifying all stream links (this might take a few minutes)...');
  const verifiedChannels = [];
  
  const CONCURRENCY = 15;
  let index = 0;

  async function worker() {
    while (index < mergedChannels.length) {
      const channelIndex = index++;
      const channel = mergedChannels[channelIndex];
      
      console.log(`[${channelIndex + 1}/${mergedChannels.length}] Testing streams for ${channel.name}...`);
      
      const workingUrls = [];
      const deadUrls = [];
      
      for (const url of channel.streamUrls) {
        const isAlive = await testStreamUrl(url);
        if (isAlive) {
          workingUrls.push(url);
        } else {
          deadUrls.push(url);
        }
      }

      if (workingUrls.length > 0) {
        verifiedChannels.push({
          ...channel,
          streamUrls: [...workingUrls, ...deadUrls]
        });
        console.log(`-> ${channel.name}: ${workingUrls.length} active stream(s)`);
      } else {
        console.log(`-> ${channel.name}: DEAD`);
      }
    }
  }

  const workers = Array(CONCURRENCY).fill(null).map(() => worker());
  await Promise.all(workers);

  // Sắp xếp kênh ưu tiên hàng đầu
  const finalChannels = verifiedChannels.sort((a, b) => {
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
    return a.name.localeCompare(b.name);
  });

  console.log(`Writing verified channels to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalChannels, null, 2), 'utf-8');
  console.log(`Done! Verified ${finalChannels.length} channels out of ${mergedChannels.length} in raw database.`);
}

run();
