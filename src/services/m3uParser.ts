export interface Channel {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
  group: string;
}

export function parseM3U(m3uText: string): Channel[] {
  const lines = m3uText.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      // Extract tvg-id
      const idMatch = line.match(/tvg-id="([^"]*)"/i);
      currentChannel.id = idMatch ? idMatch[1] : '';

      // Extract tvg-logo
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      currentChannel.logoUrl = logoMatch ? logoMatch[1] : '';

      // Extract group-title
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      currentChannel.group = groupMatch ? groupMatch[1] : '';

      // Extract Name (after the last comma)
      const commaIndex = line.lastIndexOf(',');
      if (commaIndex !== -1) {
        currentChannel.name = line.substring(commaIndex + 1).trim();
      } else {
        currentChannel.name = '';
      }
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentChannel) {
        currentChannel.streamUrl = line;
        
        // Ensure standard fields are populated
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

export async function fetchAndParseM3U(url: string): Promise<Channel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.statusText}`);
    }
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error('Error fetching or parsing M3U:', error);
    return [];
  }
}
