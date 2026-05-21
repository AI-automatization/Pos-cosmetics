import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { colors } from '../../theme/colors';

const BANNER_HEIGHT = 36;
const ANIM_DURATION = 200;
const RECONNECT_DELAY = 2000;

export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [visible, setVisible] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setVisible(true);
      setShowReconnected(false);
      Animated.timing(heightAnim, {
        toValue: BANNER_HEIGHT,
        duration: ANIM_DURATION,
        useNativeDriver: false,
      }).start();
    } else if (wasOffline.current) {
      wasOffline.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => {
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: false,
        }).start(() => {
          setVisible(false);
          setShowReconnected(false);
        });
      }, RECONNECT_DELAY);
      return () => clearTimeout(timer);
    }
  }, [isOnline, heightAnim]);

  if (!visible) return null;

  const backgroundColor = showReconnected ? colors.success : colors.danger;
  const icon = showReconnected ? 'wifi' : 'cloud-offline';
  const message = showReconnected
    ? 'Qayta ulandi!'
    : 'Internet aloqasi yo\'q';

  return (
    <Animated.View
      style={[styles.container, { height: heightAnim, backgroundColor }]}
    >
      <Ionicons name={icon} size={16} color={colors.textInverse} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  text: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
  },
});
