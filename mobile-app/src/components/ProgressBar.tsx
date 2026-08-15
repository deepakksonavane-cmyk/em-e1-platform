import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme/theme';

export default function ProgressBar({
  progress,
  color = colors.amber,
  trackColor = colors.border,
  height = 8,
}: {
  progress: number; // 0..1
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
