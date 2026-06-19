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

function normalizeChannelName(name) {
  if (!name) return '';
  
  // Thay thế Đ/đ
  let normalized = name.replace(/Đ/g, 'D').replace(/đ/g, 'd');
  
  // Loại bỏ dấu tiếng Việt
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  normalized = normalized.toUpperCase();
  
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

  normalized = normalized.replace(/\b(HD|SD|FHD|4K|1080P)\b/g, '');
  normalized = normalized.replace(/[^A-Z0-9\s]/g, '');
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
          logoUrl: ch.logo || '',
          group: ch.categories && ch.categories.length > 0 ? ch.categories[0] : 'Khác',
          originalName: ch.name
        });
      } else {
        const existing = channelDetails.get(normalized);
        if (!existing.logoUrl && ch.logo) {
          existing.logoUrl = ch.logo;
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
