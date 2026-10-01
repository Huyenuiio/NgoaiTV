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
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import { MergedChannel } from '../services/channelMerger';
import Orientation from 'react-native-orientation-locker';

interface PlayerScreenProps {
  channel: MergedChannel;
  onBack: () => void;
  onNextChannel?: () => void;
  onPrevChannel?: () => void;
}

// Helper để chỉ xoay màn hình trên điện thoại, giữ nguyên ngang trên TV Box
const isTVDevice = Platform.isTV;

const safeLockPortrait = () => {
  if (!isTVDevice) {
    Orientation.lockToPortrait();
  }
};

const safeLockLandscape = () => {
  Orientation.lockToLandscape();
};

export default function PlayerScreen({
  channel,
  onBack,
  onNextChannel,
  onPrevChannel,
}: PlayerScreenProps) {
  const [streamIndex, setStreamIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const streamUrls = channel.streamUrls || [];
  const currentUrl = streamUrls[streamIndex];

  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setStreamIndex(0);
    setLoading(true);
    setError(false);
    resetControlsTimer();

    // Chỉ ép portrait khi lần đầu vào xem; khi chuyển kênh giữ nguyên landscape để không giật màn hình
    if (isInitialMount.current) {
      isInitialMount.current = false;
      safeLockPortrait();
    }

    // Register hardware back press handler specifically for this screen
    const backAction = () => {
      safeLockPortrait();
      onBack();
      return true; // handled, do not exit app
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => {
      backHandler.remove();
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, [channel, onBack]);

  // Luôn đảm bảo trả về portrait khi rời khỏi PlayerScreen
  useEffect(() => {
    return () => {
      safeLockPortrait();
    };
  }, []);

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 4000); // Tự động ẩn sau 4 giây giống nút Quay lại
  };

  const handleScreenPress = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      resetControlsTimer();
    }
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
      // If there is an error, make sure we fall back to portrait mode safely
      safeLockPortrait();
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
    // Watchdog: nếu sau 15s vẫn chưa phát được → tự động thử backup
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      console.log(`Loading timeout for URL: ${currentUrl}`);
      handleVideoError({ message: 'Loading timeout' });
    }, 15000);
  };

  const handleReadyForDisplay = () => {
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    setLoading(false);
    // Auto rotate to landscape when stream plays normally
    safeLockLandscape();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Player */}
      {currentUrl && !error && (
        <Video
          source={{
            uri: currentUrl,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
          }}
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
          selectedTextTrack={{ type: 'disabled' as any }}
          pointerEvents="none"
        />
      )}

      {/* Transparent absolute overlay to intercept screen taps and toggle control visibility */}
      {!error && (
        <TouchableWithoutFeedback onPress={handleScreenPress}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      )}

      {/* Thanh điều khiển trên cùng (Nút quay lại & Huy hiệu tên kênh) - Tự ẩn sau 4 giây */}
      {showControls && (
        <View style={styles.topControlBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>

          <View style={styles.channelTitleBadge}>
            <Text style={styles.channelTitleBadgeText} numberOfLines={1}>
              📺 {channel.name}
            </Text>
          </View>
        </View>
      )}

      {/* Nút Kênh trước (Bên trái) - Cùng logic với nút Quay lại, tự ẩn sau 4s */}
      {showControls && onPrevChannel && (
        <TouchableOpacity
          style={[styles.channelSwitchBtn, styles.channelSwitchBtnLeft]}
          activeOpacity={0.7}
          onPress={() => {
            resetControlsTimer();
            onPrevChannel();
          }}
        >
          <Text style={styles.channelSwitchIcon}>◀</Text>
          <Text style={styles.channelSwitchText}>Kênh trước</Text>
        </TouchableOpacity>
      )}

      {/* Nút Kênh sau (Bên phải) - Cùng logic với nút Quay lại, tự ẩn sau 4s */}
      {showControls && onNextChannel && (
        <TouchableOpacity
          style={[styles.channelSwitchBtn, styles.channelSwitchBtnRight]}
          activeOpacity={0.7}
          onPress={() => {
            resetControlsTimer();
            onNextChannel();
          }}
        >
          <Text style={styles.channelSwitchText}>Kênh sau</Text>
          <Text style={styles.channelSwitchIcon}>▶</Text>
        </TouchableOpacity>
      )}

      {/* Loading Overlay */}
      {loading && !error && (
        <View style={styles.overlayContainer} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.overlayText}>
            Đang kết nối kênh {channel.name}...
          </Text>
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
          <View style={styles.errorButtonsRow}>
            <TouchableOpacity
              style={styles.errorBackButton}
              activeOpacity={0.7}
              onPress={onBack}
            >
              <Text style={styles.errorBackButtonText}>Quay lại danh sách</Text>
            </TouchableOpacity>

            {onNextChannel && (
              <TouchableOpacity
                style={styles.errorNextButton}
                activeOpacity={0.7}
                onPress={() => {
                  setError(false);
                  onNextChannel();
                }}
              >
                <Text style={styles.errorNextButtonText}>Thử kênh tiếp ▶</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topControlBar: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 8,
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
  channelTitleBadge: {
    backgroundColor: 'rgba(20, 20, 26, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFD700',
    maxWidth: '65%',
    elevation: 8,
  },
  channelTitleBadgeText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  channelSwitchBtn: {
    position: 'absolute',
    bottom: '42%',
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 4.65,
  },
  channelSwitchBtnLeft: {
    left: 20,
  },
  channelSwitchBtnRight: {
    right: 20,
  },
  channelSwitchIcon: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
  },
  channelSwitchText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
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
  errorButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },
  errorBackButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  errorBackButtonText: {
    color: '#121214',
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorNextButton: {
    marginLeft: 16,
    backgroundColor: '#2A2A38',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 4,
  },
  errorNextButtonText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
