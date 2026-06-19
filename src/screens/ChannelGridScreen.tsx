import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { MergedChannel, mergeChannelSources } from '../services/channelMerger';
import { parseM3U } from '../services/m3uParser';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getChannelsCache,
  saveChannelsCache,
  getFavoriteChannels,
  toggleFavoriteChannel,
  saveLastUpdated,
  getLastUpdated,
} from '../storage/asyncStorage';

// We fetch verified channels from local file first, then try to fetch fresh from online
import verifiedChannelsLocal from '../../channels-verified.json';

// Cấu hình URL chứa file channels-verified.json trên GitHub Raw của bạn.
// Ví dụ: 'https://raw.githubusercontent.com/<USERNAME>/<REPO>/main/channels-verified.json'
// Nếu để trống '', app sẽ tự động tải danh sách .m3u gốc và tự gộp trực tiếp trên máy.
const VERIFIED_CHANNELS_URL = 'https://raw.githubusercontent.com/Huyenuiio/NgoaiTV/main/channels-verified.json';

interface ChannelGridScreenProps {
  onSelectChannel: (channel: MergedChannel) => void;
}

export default function ChannelGridScreen({ onSelectChannel }: ChannelGridScreenProps) {
  const [channels, setChannels] = useState<MergedChannel[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
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
  };

  const fetchFreshChannels = async (showLoadingState: boolean) => {
    if (showLoadingState) setLoading(true);
    try {
      // 1. Nếu có cấu hình URL GitHub Raw chứa file json sạch đã kiểm tra từ Actions
      if (VERIFIED_CHANNELS_URL) {
        const response = await fetch(VERIFIED_CHANNELS_URL);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setChannels(data);
            await saveChannelsCache(data);
            await saveLastUpdated(Date.now());
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
    } catch (e) {
      console.log('Background fetch failed (offline or remote error), using cache');
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const favList = await getFavoriteChannels();
    setFavorites(favList);
    // Reload from cache/local file
    setChannels(verifiedChannelsLocal as MergedChannel[]);
    setRefreshing(false);
  };

  const handleLongPress = async (channel: MergedChannel) => {
    const updatedFavs = await toggleFavoriteChannel(channel.id);
    setFavorites(updatedFavs);
  };

  const renderChannelItem = ({ item }: { item: MergedChannel }) => {
    const isFav = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.channelCard, isFav && styles.favoriteCard]}
        activeOpacity={0.7}
        onPress={() => onSelectChannel(item)}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.imageContainer}>
          {item.logoUrl ? (
            <Image
              source={{ uri: item.logoUrl }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderLogo}>
              <Icon name="tv" size={48} color="#FFD700" />
            </View>
          )}
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

  // Split channels into favorites and others
  const favoriteChannels = channels.filter(c => favorites.includes(c.id));
  const otherChannels = channels.filter(c => !favorites.includes(c.id));

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
  
  if (favoriteRows.length > 0) {
    listData.push({ type: 'header', title: '⭐ KÊNH YÊU THÍCH' });
    favoriteRows.forEach(row => listData.push({ type: 'row', channels: row }));
  }
  
  if (otherRows.length > 0) {
    listData.push({ type: 'header', title: '📺 TẤT CẢ KÊNH' });
    otherRows.forEach(row => listData.push({ type: 'row', channels: row }));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ngoại TV</Text>
        <Text style={styles.headerSubtitle}>Ấn để xem • Giữ lâu để lưu yêu thích ⭐</Text>
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item, index) => index.toString()}
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
    paddingTop: 16,
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
  listContent: {
    padding: 16,
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
  placeholderLogoText: {
    fontSize: 48,
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
