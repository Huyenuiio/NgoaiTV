import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import Video from 'react-native-video';
import { MergedChannel } from '../services/channelMerger';

interface PlayerScreenProps {
  channel: MergedChannel;
  onBack: () => void;
}

export default function PlayerScreen({ channel, onBack }: PlayerScreenProps) {
  const [streamIndex, setStreamIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const streamUrls = channel.streamUrls || [];
  const currentUrl = streamUrls[streamIndex];
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setStreamIndex(0);
    setLoading(true);
    setError(false);
    resetControlsTimer();

    // Register hardware back press handler specifically for this screen
    const backAction = () => {
      onBack();
      return true; // handled, do not exit app
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [channel, onBack]);

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000); // Tự động ẩn sau 4 giây
  };

  const handleScreenPress = () => {
    resetControlsTimer();
  };

  const handleVideoError = (e: any) => {
    console.log(`Video player error for URL ${currentUrl}:`, e);
    
    if (streamIndex < streamUrls.length - 1) {
      console.log(`Switching to backup stream ${streamIndex + 1}...`);
      setStreamIndex(prev => prev + 1);
      setLoading(true);
      resetControlsTimer();
    } else {
      setError(true);
      setLoading(false);
      setShowControls(true); // Luôn hiện nút quay lại khi có lỗi
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleReadyForDisplay = () => {
    setLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <View style={styles.container}>
        <StatusBar hidden />

        {/* Video Player */}
        {currentUrl && !error && (
          <Video
            source={{ uri: currentUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            onLoadStart={handleLoadStart}
            onReadyForDisplay={handleReadyForDisplay}
            onError={handleVideoError}
            controls={false}
            paused={false}
            playInBackground={false}
            playWhenInactive={false}
            ignoreSilentSwitch="ignore"
            selectedTextTrack={{ type: 'disabled' }}
          />
        )}

        {/* Back Button (large hit area, high contrast, auto-hides) */}
        {showControls && (
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
        )}

        {/* Loading Overlay */}
        {loading && !error && (
          <View style={styles.overlayContainer} pointerEvents="none">
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.overlayText}>Đang kết nối kênh {channel.name}...</Text>
            {streamUrls.length > 1 && (
              <Text style={styles.backupText}>
                Đang thử nguồn {streamIndex + 1}/{streamUrls.length}
              </Text>
            )}
          </View>
        )}

        {/* Error Overlay */}
        {error && (
          <View style={[styles.overlayContainer, styles.errorBg]}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>Kênh này đang bận,</Text>
            <Text style={styles.errorText}>mời chọn kênh khác!</Text>
            <TouchableOpacity
              style={styles.errorBackButton}
              activeOpacity={0.7}
              onPress={onBack}
            >
              <Text style={styles.errorBackButtonText}>Quay lại danh sách</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 8,
    zIndex: 10, // Higher than video to ensure it is clickable
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 5,
  },
  errorBg: {
    backgroundColor: '#1E1414',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  backupText: {
    color: '#FFD700',
    fontSize: 18,
    marginTop: 8,
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 38,
  },
  errorBackButton: {
    marginTop: 32,
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  errorBackButtonText: {
    color: '#121214',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
