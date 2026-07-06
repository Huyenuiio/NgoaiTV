import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MergedChannel,
  mergeChannelSources,
  STABLE_LOGOS,
  normalizeChannelName,
} from '../services/channelMerger';
import { parseM3U } from '../services/m3uParser';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getChannelsCache,
  saveChannelsCache,
  getFavoriteChannels,
  toggleFavoriteChannel,
  saveLastUpdated,
} from '../storage/asyncStorage';

// We fetch verified channels from local file first, then try to fetch fresh from online
import verifiedChannelsLocal from '../../channels-verified.json';

// Cấu hình URL chứa file channels-verified.json trên GitHub Raw của bạn.
const VERIFIED_CHANNELS_URL = 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/channels-verified.json';

const CATEGORIES = [
  'Tất cả',
  'Yêu thích',
  'Kênh VTV',
  'Sự kiện trực tiếp',
  'Kênh Vĩnh Long',
  'Kênh HTV',
  'Kênh SCTV',
  'Kênh VTV Cab (ON)',
  'Kênh địa phương',
  'Kênh FM',
  'Kênh 360 - Giải trí',
  'Kênh 360 - Thể thao',
  'Kênh quốc tế (VIP)',
];

const ChannelLogo = ({ uri }: { uri: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  if (hasError || !uri) {
    return (
      <View style={styles.placeholderLogo}>
        <Icon name="tv" size={48} color="#FFD700" />
      </View>
    );
  }

  // Pass standard user agent header to prevent Wikimedia Commons OkHttp blocks
  return (
    <Image
      source={{
        uri: uri,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      }}
      style={styles.logo}
      resizeMode="contain"
      onError={(e) => {
        console.warn(`Error loading logo: ${uri}`, e.nativeEvent.error);
        setHasError(true);
      }}
    />
  );
};

interface ChannelGridScreenProps {
  onSelectChannel: (channel: MergedChannel) => void;
}

function removeAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .toLowerCase();
}

function getChannelGroup(channel: MergedChannel): string {
  const name = channel.name.toUpperCase();
  if (
    name.includes('VTV5 TAY') || 
    name.includes('VTV5 TÂY') || 
    name.includes('VTV6') || 
    name.includes('VTV7') || 
    name.includes('VTV8') || 
    name.includes('VTV9') || 
    name.includes('VTV10') || 
    name.includes('VTV1') || 
    name.includes('VTV2') || 
    name.includes('VTV3') || 
    name.includes('VTV4') || 
    name.includes('VTV5') || 
    name.includes('VIETNAM TODAY') || 
    name.includes('ANTV') || 
    name.includes('QPVN')
  ) {
    return 'Kênh VTV';
  }
  if (name.includes('TV360+') || name.includes('TV360 PROMO')) {
    return 'Sự kiện trực tiếp';
  }
  if (name.includes('THVL') || name.includes('VINH LONG')) {
    return 'Kênh Vĩnh Long';
  }
  if (name.startsWith('HTV') || name.includes('DU LICH') || name.includes('DU LỊCH') || name.includes('HTC')) {
    return 'Kênh HTV';
  }
  if (name.includes('SCTV')) {
    return 'Kênh SCTV';
  }
  if (name.startsWith('ON ') || name.startsWith('ON SPORTS') || name.includes('ON BIET') || name.includes('ON VIE')) {
    return 'Kênh VTV Cab (ON)';
  }
  if (name.startsWith('FM') || name.includes('VOH') || name.includes('RADIO') || name.includes('AM610') || name.includes('FM9')) {
    return 'Kênh FM';
  }
  if (name.startsWith('360 ') && (name.includes('PHIM') || name.includes('HOAT HINH') || name.includes('HOẠT HÌNH') || name.includes('ANIME') || name.includes('THIEU NHI') || name.includes('THIẾU NHI') || name.includes('K-DRAMA') || name.includes('HAI') || name.includes('HÀI') || name.includes('KINH DIEN') || name.includes('KINH ĐIỂN') || name.includes('HANH DONG') || name.includes('HÀNH ĐỘNG'))) {
    return 'Kênh 360 - Giải trí';
  }
  if (name.startsWith('360 ') && (name.includes('C1') || name.includes('C2') || name.includes('C3') || name.includes('THE THAO') || name.includes('THỂ THAO') || name.includes('CONG THUC') || name.includes('CÔNG THỨC') || name.includes('BUNDESLIGA') || name.includes('GOLF') || name.includes('TENNIS') || name.includes('CHAU A') || name.includes('CHÂU Á'))) {
    return 'Kênh 360 - Thể thao';
  }
  if (name.includes('HBO') || name.includes('CINEMAX') || name.includes('WB TV') || name.includes('AXN') || name.includes('CINEMAWORLD') || name.includes('DREAMWORKS') || name.includes('CNN') || name.includes('FOX') || name.includes('BLOOMBERG')) {
    return 'Kênh quốc tế (VIP)';
  }
  return 'Kênh địa phương';
}

