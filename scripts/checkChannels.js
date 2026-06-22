const fs = require('fs');
const path = require('path');

const CHANNELS_API_URL = 'https://iptv-org.github.io/api/channels.json';
const STREAMS_API_URL = 'https://iptv-org.github.io/api/streams.json';
const OUTPUT_FILE = path.join(__dirname, '../channels-verified.json');

// Ordered list of priority channels for sorting
const PRIORITY_CHANNELS = [
  // --- Kênh VTV ---
  'VTV1 HD', 'VTV2 HD', 'VTV3 HD', 'VTV4 HD', 'VTV5 HD', 'VTV5 Tây Nguyên HD', 'VTV5 Tây Nam Bộ HD', 'VTV6', 'VTV7 HD', 'VTV8 HD', 'VTV9 HD', 'VTV10', 'Vietnam Today', 'ANTV', 'QPVN',
  // --- Sự kiện trực tiếp ---
  'TV360+1', 'TV360+2', 'TV360+3', 'TV360+4', 'TV360+5', 'TV360+6', 'TV360+7', 'TV360+8', 'TV360+9', 'TV360+10', 'TV360+11', 'TV360+12', 'TV360+13', 'TV360+14', 'TV360+15', 'TV360 Promo',
  // --- Kênh Vĩnh Long ---
  'THVL1 HD', 'THVL2 HD', 'THVL3 HD', 'THVL4 HD', 'THVL5 HD',
  // --- Kênh HTV ---
  'HTV1', 'HTV2', 'HTV3', 'HTV4', 'HTV7 HD', 'HTV9 HD', 'HTV Thể thao', 'HTV Gia Đình', 'HTV Phụ Nữ', 'HTV Thuần Việt', 'HTV Phim', 'HTV Music', 'HTC (C+)', 'Du lịch & Cuộc sống', 'HTV5 Bchannel',
  // --- Kênh FM ---
  'FM90', 'FM96', 'VOH AM610Khz', 'VOH FM99.9Mhz', 'VOH FM87.7Mhz', 'VOH FM95.6Mhz', 'VOH Radio',
  // --- Kênh SCTV ---
  'SCTV6', 'SCTV2',
  // --- Kênh VTV Cab (ON) ---
  'ON Football', 'ON Sports', 'ON Sports News', 'ON Golf', 'On Sports+', 'ON Vie Giải Trí', 'ON Phim Việt', 'ON Cine', 'ON Vie Dramas', 'ON BiBi', 'ON Kids', 'ON Movies', 'ON e Channel', 'ON Style', 'ON Music', 'ON Trending TV', 'ON VFamily', 'ON Life', 'ON Info', 'ON O2TV',
  // --- Kênh địa phương ---
  'QTV3', 'H1 HD', 'H2 HD', 'ATV1', 'ATV2', 'You TV', 'HiTV', 'BTV HD', 'LTV1', 'LTV2', 'LTV HD', 'CTV HD', 'Cần Thơ 1', 'Cần Thơ 2', 'Cần Thơ 3', 'CRTV HD', 'ĐNRT1', 'ĐNRT2', 'DRT', 'ĐTV', 'ĐN1 HD RTV', 'ĐN2 HD RTV', 'THĐT', 'THĐT1', 'GTV', 'BHT TV', 'THP3', 'THP HD', 'Huế TV', 'HY HD', 'KTV HD', 'KTV1', 'LSTV HD', 'THLC', 'Tây Ninh TV', 'NTV', 'TN HD', 'PTV HD', 'Đồng Tháp TV1 (ĐồngTV1)', 'QTV1', 'QTTV', 'STV', 'TN', 'TTV', 'TTV HD', 'Miền Tây TV',
  // --- Kênh 360 - Giải trí ---
  '360 Phim Việt', '360 Phim Âu Mỹ', '360 Hoạt Hình', '360 Phim Hoa Ngữ', '360 Hành Động Châu Á', '360 K-Drama', '360 Hài - Tình Cảm', '360 Phim Kinh Điển', '360 Anime', '360 Thiếu Nhi',
  // --- Kênh 360 - Thể thao ---
  '360 C1 Châu Âu', '360 C2 Châu Âu', '360 C3 Châu Âu', '360 Thể thao Châu Á', '360 Công thức 1', '360 Bundesliga', '360 Golf', '360 Tennis',
  // --- Kênh quốc tế (VIP) ---
  'HBO', 'Cinemax', 'WB TV', 'AXN', 'CinemaWorld', 'DreamWorks', 'CNN', 'FOX', 'Bloomberg'
];

