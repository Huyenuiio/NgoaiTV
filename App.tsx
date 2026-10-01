import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, StyleSheet, View, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChannelGridScreen from './src/screens/ChannelGridScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { MergedChannel } from './src/services/channelMerger';

function App() {
  const [selectedChannel, setSelectedChannel] = useState<MergedChannel | null>(
    null,
  );
  const [activeChannelList, setActiveChannelList] = useState<MergedChannel[]>(
    [],
  );

  useEffect(() => {
    const backAction = () => {
      if (selectedChannel !== null) {
        setSelectedChannel(null);
        return true; // handled, do not exit app
      }
      return false; // let system handle (exits app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [selectedChannel]);

  const handleSelectChannel = useCallback(
    (channel: MergedChannel, list?: MergedChannel[]) => {
      if (list && list.length > 0) {
        setActiveChannelList(list);
      }
      setSelectedChannel(channel);
    },
    [],
  );

  const handleNextChannel = useCallback(() => {
    if (!selectedChannel || activeChannelList.length === 0) return;
    const currentIndex = activeChannelList.findIndex(
      c => c.id === selectedChannel.id,
    );
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % activeChannelList.length;
    setSelectedChannel(activeChannelList[nextIndex]);
  }, [selectedChannel, activeChannelList]);

  const handlePrevChannel = useCallback(() => {
    if (!selectedChannel || activeChannelList.length === 0) return;
    const currentIndex = activeChannelList.findIndex(
      c => c.id === selectedChannel.id,
    );
    if (currentIndex === -1) return;
    const prevIndex =
      (currentIndex - 1 + activeChannelList.length) % activeChannelList.length;
    setSelectedChannel(activeChannelList[prevIndex]);
  }, [selectedChannel, activeChannelList]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1E" />
      <View style={styles.container}>
        {selectedChannel ? (
          <PlayerScreen
            channel={selectedChannel}
            onBack={() => setSelectedChannel(null)}
            onNextChannel={handleNextChannel}
            onPrevChannel={handlePrevChannel}
          />
        ) : (
          <ChannelGridScreen onSelectChannel={handleSelectChannel} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
});

export default App;
