/* eslint-env node */
const fs = require('fs');
const path = require('path');

const STABLE_LOGOS = {
  'AN GIANG TV1': 'https://i.imgur.com/mgp6RAU.png',
  'AN GIANG TV2': 'https://i.imgur.com/efrauLr.png',
  'AN GIANG TV3': 'https://i.imgur.com/gZUV4z8.png',
  'CAO BANG TV': 'https://i.imgur.com/dGonewm.png',
  'DA NANG TV1': 'https://i.imgur.com/EOMuO1z.png',
  'DIEN BIEN TV': 'https://i.imgur.com/u308o8q.png',
  'DONG NAI 1': 'https://i.imgur.com/oQyioVa.png',
  'DONG NAI 2': 'https://i.imgur.com/tNKPSkO.png',
  'DONG NAI TV1': 'https://i.imgur.com/oQyioVa.png',
  'DONG NAI TV2': 'https://i.imgur.com/tNKPSkO.png',
  'DONG THAP TV2': 'https://i.imgur.com/yonKxgZ.png',
  'HA TINH TV': 'https://i.imgur.com/4yIgKKx.png',
  'HANOITV1': 'https://i.imgur.com/Je3K25E.png',
  'HANOITV2': 'https://i.imgur.com/szivqh2.png',
  'LAM DONG TV': 'https://i.imgur.com/lSMoGlv.png',
  'LAO SV TV': 'https://i.imgur.com/ZIXtazI.png',
  'SCTV2': 'https://i.imgur.com/8i5DXIg.png',
  'SCTV6': 'https://i.imgur.com/2oOVS42.png',
  'VTV5 TAY NAM BO': 'https://i.imgur.com/xiuHjEQ.png',
  'VTV5 TAY NGUYEN': 'https://i.imgur.com/Hlcnqqt.png',
  'CAN THO TV': 'https://i.ibb.co/MDhNH26J/cantho1-2025.png',
  'CAN THO TV1': 'https://i.ibb.co/MDhNH26J/cantho1-2025.png',
  'CAN THO TV2': 'https://i.ibb.co/JjVvkMsf/cantho2-2025.png',
  'CAN THO TV3': 'https://i.ibb.co/d4G2PD9s/cantho3-2025.png',
  'DONG THAP TV': 'https://i.ibb.co/XFX7yw0/logo2-1.png',
  'DONG THAP TV1': 'https://i.ibb.co/XFX7yw0/logo2-1.png',
};

const LOGOS_DIR = path.join(__dirname, '../assets/logos');

if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`Successfully downloaded: ${url} -> ${destPath}`);
    return true;
  } catch (err) {
    console.error(`Failed to download ${url}:`, err.message);
    return false;
  }
}

async function run() {
  for (const [name, url] of Object.entries(STABLE_LOGOS)) {
    const fileName = name.toLowerCase().replace(/\s+/g, '_') + '.png';
    const destPath = path.join(LOGOS_DIR, fileName);
    await downloadImage(url, destPath);
  }
  console.log('All downloads completed!');
}

run();
