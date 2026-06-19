import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChannelGridScreen from './src/screens/ChannelGridScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { MergedChannel } from './src/services/channelMerger';

function App() {
  const [selectedChannel, setSelectedChannel] = useState<MergedChannel | null>(null);

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
      backAction
    );

    return () => backHandler.remove();
  }, [selectedChannel]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1E" />
      <View style={styles.container}>
        {selectedChannel ? (
          <PlayerScreen
            channel={selectedChannel}
            onBack={() => setSelectedChannel(null)}
          />
        ) : (
          <ChannelGridScreen onSelectChannel={setSelectedChannel} />
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
