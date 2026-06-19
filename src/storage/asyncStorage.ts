import AsyncStorage from '@react-native-async-storage/async-storage';
import { MergedChannel } from '../services/channelMerger';

const CHANNELS_CACHE_KEY = 'channels_cache';
const LAST_UPDATED_KEY = 'last_updated';
const FAVORITES_KEY = 'favorite_channels';

// Preset default favorites (Phase 6 requirement: VTV1, VTV3, HTV7)
const DEFAULT_FAVORITES = ['vtv1', 'vtv3', 'htv7'];

export async function getChannelsCache(): Promise<MergedChannel[] | null> {
  try {
    const data = await AsyncStorage.getItem(CHANNELS_CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading channels cache:', error);
    return null;
  }
}

export async function saveChannelsCache(channels: MergedChannel[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHANNELS_CACHE_KEY, JSON.stringify(channels));
  } catch (error) {
    console.error('Error saving channels cache:', error);
  }
}

export async function getLastUpdated(): Promise<number | null> {
  try {
    const val = await AsyncStorage.getItem(LAST_UPDATED_KEY);
    return val ? parseInt(val, 10) : null;
  } catch (error) {
    return null;
  }
}

export async function saveLastUpdated(timestamp: number): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_UPDATED_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error saving last updated time:', error);
  }
}

export async function getFavoriteChannels(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Set default favorites on first app launch
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(DEFAULT_FAVORITES));
    return DEFAULT_FAVORITES;
  } catch (error) {
    console.error('Error reading favorites:', error);
    return DEFAULT_FAVORITES;
  }
}

export async function saveFavoriteChannels(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
}

export async function toggleFavoriteChannel(id: string): Promise<string[]> {
  try {
    const favorites = await getFavoriteChannels();
    let newFavorites: string[];
    if (favorites.includes(id)) {
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    await saveFavoriteChannels(newFavorites);
    return newFavorites;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return [];
  }
}
