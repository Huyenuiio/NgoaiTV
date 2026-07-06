const fs = require('fs');
const path = require('path');

const CHANNELS_API_URL = 'https://iptv-org.github.io/api/channels.json';
const STREAMS_API_URL = 'https://iptv-org.github.io/api/streams.json';
const OUTPUT_FILE = path.join(__dirname, '../channels-verified.json');
const BLACKLIST_FILE = path.join(__dirname, '../blacklist.json');

// Danh sách các kênh ưu tiên hiển thị ở hàng đầu (Đầy đủ VTV, HTV, THVL, VTC)
const PRIORITY_CHANNELS = [
  'VTV1', 'VTV2', 'VTV3', 'VTV4', 'VTV5', 'VTV7', 'VTV8', 'VTV9',
  'HTV7', 'HTV9', 'HTV THE THAO', 'HTV4',
  'THVL1', 'THVL2',
  'VTC1', 'VTC2', 'VTC3', 'VTC7', 'VTC9', 'VTC14', 'VTC16'
];

// Bản đồ logo ổn định từ Wikimedia Commons để tránh bị chặn Imgur tại Việt Nam
const STABLE_LOGOS = {
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
  'HTV9': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/HTV9.png',
  'HTV THE THAO': 'https://upload.wikimedia.org/wikipedia/vi/3/3f/HTV_THETHAO_2014.png',
  'HTV SPORTS': 'https://upload.wikimedia.org/wikipedia/vi/3/3f/HTV_THETHAO_2014.png',
  'HTV KEY': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Logo_HTV_Key.png',
  'HTV4': 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Logo_HTV_Key.png',
  'THVL1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl1.png',
  'THVL2': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl2.png',
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
  'VIETNAM TODAY': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
  'VINH LONG TV1': 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl1.png',
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
  if (normalized.includes('VINH LONG') || normalized.includes('THVL')) {
    if (normalized.includes('1')) return 'THVL1';
    if (normalized.includes('2')) return 'THVL2';
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
    
    if (!response.ok) {
      clearTimeout(timeoutId);
      return false;
    }

    // Verify HLS manifest content
    const text = await response.text();
    clearTimeout(timeoutId);

    if (!text.includes('#EXTM3U')) {
      // If it doesn't contain #EXTM3U but has a success code, maybe it is a raw stream
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('video') || contentType.includes('mpeg') || contentType.includes('octet-stream')) {
        return true;
      }
      return false;
    }

    // If it's a master playlist, it contains sub-playlists.
    // If it's a media playlist, it contains segment URLs.
    // Let's find the first sub-playlist or segment URL.
    const lines = text.split('\n');
    let subUrl = '';
    
    for (let line of lines) {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        subUrl = line;
        break;
      }
    }

    if (subUrl) {
      // Resolve relative URLs
      let absoluteSubUrl = subUrl;
      if (!subUrl.startsWith('http://') && !subUrl.startsWith('https://')) {
        // Resolve relative path
        const parentUrlObj = new URL(url);
        const basePath = parentUrlObj.href.substring(0, parentUrlObj.href.lastIndexOf('/') + 1);
        absoluteSubUrl = basePath + subUrl;
      }

      // Test the sub-playlist or segment URL
      const subController = new AbortController();
      const subTimeoutId = setTimeout(() => subController.abort(), 3000);

      try {
        const subResponse = await fetch(absoluteSubUrl, {
          method: 'GET',
          signal: subController.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });
        
        if (subResponse.ok) {
          // If the sub-URL is another playlist (.m3u8), we should check one step further to find a segment (.ts)
          const subText = await subResponse.text();
          clearTimeout(subTimeoutId);

          if (subText.includes('#EXTM3U')) {
            const subLines = subText.split('\n');
            let segmentUrl = '';
            for (let subLine of subLines) {
              subLine = subLine.trim();
              if (subLine && !subLine.startsWith('#')) {
                segmentUrl = subLine;
                break;
              }
            }
            if (segmentUrl) {
              let absoluteSegUrl = segmentUrl;
              if (!segmentUrl.startsWith('http://') && !segmentUrl.startsWith('https://')) {
                const subUrlObj = new URL(absoluteSubUrl);
                const subBasePath = subUrlObj.href.substring(0, subUrlObj.href.lastIndexOf('/') + 1);
                absoluteSegUrl = subBasePath + segmentUrl;
              }
              
              const segController = new AbortController();
              const segTimeoutId = setTimeout(() => segController.abort(), 3000);
              try {
                const segResponse = await fetch(absoluteSegUrl, {
                  method: 'GET',
                  signal: segController.signal,
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                  },
                });
                clearTimeout(segTimeoutId);
                return segResponse.ok;
              } catch (e) {
                clearTimeout(segTimeoutId);
                return false;
              }
            }
          }
          return true;
        }
        clearTimeout(subTimeoutId);
        return false;
      } catch (e) {
        clearTimeout(subTimeoutId);
        return false;
      }
    }

    return true;
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

  // Inject verified working stream URLs for THVL (Vinh Long TV) channels
  const thvlHardcoded = {
    'THVL1': {
      urls: [
        'https://live.fptplay53.net/live/media/vinhlong1/live247-hls-avc/index.m3u8',
        'https://live.fptplay53.net/epzch2/vinhlong1_abr.smil/chunklist.m3u8'
      ],
      group: 'general'
    },
    'THVL2': {
      urls: [
        'https://live.fptplay53.net/live/media/vinhlong2/live247-hls-avc/index.m3u8',
        'https://live.fptplay53.net/epzhd2/vinhlong2_vhls.smil/chunklist.m3u8'
      ],
      group: 'general'
    }
  };

  for (const [name, info] of Object.entries(thvlHardcoded)) {
    if (!channelStreams.has(name)) {
      channelStreams.set(name, []);
    }
    const urls = channelStreams.get(name);
    for (const url of info.urls) {
      if (!urls.includes(url)) {
        urls.unshift(url);
      }
    }
    if (!channelDetails.has(name)) {
      channelDetails.set(name, {
        logoUrl: STABLE_LOGOS[name] || '',
        group: info.group,
        originalName: name
      });
    }
  }

  // Look up requested channels from iptv-org database and inject them if not already present
  const existingNormalized = new Set(channelStreams.keys());

  const allChannelsByNormName = new Map();
  for (const ch of channels) {
    const normName = normalizeChannelName(ch.name);
    if (normName) {
      if (!allChannelsByNormName.has(normName)) {
        allChannelsByNormName.set(normName, []);
      }
      allChannelsByNormName.get(normName).push(ch);
    }
  }

  const streamsByChannelId = new Map();
  for (const str of streams) {
    if (!streamsByChannelId.has(str.channel)) {
      streamsByChannelId.set(str.channel, []);
    }
    streamsByChannelId.get(str.channel).push(str.url);
  }

  const REQUESTED_CHANNELS = [
    'VTV6', 'VTV1 HD', 'VTV3 HD', 'VTV2 HD', 'TV360+1', 'TV360+2', 'ANTV', 'QPVN', 'VTV5 HD', 'Vietnam Today',
    'VTV1 HD', 'VTV2 HD', 'VTV3 HD', 'VTV4 HD', 'VTV5 HD', 'VTV5 Tây Nguyên HD', 'VTV5 Tây Nam Bộ HD', 'VTV6', 'VTV7 HD', 'VTV8 HD', 'VTV9 HD', 'VTV10', 'Vietnam Today',
    'TV360+1', 'TV360+2', 'TV360+3', 'TV360+4', 'TV360+5', 'TV360+6', 'TV360+7', 'TV360+8', 'TV360+9', 'TV360+10', 'TV360+11', 'TV360+12', 'TV360+13', 'TV360+14', 'TV360+15', 'TV360 Promo',
    'THVL1 HD', 'THVL2 HD',
    'HTV1', 'HTV2', 'HTV3', 'HTV4', 'HTV7 HD', 'HTV9 HD', 'HTV Thể thao', 'HTV Gia Đình', 'HTV Phụ Nữ', 'HTV Thuần Việt', 'HTV Phim', 'HTV Music', 'HTC (C+)', 'Du lịch & Cuộc sống', 'HTV5 Bchannel',
    'FM90', 'FM96', 'VOH AM610Khz', 'VOH FM99.9Mhz', 'VOH FM87.7Mhz', 'VOH FM95.6Mhz', 'VOH Radio',
    'SCTV6', 'SCTV2',
    'ON Football', 'ON Sports', 'ON Sports News', 'ON Golf', 'On Sports+', 'ON Vie Giải Trí', 'ON Phim Việt', 'ON Cine', 'ON Vie Dramas', 'ON BiBi', 'ON Kids', 'ON Movies', 'ON e Channel', 'ON Style', 'ON Music', 'ON Trending TV', 'ON VFamily', 'ON Life', 'ON Info', 'ON O2TV',
    'QTV3', 'H1 HD', 'H2 HD', 'ATV1', 'ATV2', 'You TV', 'HiTV', 'BTV HD', 'LTV1', 'LTV2', 'LTV HD', 'CTV HD', 'Cần Thơ 1', 'Cần Thơ 2', 'Cần Thơ 3', 'CRTV HD', 'ĐNRT1', 'ĐNRT2', 'DRT', 'ĐTV', 'ĐN1 HD RTV', 'ĐN2 HD RTV', 'THĐT', 'THĐT1', 'GTV', 'BHT TV', 'THP3', 'THP HD', 'Huế TV', 'HY HD', 'KTV HD', 'KTV1', 'LSTV HD', 'THLC', 'Tây Ninh TV', 'NTV', 'TN HD', 'PTV HD', 'Đồng Tháp TV1 (ĐồngTV1)', 'QTV1', 'QTTV', 'STV', 'TN', 'TTV', 'TTV HD', 'Miền Tây TV',
    '360 Phim Việt', '360 Phim Âu Mỹ', '360 Hoạt Hình', '360 Phim Hoa Ngữ', '360 Hành Động Châu Á', '360 K-Drama', '360 Hài - Tình Cảm', '360 Phim Kinh Điển', '360 Anime', '360 Thiếu Nhi',
    '360 C1 Châu Âu', '360 C2 Châu Âu', '360 C3 Châu Âu', '360 Thể thao Châu Á', '360 Công thức 1', '360 Bundesliga', '360 Golf', '360 Tennis',
    'HBO', 'Cinemax', 'WB TV', 'AXN', 'CinemaWorld', 'DreamWorks', 'CNN', 'FOX', 'Bloomberg'
  ];

  let addedCount = 0;
  for (const reqName of REQUESTED_CHANNELS) {
    const normReqName = normalizeChannelName(reqName);
    if (!normReqName) continue;

    if (existingNormalized.has(normReqName)) {
      continue; // Skip if channel already exists in original database
    }

    const matchingChs = allChannelsByNormName.get(normReqName);
    if (matchingChs && matchingChs.length > 0) {
      const targetCh = matchingChs[0];
      const streamUrls = streamsByChannelId.get(targetCh.id);

      if (streamUrls && streamUrls.length > 0) {
        channelStreams.set(normReqName, streamUrls);
        channelDetails.set(normReqName, {
          logoUrl: STABLE_LOGOS[normReqName] || m3uLogoMap.get(normReqName) || targetCh.logo || '',
          group: targetCh.categories && targetCh.categories.length > 0 ? targetCh.categories[0] : 'Khác',
          originalName: targetCh.name || reqName
        });
        addedCount++;
      }
    }
  }
  console.log(`Successfully added ${addedCount} new channels from iptv-org.`);

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
  
  // Đọc danh sách kênh đã xác thực hiện tại để bảo toàn nếu quét mới bị lỗi/chặn địa lý
  let existingChannels = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingChannels = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      console.log(`Loaded ${existingChannels.length} existing channels from cache for protection.`);
    } catch (e) {
      console.warn('Failed to parse existing verified channels:', e.message);
    }
  }
  const existingMap = new Map(existingChannels.map(ch => [ch.id, ch]));
  const processedExistingIds = new Set();
  
  const verifiedChannels = [];
  const CONCURRENCY = 15;
  let index = 0;

  async function worker() {
    while (index < mergedChannels.length) {
      const channelIndex = index++;
      const channel = mergedChannels[channelIndex];
      
      console.log(`[${channelIndex + 1}/${mergedChannels.length}] Testing streams for ${channel.name}...`);
      processedExistingIds.add(channel.id);
      
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
        const existing = existingMap.get(channel.id);
        if (existing && process.env.GITHUB_ACTIONS === 'true') {
          // Giữ lại kênh từ danh sách cũ trên GitHub Actions để tránh bị xoá do chặn địa lý (US/Europe IP)
          verifiedChannels.push(existing);
          console.log(`-> ${channel.name}: DEAD (kept existing on GitHub Actions)`);
        } else {
          console.log(`-> ${channel.name}: DEAD (removed)`);
        }
      }
    }
  }

  const workers = Array(CONCURRENCY).fill(null).map(() => worker());
  await Promise.all(workers);

  // Bổ sung các kênh tự thêm (custom) hoặc kênh cũ không có trong dữ liệu tải về mới
  for (const existing of existingChannels) {
    if (!processedExistingIds.has(existing.id)) {
      verifiedChannels.push(existing);
      console.log(`-> Kept custom/legacy channel: ${existing.name}`);
    }
  }

  // Đọc danh sách đen (blacklist.json) nếu có để loại bỏ các kênh không muốn hiển thị
  let blacklist = [];
  if (fs.existsSync(BLACKLIST_FILE)) {
    try {
      blacklist = JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf-8'));
      if (Array.isArray(blacklist)) {
        blacklist = blacklist.map(id => id.toLowerCase().trim());
        console.log(`Loaded blacklist with ${blacklist.length} channels.`);
      } else {
        blacklist = [];
      }
    } catch (e) {
      console.warn('Failed to parse blacklist.json:', e.message);
    }
  }
  const blacklistSet = new Set(blacklist);

  // Lọc bỏ các kênh nằm trong blacklist
  const finalChannelsFiltered = verifiedChannels.filter(ch => !blacklistSet.has(ch.id));

  // Sắp xếp kênh ưu tiên hàng đầu
  const finalChannels = finalChannelsFiltered.sort((a, b) => {
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
  console.log(`Done! Verified ${finalChannels.length} channels.`);
}

run();
