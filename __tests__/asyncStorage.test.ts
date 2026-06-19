import { getChannelsCache, saveChannelsCache, getFavoriteChannels, toggleFavoriteChannel } from '../src/storage/asyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('asyncStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch channels cache', async () => {
    const mockChannels = [{ id: 'vtv1', name: 'VTV1', logoUrl: '', streamUrls: [], group: '' }];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockChannels));

    const result = await getChannelsCache();
    expect(result).toEqual(mockChannels);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('channels_cache');
  });

  it('should toggle favorite channel', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['vtv1', 'vtv3']));
    
    const result = await toggleFavoriteChannel('vtv1');
    expect(result).toEqual(['vtv3']);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('favorite_channels', JSON.stringify(['vtv3']));
  });
});