const CUSTOM_CHANNELS = [
  // --- Kênh VTV ---
  {
    name: 'VTV1 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv1.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv1/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/fnxch2/vtv1hd_abr.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv1-manifest.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/vtv1/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV2 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv2.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv2/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/fnxch2/vtv2hd_abr.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv2-manifest.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV3 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv3.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv3/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/fnxch2/vtv3hd_abr.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv3-manifest.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/vtv3/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV4 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv4.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv4/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/fnxch2/vtv4hd_abr.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv4-manifest.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtv4/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV5 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5.png',
    streamUrls: [
      'https://live-a.fptplay53.net/live/media/vtv5/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/epzch2/vtv5hd_abr.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv5-manifest.m3u8',
      'https://liveh12.vtvcab.vn/hls/ONVTV5_CL/04.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtv5/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV5 Tây Nguyên HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5_tay_nguyen.png',
    streamUrls: [
      'https://liveh12.vtvprime.vn/hls/VTV5_TN/index.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv5tn-manifest.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV5 Tây Nam Bộ HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5_tay_nam_bo.png',
    streamUrls: [
      'https://liveh12.vtvprime.vn/hls/VTV5_TNB/index.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv5tnb-manifest.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtv5_tnb/index.m3u8',
      'https://liveh12.vtvcab.vn/hls/ONVTV5TNB_CL/04.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV6',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv6.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv6/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/fnxhd1/vtv6hd_vhls.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv6tt-manifest.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/vtv6/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV7 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv7.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv7/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/fnxhd1/vtv7hd_vhls.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv7-manifest.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/vtv7/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV8 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv8.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv8/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/epzhd1/vtv8hd_vhls.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv8-manifest.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtv8/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV9 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv9.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv9/live247-hls-avc/index.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv9-manifest.m3u8',
      'https://live.fptplay53.net/fnxhd1/vtv9_vhls.smil/chunklist.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/vtv9/index.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'VTV10',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv10.png',
    streamUrls: [
      'https://live.fptplay53.net/live/media/vtv10/live247-hls-avc/index.m3u8',
      'https://live.fptplay53.net/fnxhd1/vtvcantho_vhls.smil/chunklist.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vtv6-manifest.m3u8'
    ],
    group: 'Kênh VTV'
  },
  {
    name: 'Vietnam Today',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: [
      'https://amagi-live.ondemandkorea.com/amgplt0456.m3u8',
      'https://vtvgolive-failover.vtvdigital.vn/vtvgo/vietnamtoday-720p.m3u8',
      'https://vips-livecdn.fptplay.net/live/media/vietnamtoday/live-hls-avc/index.m3u8'
    ],
    group: 'Kênh VTV'
  },

  // --- Sự kiện trực tiếp ---
  {
    name: 'TV360+1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv1.png',
    streamUrls: [
      'https://zva42xy9rlliv.vcdn.cloud/hntv_events1/index.m3u8',
      'https://live.mediatech.vn/live/event1/playlist.m3u8'
    ],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+2',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv2.png',
    streamUrls: [
      'https://zva42xy9rlliv.vcdn.cloud/hntv_events2/index.m3u8',
      'https://live.mediatech.vn/live/event2/playlist.m3u8'
    ],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+3',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv3.png',
    streamUrls: [
      'https://live.mediatech.vn/live/event3/playlist.m3u8',
      'https://zva42xy9rlliv.vcdn.cloud/hntv_events1/index.m3u8'
    ],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+4',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv4.png',
    streamUrls: [
      'https://live.mediatech.vn/live/event4/playlist.m3u8',
      'https://zva42xy9rlliv.vcdn.cloud/hntv_events2/index.m3u8'
    ],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+5',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5.png',
    streamUrls: ['https://live.mediatech.vn/live/event5/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+6',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv6.png',
    streamUrls: ['https://live.mediatech.vn/live/event6/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+7',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv7.png',
    streamUrls: ['https://live.mediatech.vn/live/event7/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+8',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv8.png',
    streamUrls: ['https://live.mediatech.vn/live/event8/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+9',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv9.png',
    streamUrls: ['https://live.mediatech.vn/live/event9/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+10',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv10.png',
    streamUrls: ['https://live.mediatech.vn/live/event10/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+11',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv1.png',
    streamUrls: ['https://live.mediatech.vn/live/event11/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+12',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv2.png',
    streamUrls: ['https://live.mediatech.vn/live/event12/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+13',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv3.png',
    streamUrls: ['https://live.mediatech.vn/live/event13/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+14',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv4.png',
    streamUrls: ['https://live.mediatech.vn/live/event14/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360+15',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv5.png',
    streamUrls: ['https://live.mediatech.vn/live/event15/playlist.m3u8'],
    group: 'Sự kiện trực tiếp'
  },
  {
    name: 'TV360 Promo',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vtv10.png',
    streamUrls: [
      'https://live.mediatech.vn/live/promo/playlist.m3u8',
      'https://zva42xy9rlliv.vcdn.cloud/hntv_events1/index.m3u8'
    ],
    group: 'Sự kiện trực tiếp'
  },

  // --- Kênh Vĩnh Long ---
  {
    name: 'THVL1 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl1.png',
    streamUrls: [
      'https://oipf0znpmnliv.vcdn.cloud/hls/thvl1/index.m3u8',
      'https://live.fptplay53.net/epzch2/vinhlong1_abr.smil/chunklist.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/thvl1/index.m3u8'
    ],
    group: 'Kênh Vĩnh Long'
  },
  {
    name: 'THVL2 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl2.png',
    streamUrls: [
      'https://oipf0znpmnliv.vcdn.cloud/hls/thvl2/index.m3u8',
      'https://live.fptplay53.net/epzhd2/vinhlong2_vhls.smil/chunklist.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/thvl2/index.m3u8'
    ],
    group: 'Kênh Vĩnh Long'
  },
  {
    name: 'THVL3 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl3.png',
    streamUrls: [
      'https://live.fptplay53.net/epzch2/vinhlong3_abr.smil/chunklist.m3u8',
      'https://code.vthanhtivi.pw/getlink/vieon/thvl3-hd/playlist.m3u8'
    ],
    group: 'Kênh Vĩnh Long'
  },
  {
    name: 'THVL4 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl4.png',
    streamUrls: [
      'https://live.fptplay53.net/epzhd2/vinhlong4_vhls.smil/chunklist.m3u8',
      'https://code.vthanhtivi.pw/getlink/vieon/thvl4-hd/playlist.m3u8'
    ],
    group: 'Kênh Vĩnh Long'
  },
  {
    name: 'THVL5 HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/thvl4.png',
    streamUrls: [
      'https://live.fptplay53.net/epzsd1/vinhlong5_vhls.smil/chunklist.m3u8'
    ],
    group: 'Kênh Vĩnh Long'
  },

  // --- Kênh HTV ---
  {
    name: 'HTV1',
    logoUrl: 'https://i.imgur.com/KEMSBD3.png',
    streamUrls: [
      'https://drm-livecdn.hplus.com.vn/htvonline/htv1.720p.nimble.tms/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV2',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/HTV2_-_Vie_Channel.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTV2-HD-1080p/playlist.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/htv2/index.m3u8',
      'http://liveh12.vtvprime.vn/hls/HTV2/03.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV3',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/65/HTV3-2018.png',
    streamUrls: [
      'https://e2.endpoint.cdn.sctvonline.vn/hls/htv3/index.m3u8',
      'https://liveh12byt.vtvprime.vn/hls/HTV3/03.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Logo_HTV_Key.png',
    streamUrls: [
      'https://liveh12.vtvprime.vn/hls/HTVKey/index.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/htv4/index.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV7 HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Logo_HTV7.svg/250px-Logo_HTV7.svg.png',
    streamUrls: [
      'https://e2.endpoint.cdn.sctvonline.vn/hls/htv7/index.m3u8',
      'http://vtv.cvmtv.site/HTV7?token=live'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV9 HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo_HTV9.svg/250px-Logo_HTV9.svg.png',
    streamUrls: [
      'https://live.fptplay53.net/epzhd1/htv9hd_vhls.smil/chunklist.m3u8',
      'https://e2.endpoint.cdn.sctvonline.vn/hls/htv9/index.m3u8',
      'http://vtv.cvmtv.site/HTV9?token=live'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV Thể thao',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/vi/3/3f/HTV_THETHAO_2014.png',
    streamUrls: [
      'https://live.fptplay53.net/epzhd1/htvcthethao_vhls.smil/chunklist.m3u8',
      'http://vtv.cvmtv.site/HTVTT?token=live',
      'http://171.238.180.25:18080/304.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV Gia Đình',
    logoUrl: 'https://i.imgur.com/KxWRNH6.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTVC-GIADINH-HD-1080p/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV Phụ Nữ',
    logoUrl: 'https://i.imgur.com/PLliKL6.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTVC-PHUNU-HD-1080p/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV Thuần Việt',
    logoUrl: 'https://i.imgur.com/xmISDWo.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTVC-THUANVIET-HD-1080p/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV Phim',
    logoUrl: 'https://i.imgur.com/SXV3ya9.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTVC-PHIM-HD-1080p/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV Music',
    logoUrl: 'https://i.imgur.com/ZHVkEIC.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTVC-CANHAC-HD-1080p/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTC (C+)',
    logoUrl: 'https://i.imgur.com/SQ9cLJj.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTVC-PLUS-HD-1080p/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'Du lịch & Cuộc sống',
    logoUrl: 'https://i.imgur.com/XxIO0E0.png',
    streamUrls: [
      'https://1011154949.vnns.net/CDN-FPT02/HTVC-DULICH-HD-1080p/playlist.m3u8'
    ],
    group: 'Kênh HTV'
  },
  {
    name: 'HTV5 Bchannel',
    logoUrl: 'https://i.imgur.com/NFxEKVl.png',
    streamUrls: [
      'https://ott3.nethubtv.vn/live/anvien/chunklist_1.m3u8'
    ],
    group: 'Kênh HTV'
  },

  // --- Kênh FM ---
  {
    name: 'FM90',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://cloudcdnfm90.tek4tv.vn/HANOIFM90/stream.m3u8'],
    group: 'Kênh FM'
  },
  {
    name: 'FM96',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://cloudcdnfm90.tek4tv.vn/HANOI96/stream.m3u8'],
    group: 'Kênh FM'
  },
  {
    name: 'VOH AM610Khz',
    logoUrl: 'https://i.imgur.com/Ie1Bbg2.png',
    streamUrls: ['https://strm.voh.com.vn/radio/channel2/playlist.m3u8'],
    group: 'Kênh FM'
  },
  {
    name: 'VOH FM99.9Mhz',
    logoUrl: 'https://i.imgur.com/p89y5DE.png',
    streamUrls: ['https://strm.voh.com.vn/radio/channel3/playlist.m3u8'],
    group: 'Kênh FM'
  },
  {
    name: 'VOH FM87.7Mhz',
    logoUrl: 'https://i.imgur.com/tSFXalD.png',
    streamUrls: ['https://strm.voh.com.vn/radio/channel5/playlist.m3u8'],
    group: 'Kênh FM'
  },
  {
    name: 'VOH FM95.6Mhz',
    logoUrl: 'https://i.imgur.com/Maoi692.png',
    streamUrls: ['https://strm.voh.com.vn/radio/channel1/playlist.m3u8'],
    group: 'Kênh FM'
  },
  {
    name: 'VOH Radio',
    logoUrl: 'https://i.imgur.com/p89y5DE.png',
    streamUrls: ['https://strm.voh.com.vn/radio/channel3/playlist.m3u8'],
    group: 'Kênh FM'
  },

  // --- Kênh SCTV ---
  {
    name: 'SCTV6',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/sctv6.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s5.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e1.endpoint.cdn.sctvonline.vn/nginx.s8.edge.cdn.sctvonline.vn/hls/sctv6/index.m3u8',
      'https://e1.endpoint.cdn.sctvonline.vn/channel/sctv6/s1/index.m3u8',
      'https://live.fptplay53.net/epzhd2/film360_vhls.smil/chunklist.m3u8',
      'https://liveh34.vtvprime.vn/hls/SCTV6/03.m3u8'
    ],
    group: 'Kênh SCTV'
  },
  {
    name: 'SCTV2',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/sctv2.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s5.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e8.endpoint.cdn.sctvonline.vn/nginx.s5.edge.cdn.sctvonline.vn/hls/sctv2/index.m3u8',
      'https://e8.endpoint.cdn.sctvonline.vn/channel/sctv2/index.m3u8',
      'https://liveh12.vtvprime.vn/hls/SCTV2/index.m3u8'
    ],
    group: 'Kênh SCTV'
  },

  // --- Kênh VTV Cab (ON) ---
  {
    name: 'ON Football',
    logoUrl: 'https://i.imgur.com/WAxiIfP.png',
    streamUrls: [
      'https://liveh12.vtvcab.vn/hls/ONFOOTBALL_CL/04.m3u8',
      'https://code.vthanhtivi.pw/getlink/vieon2/vtvcab16-on-football/playlist.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Sports',
    logoUrl: 'https://i.imgur.com/moYwxwf.png',
    streamUrls: [
      'https://liveh12.vtvcab.vn/hls/ONSPORTS_CL/04.m3u8',
      'https://code.vthanhtivi.pw/getlink/vieon2/vtvcab3-on-sports/playlist.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Sports News',
    logoUrl: 'https://i.imgur.com/wpRXpJg.png',
    streamUrls: [
      'https://liveh12.vtvcab.vn/hls/ONSPORTSNEWS_CL/04.m3u8',
      'https://code.vthanhtivi.pw/getlink/vieon2/vtvcab18-on-sports-news/playlist.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Golf',
    logoUrl: 'https://i.imgur.com/moYwxwf.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONGOLF_CL/04.m3u8'],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'On Sports+',
    logoUrl: 'https://i.imgur.com/cFs8OVb.png',
    streamUrls: [
      'https://liveh12.vtvcab.vn/hls/ONSPORTPLUS_CL/04.m3u8',
      'https://code.vthanhtivi.pw/getlink/vieon2/vtvcab6-on-sport-plus/playlist.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Vie Giải Trí',
    logoUrl: 'https://i.imgur.com/ie6xPgE.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab1/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab1/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Phim Việt',
    logoUrl: 'https://i.imgur.com/MPNlpzb.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab2/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab2/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Cine',
    logoUrl: 'https://i.imgur.com/6f9ngwY.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab10/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab10/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Vie Dramas',
    logoUrl: 'https://i.imgur.com/n7QICK7.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab19/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON BiBi',
    logoUrl: 'https://i.imgur.com/YFmPo7l.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab8/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab8/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Kids',
    logoUrl: 'https://i.imgur.com/YFmPo7l.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONKIDS_CL/04.m3u8'],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Movies',
    logoUrl: 'https://i.imgur.com/765Y3jw.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab4/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab4/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON e Channel',
    logoUrl: 'https://i.imgur.com/87JEXEQ.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab5/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab5/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Style',
    logoUrl: 'https://i.imgur.com/6LQ0Z1O.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab12/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab12/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Music',
    logoUrl: 'https://i.imgur.com/45BXPY3.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab15/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab15/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Trending TV',
    logoUrl: 'https://i.imgur.com/hHYzxmS.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab17/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab17/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON VFamily',
    logoUrl: 'https://i.imgur.com/R82M53x.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab20/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab20/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Life',
    logoUrl: 'https://i.imgur.com/Cl77vUf.png',
    streamUrls: [
      'https://liveh12.vtvcab.vn/hls/ONLIFETV_CL/04.m3u8',
      'https://code.vthanhtivi.pw/getlink/vieon/vtvcab22-life-tv/playlist.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON Info',
    logoUrl: 'https://i.imgur.com/jp57P0v.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab9/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab9/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },
  {
    name: 'ON O2TV',
    logoUrl: 'https://i.imgur.com/nqwVkmM.png',
    streamUrls: [
      'http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e3.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/vtvcab7/index.m3u8',
      'https://e3.endpoint.cdn.sctvonline.vn/hls/vtvcab7/index.m3u8'
    ],
    group: 'Kênh VTV Cab (ON)'
  },

  // --- Kênh địa phương ---
  {
    name: 'QTV3',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.baoquangninh.vn/qtvlive/tv3live.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'H1 HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/LogoHueTV_2025.png',
    streamUrls: ['https://live.fptplay53.net/epzsd1/hue_hls.smil/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'H2 HD',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/LogoHueTV_2025.png',
    streamUrls: ['https://live.trt.com.vn/TRT-Online/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'ATV1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/an_giang_tv1.png',
    streamUrls: ['https://tv.angiangtv.vn/live/kgtv/kgtv.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'ATV2',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/an_giang_tv2.png',
    streamUrls: ['https://tv.angiangtv.vn/live/kgtv2/kgtv2.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'You TV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://liveh12.vtvprime.vn/hls/YOUTV/index.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'HiTV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://liveh12.vtvprime.vn/hls/HITV/index.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'BTV HD',
    logoUrl: 'https://i.imgur.com/Soe6MC8.png',
    streamUrls: [
      'https://oipf0znpmnliv.vcdn.cloud/hls/btv1/index.m3u8',
      'https://oipf0znpmnliv.vcdn.cloud/hls/btv2/index.m3u8'
    ],
    group: 'Kênh địa phương'
  },
  {
    name: 'LTV1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/lam_dong_tv.png',
    streamUrls: ['http://118.107.85.5:1935/live/smil:LTV.smil/chunklist_b1384000.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'LTV2',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/lam_dong_tv.png',
    streamUrls: ['http://118.107.85.5:1935/live/smil:LTV2.smil/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'LTV HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/lam_dong_tv.png',
    streamUrls: ['http://118.107.85.5:1935/live/smil:LTV.smil/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'CTV HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/ca_mau_tv.png',
    streamUrls: ['https://tv.ctvcamau.vn/live/tv/tv.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'Cần Thơ 1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/can_tho_tv1.png',
    streamUrls: ['https://live.canthotv.vn/live/tv_web/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'Cần Thơ 2',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/can_tho_tv2.png',
    streamUrls: ['https://live.canthotv.vn/cs2/tv/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'Cần Thơ 3',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/can_tho_tv3.png',
    streamUrls: ['https://live.canthotv.vn/cs3/tv/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'CRTV HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/cao_bang_tv.png',
    streamUrls: ['http://118.107.85.4:1935/live/smil:CRTV.smil/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'ĐNRT1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_tv1.png',
    streamUrls: ['http://118.107.85.4:1935/live/smil:DNTV1.smil/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'ĐNRT2',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_tv2.png',
    streamUrls: ['http://118.107.85.4:1935/live/smil:DNTV2.smil/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'DRT',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/da_nang_tv1.png',
    streamUrls: ['http://drtdnglive.e49a7c38.cdnviet.com/livedrt1/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'ĐTV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dien_bien_tv.png',
    streamUrls: ['https://truyenhinh.vnptvas.vn/live.m3u8?c=vstv362&q=high&pkg=pkg11.hni'],
    group: 'Kênh địa phương'
  },
  {
    name: 'ĐN1 HD RTV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_tv1.png',
    streamUrls: ['http://118.107.85.4:1935/live/smil:DNTV1.smil/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'ĐN2 HD RTV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_nai_tv2.png',
    streamUrls: ['http://118.107.85.4:1935/live/smil:DNTV2.smil/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'THĐT',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_thap_tv.png',
    streamUrls: ['https://618b88f69e53b.streamlock.net/THDT/thdttv/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'THĐT1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_thap_tv.png',
    streamUrls: ['https://618b88f69e53b.streamlock.net/THDT/thdttv/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'GTV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://tv.gialaitv.vn:8134/hls/gialaitv/gialaitv.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'BHT TV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/ha_tinh_tv.png',
    streamUrls: ['https://wse.hatinhtv.net/live/httv1/chunklist_w271915096.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'THP3',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.mediatech.vn/live/285a4c99665fdf84e94956c66bc7dc7eb5d/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'THP HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.mediatech.vn/live/285a4c99665fdf84e94956c66bc7dc7eb5d/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'Huế TV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/LogoHueTV_2025.png',
    streamUrls: ['https://live.trt.com.vn/TRT-Online/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'HY HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.mediatech.vn/live/285f5449d7d7d2946e0bd2d54b7e60f25a4/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'KTV HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://tv.ktv.org.vn/hls/ktv1.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'KTV1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://tv.ktv.org.vn/hls/ktv1.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'LSTV HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.mediatech.vn/live/285c78da0c246524c90917842f8de03bd21/chunklist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'THLC',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://ott4.nethubtv.vn/live/laocaitv/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'Tây Ninh TV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/tay_ninh_tv.png',
    streamUrls: [
      'http://202.43.109.142:1935/ttv11/tntv/playlist.m3u8',
      'https://live-hq.evgcdn.net/live/2851dc2c9af68834814a89e61db0faee561/chunklist.m3u8'
    ],
    group: 'Kênh địa phương'
  },
  {
    name: 'NTV',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Logo_NTV_Ngh%E1%BB%87_An_HD_2018.png',
    streamUrls: ['https://live.truyenhinhnghean.vn/hls/na1/index.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'TN HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://streaming.thainguyentv.vn/hls/livestream.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'PTV HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://ott3.nethubtv.vn/live/phuthotv/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'Đồng Tháp TV1 (ĐồngTV1)',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_thap_tv.png',
    streamUrls: ['https://618b88f69e53b.streamlock.net/THDT/thdttv/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'QTV1',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.baoquangninh.vn/qtvlive/tv1live.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'QTTV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://ott4.nethubtv.vn/live/quangtritv/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'STV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://pa.thst.vn/hls-live/livepkgr/_definst_/liveevent/livestream.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'TN',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/tay_ninh_tv.png',
    streamUrls: ['http://202.43.109.142:1935/ttv11/tntv/playlist.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'TTV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.tuyenquangtv.vn/hls/ttv.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'TTV HD',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/vietnam_today.png',
    streamUrls: ['https://live.tuyenquangtv.vn/hls/ttv.m3u8'],
    group: 'Kênh địa phương'
  },
  {
    name: 'Miền Tây TV',
    logoUrl: 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/assets/logos/dong_thap_tv.png',
    streamUrls: ['https://64d0d74b76158.streamlock.net/THDT2/thdttv2/playlist.m3u8'],
    group: 'Kênh địa phương'
  },

  // --- Kênh 360 - Giải trí ---
  {
    name: '360 Phim Việt',
    logoUrl: 'https://i.imgur.com/x5G9UnO.png',
    streamUrls: ['https://live.fptplay53.net/epzhd2/film360_vhls.smil/chunklist.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Phim Âu Mỹ',
    logoUrl: 'https://i.imgur.com/uB76Ft0.png',
    streamUrls: [
      'http://vthanhtivi.pw:5000/hbo/index.m3u8',
      'https://live.fptplay53.net/epzhd2/film360_vhls.smil/chunklist.m3u8'
    ],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Hoạt Hình',
    logoUrl: 'https://i.imgur.com/9aw5DAe.png',
    streamUrls: ['https://ctrl.laotv.la/live/CartoonNetwork/index.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Phim Hoa Ngữ',
    logoUrl: 'https://i.imgur.com/Mb5ssnu.png',
    streamUrls: ['https://ctrl.laotv.la/live/CHCA/index.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Hành Động Châu Á',
    logoUrl: 'https://i.imgur.com/zWcUAdb.png',
    streamUrls: ['http://210.210.155.37/dr9445/h/h07/01.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 K-Drama',
    logoUrl: 'https://i.imgur.com/QVKzHm6.jpg',
    streamUrls: ['http://210.210.155.35:80/dr9445/h/h20/01.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Hài - Tình Cảm',
    logoUrl: 'https://i.imgur.com/g0caQa2.png',
    streamUrls: ['http://210.210.155.35:80/dr9445/h/h16/01.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Phim Kinh Điển',
    logoUrl: 'https://i.imgur.com/2EDOvcL.png',
    streamUrls: ['http://123.21.223.9:8081/sctv/s1.edge.cdn.sctvonline.vn/cdn-cgi/edge/v2/e4.endpoint.cdn.sctvonline.vn/nginx.s1.edge.cdn.sctvonline.vn/hls/hollywood/index.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Anime',
    logoUrl: 'https://i.imgur.com/bLjwPFU.png',
    streamUrls: ['https://vnpt.nekocdn.xyz/hls/Animax/index.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },
  {
    name: '360 Thiếu Nhi',
    logoUrl: 'https://i.imgur.com/C8nDHeY.png',
    streamUrls: ['https://cdn1.skygo.mn/live/disk1/Boomerang/HLS-FTA/Boomerang.m3u8'],
    group: 'Kênh 360 - Giải trí'
  },

  // --- Kênh 360 - Thể thao ---
  {
    name: '360 C1 Châu Âu',
    logoUrl: 'https://i.imgur.com/WAxiIfP.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONFOOTBALL_CL/04.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },
  {
    name: '360 C2 Châu Âu',
    logoUrl: 'https://i.imgur.com/moYwxwf.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONSPORTS_CL/04.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },
  {
    name: '360 C3 Châu Âu',
    logoUrl: 'https://i.imgur.com/cFs8OVb.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONSPORTPLUS_CL/04.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },
  {
    name: '360 Thể thao Châu Á',
    logoUrl: 'https://i.imgur.com/ZkUUWWN.png',
    streamUrls: ['http://171.238.180.25:18080/304.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },
  {
    name: '360 Công thức 1',
    logoUrl: 'https://i.imgur.com/moYwxwf.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONGOLF_CL/04.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },
  {
    name: '360 Bundesliga',
    logoUrl: 'https://i.imgur.com/wpRXpJg.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONSPORTSNEWS_CL/04.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },
  {
    name: '360 Golf',
    logoUrl: 'https://i.imgur.com/moYwxwf.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONGOLF_CL/04.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },
  {
    name: '360 Tennis',
    logoUrl: 'https://i.imgur.com/moYwxwf.png',
    streamUrls: ['https://liveh12.vtvcab.vn/hls/ONSPORTS_CL/04.m3u8'],
    group: 'Kênh 360 - Thể thao'
  },

  // --- Kênh quốc tế (VIP) ---
  {
    name: 'HBO',
    logoUrl: 'https://i.imgur.com/qPXF25a.png',
    streamUrls: [
      'http://vthanhtivi.pw:5000/hbo/index.m3u8',
      'http://ip168.homeip.net:8086/hbo.m3u8'
    ],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'Cinemax',
    logoUrl: 'https://i.imgur.com/uB76Ft0.png',
    streamUrls: [
      'http://vthanhtivi.pw:5000/cinemax/index.m3u8',
      'http://ip168.homeip.net:8086/cinemax.m3u8'
    ],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'WB TV',
    logoUrl: 'https://i.imgur.com/qPXF25a.png',
    streamUrls: ['https://ctrl.laotv.la/live/StarMovie/index.m3u8'],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'AXN',
    logoUrl: 'https://i.imgur.com/Rwm7Lod.png',
    streamUrls: [
      'http://vthanhtivi.pw:5000/axn/index.m3u8',
      'http://hodam:87654321@hothanhdam.dsmynas.com:9981/stream/channelid/84468598?profile=pass'
    ],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'CinemaWorld',
    logoUrl: 'https://i.imgur.com/D2qNVZ7.png',
    streamUrls: ['http://210.210.155.35/dr9445/h/h04/01.m3u8'],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'DreamWorks',
    logoUrl: 'https://i.imgur.com/C8nDHeY.png',
    streamUrls: ['https://cdn1.skygo.mn/live/disk1/Boomerang/HLS-FTA/Boomerang.m3u8'],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'CNN',
    logoUrl: 'https://i.imgur.com/05S3yYZ.png',
    streamUrls: [
      'https://ctrl.laotv.la/live/CNN/index.m3u8',
      'https://i.mjh.nz/SamsungTVPlus/GBBD8000016N.m3u8'
    ],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'FOX',
    logoUrl: 'https://i.imgur.com/H2tGzri.png',
    streamUrls: ['https://d25tgymtnqzu8s.cloudfront.net/event/smil:event1/chunklist_b2596000_slENG.m3u8'],
    group: 'Kênh quốc tế (VIP)'
  },
  {
    name: 'Bloomberg',
    logoUrl: 'https://i.imgur.com/OuogLHx.png',
    streamUrls: [
      'http://fpt.vthanhtivi.pw/Bloomberg/mpegts',
      'https://i.mjh.nz/bloomberg-tv.m3u8'
    ],
    group: 'Kênh quốc tế (VIP)'
  }
];

// Bản đồ logo ổn định từ Wikimedia Commons để tránh bị chặn Imgur tại Việt Nam
const STABLE_LOGOS = {};
for (const ch of CUSTOM_CHANNELS) {
  const normName = normalizeChannelName(ch.name);
  STABLE_LOGOS[normName] = ch.logoUrl;
}

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
    if (normalized.includes('3')) return 'THVL3';
    if (normalized.includes('4')) return 'THVL4';
    if (normalized.includes('5')) return 'THVL5';
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

  // Gộp các kênh tùy chỉnh yêu cầu của người dùng (CUSTOM_CHANNELS)
  console.log('Injecting custom channels...');
  const customNamesMap = new Map(); // normalized name -> original name

  for (const ch of CUSTOM_CHANNELS) {
    const normalized = normalizeChannelName(ch.name);
    if (!normalized) continue;

    customNamesMap.set(normalized, ch.name);

    if (!channelStreams.has(normalized)) {
      channelStreams.set(normalized, []);
    }
    
    const urls = channelStreams.get(normalized);
    // Cho các link backup tùy chỉnh lên đầu danh sách kiểm tra
    for (const url of ch.streamUrls) {
      if (!urls.includes(url)) {
        urls.unshift(url);
      }
    }

    // Luôn ghi đè thông tin chi tiết (logo và nhóm phân loại)
    channelDetails.set(normalized, {
      logoUrl: ch.logoUrl,
      group: ch.group,
      originalName: ch.name
    });
  }

  const mergedChannels = [];
  for (const [name, urls] of channelStreams.entries()) {
    const details = channelDetails.get(name);
    mergedChannels.push({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: details.originalName,
      logoUrl: details.logoUrl,
      streamUrls: urls,
      group: details.group
    });
  }

  console.log(`Total unique merged channels: ${mergedChannels.length}`);

  // Kiểm tra kết nối luồng phát
  console.log('Verifying all stream links (this might take a few minutes)...');
  const verifiedChannels = [];
  
  const CONCURRENCY = 15;
  let index = 0;

  async function worker() {
    while (index < mergedChannels.length) {
      const channelIndex = index++;
      const channel = mergedChannels[channelIndex];
      const normalized = normalizeChannelName(channel.name);
      const isCustom = customNamesMap.has(normalized);
      
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
      } else if (isCustom) {
        // Giữ lại kênh tùy chỉnh của người dùng ngay cả khi tạm thời bị lỗi kết nối
        verifiedChannels.push(channel);
        console.log(`-> ${channel.name}: DEAD (Custom Channel - Keeping with fallback links)`);
      } else {
        console.log(`-> ${channel.name}: DEAD`);
      }
    }
  }

  const workers = Array(CONCURRENCY).fill(null).map(() => worker());
  await Promise.all(workers);

  // Sắp xếp kênh theo thứ tự ưu tiên hoặc nhóm
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
    
    // Nếu cả hai không nằm trong danh sách ưu tiên, xếp theo nhóm rồi đến tên
    const groupCompare = a.group.localeCompare(b.group);
    if (groupCompare !== 0) return groupCompare;
    return a.name.localeCompare(b.name);
  });

  console.log(`Writing verified channels to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalChannels, null, 2), 'utf-8');
  console.log(`Done! Verified ${finalChannels.length} channels out of ${mergedChannels.length} in database.`);
}

run();
