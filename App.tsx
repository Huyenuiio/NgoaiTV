import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChannelGridScreen from './src/screens/ChannelGridScreen';
import PlayerScreen from './src/screens/PlayerScreen';
import { MergedChannel } from './src/services/channelMerger';

function App() {
  const [selectedChannel, setSelectedChannel] = useState<MergedChannel | null>(null);

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
