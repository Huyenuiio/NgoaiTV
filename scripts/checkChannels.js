const fs = require('fs');
const path = require('path');

// M3U Playlist URLs
const M3U_URLS = [
  'https://iptv-org.github.io/iptv/countries/vn.m3u',
  'https://iptv-org.github.io/iptv/languages/vie.m3u'
];

const OUTPUT_FILE = path.join(__dirname, '../channels-verified.json');

// Priority channels to show at the top
const PRIORITY_CHANNELS = ['VTV1', 'VTV3', 'HTV7', 'THVL1', 'VTV2', 'VTV6', 'VTV9', 'HTV9', 'THVL2'];

function parseM3U(m3uText) {
  const lines = m3uText.split(/\r?\n/);
  const channels = [];
  let currentChannel = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      const idMatch = line.match(/tvg-id="([^"]*)"/i);
      currentChannel.id = idMatch ? idMatch[1] : '';

      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      currentChannel.logoUrl = logoMatch ? logoMatch[1] : '';

      const groupMatch = line.match(/group-title="([^"]*)"/i);
      currentChannel.group = groupMatch ? groupMatch[1] : '';

      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentChannel.name = line.substring(commaIndex + 1).trim();
      } else {
        currentChannel.name = '';
      }
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentChannel) {
        currentChannel.streamUrl = line;
        
        const name = currentChannel.name || 'Kênh không tên';
        const id = currentChannel.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-') || `channel-${channels.length}`;
        
        channels.push({
          id,
          name,
          logoUrl: currentChannel.logoUrl || '',
          streamUrl: currentChannel.streamUrl || '',
          group: currentChannel.group || 'Khác',
        });
        currentChannel = null;
      }
    }
  }

  return channels;
}

function normalizeChannelName(name) {
  if (!name) return '';
  
  let normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  normalized = normalized.toUpperCase();
  
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

function mergeChannelSources(sources) {
  const mergedMap = new Map();

  for (const channels of sources) {
    for (const ch of channels) {
      const normalizedName = normalizeChannelName(ch.name);
      if (!normalizedName) continue;

      const key = normalizedName;

      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        if (!existing.streamUrls.includes(ch.streamUrl)) {
          existing.streamUrls.push(ch.streamUrl);
        }
        if (!existing.logoUrl && ch.logoUrl) {
          existing.logoUrl = ch.logoUrl;
        }
      } else {
        mergedMap.set(key, {
          id: key.toLowerCase().replace(/\s+/g, '-'),
          name: key,
          logoUrl: ch.logoUrl || '',
          streamUrls: [ch.streamUrl],
          group: ch.group || 'Khác',
        });
      }
    }
  }

  const mergedList = Array.from(mergedMap.values());
  return mergedList;
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
  console.log('Fetching source M3U playlists...');
  const sources = [];
  for (const url of M3U_URLS) {
    try {
      console.log(`Fetching ${url}...`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const text = await response.text();
      const channels = parseM3U(text);
      sources.push(channels);
      console.log(`Parsed ${channels.length} channels.`);
    } catch (e) {
      console.error(`Failed to fetch ${url}:`, e.message);
    }
  }

  if (sources.length === 0) {
    console.error('No sources fetched. Exiting.');
    process.exit(1);
  }

  console.log('Merging channel sources...');
  const mergedChannels = mergeChannelSources(sources);
  console.log(`Total merged unique channels: ${mergedChannels.length}`);

  console.log('Verifying streams (this may take a few minutes)...');
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
          streamUrls: [...workingUrls, ...deadUrls], // Working ones first
        });
        console.log(`-> ${channel.name}: ${workingUrls.length} active stream(s)`);
      } else {
        console.log(`-> ${channel.name}: DEAD`);
      }
    }
  }

  const workers = Array(CONCURRENCY).fill(null).map(() => worker());
  await Promise.all(workers);

  // Re-sort verified channels so priority ones are at the top
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
  console.log(`Done! Verified ${finalChannels.length} channels out of ${mergedChannels.length}.`);
}

run();