export default function ChannelGridScreen({ onSelectChannel }: ChannelGridScreenProps) {
  const insets = useSafeAreaInsets();
  const [channels, setChannels] = useState<MergedChannel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const fetchFreshChannels = useCallback(async (showLoadingState: boolean) => {
    if (showLoadingState) setLoading(true);
    try {
      // 1. Nếu có cấu hình URL GitHub Raw chứa file json sạch đã kiểm tra từ Actions
      if (VERIFIED_CHANNELS_URL) {
        // Thêm tham số t=Date.now() để tránh cache của Android và CDN GitHub, lấy dữ liệu mới nhất ngay lập tức
        const response = await fetch(`${VERIFIED_CHANNELS_URL}?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setChannels(prev => {
              // Bảo vệ: Chỉ ghi đè nếu danh sách tải về không bị thiếu hụt quá nhiều kênh so với hiện tại
              if (prev.length === 0 || data.length >= prev.length * 0.7) {
                saveChannelsCache(data);
                saveLastUpdated(Date.now());
                return data;
              }
              console.warn('Danh sách kênh online tải về bị thiếu kênh, giữ lại danh sách hiện tại');
              return prev;
            });
            return;
          }
        }
      }

      // 2. Dự phòng: Tự động tải file .m3u gốc và gộp kênh ngay trên điện thoại (đảm bảo hoạt động)
      const response = await fetch('https://iptv-org.github.io/iptv/countries/vn.m3u');
      if (response.ok) {
        const text = await response.text();
        const parsed = parseM3U(text);
        const merged = mergeChannelSources([parsed]);
        if (merged.length > 0) {
          setChannels(merged);
          await saveChannelsCache(merged);
          await saveLastUpdated(Date.now());
        }
      }
    } catch {
      console.log('Background fetch failed (offline or remote error), using cache');
    } finally {
      if (showLoadingState) setLoading(false);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      // Load favorites
      const favList = await getFavoriteChannels();
      setFavorites(favList);

      // Load cached channels
      const cached = await getChannelsCache();
      if (cached && cached.length > 0) {
        setChannels(cached);
        setLoading(false);
        // Fetch fresh channels in background
        fetchFreshChannels(false);
      } else {
        // No cache, use local JSON import first to load instantly
        setChannels(verifiedChannelsLocal as MergedChannel[]);
        setLoading(false);
        // Fetch fresh channels online
        fetchFreshChannels(true);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setChannels(verifiedChannelsLocal as MergedChannel[]);
      setLoading(false);
    }
  }, [fetchFreshChannels]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    const favList = await getFavoriteChannels();
    setFavorites(favList);
    await fetchFreshChannels(false);
    setRefreshing(false);
  };

  const handleLongPress = async (channel: MergedChannel) => {
    const updatedFavs = await toggleFavoriteChannel(channel.id);
    setFavorites(updatedFavs);
  };

  const renderChannelItem = ({ item }: { item: MergedChannel }) => {
    const isFav = favorites.includes(item.id);
    const normalizedName = normalizeChannelName(item.name);
    const logoUri = STABLE_LOGOS[normalizedName] || item.logoUrl;
    
    return (
      <TouchableOpacity
        style={[styles.channelCard, isFav && styles.favoriteCard]}
        activeOpacity={0.7}
        onPress={() => onSelectChannel(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.imageContainer}>
          <ChannelLogo uri={logoUri} />
          {isFav && (
            <View style={styles.favoriteBadge}>
              <Text style={styles.favoriteBadgeText}>⭐</Text>
            </View>
          )}
        </View>
        <Text style={styles.channelName} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Filter channels based on category and search query
  const filteredChannels = channels.filter(channel => {
    const groupName = getChannelGroup(channel);

    // 1. Filter by category
    if (selectedCategory === 'Yêu thích') {
      if (!favorites.includes(channel.id)) return false;
    } else if (selectedCategory !== 'Tất cả') {
      if (groupName !== selectedCategory) return false;
    }

    // 2. Filter by search query (accent-insensitive)
    if (searchQuery.trim() !== '') {
      const cleanQuery = removeAccents(searchQuery);
      const cleanName = removeAccents(channel.name);
      const cleanGroup = removeAccents(groupName);
      return cleanName.includes(cleanQuery) || cleanGroup.includes(cleanQuery);
    }

    return true;
  });

  // Split channels into favorites and others for grid layout
  const favoriteChannels = filteredChannels.filter(c => favorites.includes(c.id));
  const otherChannels = filteredChannels.filter(c => !favorites.includes(c.id));

  // Chunk array helper
  const chunkArray = (array: MergedChannel[], size: number): MergedChannel[][] => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  const favoriteRows = chunkArray(favoriteChannels, 2);
  const otherRows = chunkArray(otherChannels, 2);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Đang tải danh sách kênh...</Text>
      </View>
    );
  }

  const listData: (
    | { type: 'header'; title: string }
    | { type: 'row'; channels: MergedChannel[] }
  )[] = [];
  
  if (selectedCategory !== 'Yêu thích' && favoriteRows.length > 0) {
    listData.push({ type: 'header', title: '⭐ KÊNH YÊU THÍCH' });
    favoriteRows.forEach(row => listData.push({ type: 'row', channels: row }));
  }
  
  const sectionTitle = selectedCategory === 'Tất cả' 
    ? '📺 TẤT CẢ KÊNH' 
    : selectedCategory === 'Yêu thích' 
      ? '⭐ KÊNH YÊU THÍCH'
      : `📺 ${selectedCategory.toUpperCase()}`;

  if (selectedCategory === 'Yêu thích') {
    listData.push({ type: 'header', title: '⭐ KÊNH YÊU THÍCH' });
    favoriteRows.forEach(row => listData.push({ type: 'row', channels: row }));
  } else {
    if (otherRows.length > 0) {
      listData.push({ type: 'header', title: sectionTitle });
      otherRows.forEach(row => listData.push({ type: 'row', channels: row }));
    }
  }

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <Text style={styles.headerTitle}>Grandmother TV</Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={28} color="#A0A0AB" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên kênh (VTV1, HTV7...)"
          placeholderTextColor="#A0A0AB"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Icon name="close" size={28} color="#A0A0AB" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map(category => {
            // Hide "Yêu thích" tab if there are no favorites
            if (category === 'Yêu thích' && favorites.length === 0) return null;

            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  isActive && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isActive && styles.activeCategoryTabText
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid Content */}
      {filteredChannels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="search-off" size={64} color="#FFD700" />
          <Text style={styles.emptyText}>Không tìm thấy kênh phù hợp</Text>
          <Text style={styles.emptySubtext}>Vui lòng thử nhập từ khóa hoặc chọn nhóm khác</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) =>
            item.type === 'header'
              ? `header-${item.title}`
              : `row-${item.channels.map(c => c.id).join('-')}`
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{item.title}</Text>
                </View>
              );
            }
            
            return (
              <View style={styles.row}>
                {item.channels.map(ch => (
                  <View key={ch.id} style={{ width: cardWidth + 16 }}>
                    {renderChannelItem({ item: ch })}
                  </View>
                ))}
                {item.channels.length === 1 && (
                  <View style={styles.placeholderCard} />
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2 - 16; // Adjust for spacing and margins

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: 16,
    fontWeight: 'bold',
  },
  header: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A30',
    backgroundColor: '#1A1A1E',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Gold title
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#A0A0AB',
    marginTop: 4,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#2D2D35',
    paddingHorizontal: 16,
    height: 56,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  categoriesWrapper: {
    height: 60,
    marginTop: 10,
    marginBottom: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  categoryTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#2D2D35',
  },
  activeCategoryTab: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A0A0AB',
  },
  activeCategoryTabText: {
    color: '#121214',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#A0A0AB',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    width: '100%',
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  sectionHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 1.2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  channelCard: {
    backgroundColor: '#1E1E24',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D2D35',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  placeholderCard: {
    width: cardWidth + 16,
    margin: 8,
  },
  favoriteCard: {
    borderColor: '#FFD700',
    backgroundColor: '#27221A', // warm yellow tint
  },
  imageContainer: {
    width: 90,
    height: 90,
    backgroundColor: '#2A2A30',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#3D3D45',
  },
  logo: {
    width: 80,
    height: 80,
  },
  placeholderLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  favoriteBadgeText: {
    fontSize: 14,
  },
  channelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    height: 54, // Allow 2 lines of text comfortably
  },
});
