import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'amber';

const TONE_STYLES: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.infoBg, fg: colors.info },
  neutral: { bg: colors.offWhite, fg: colors.textSecondary },
  amber: { bg: colors.amberLight, fg: colors.amberDark },
};

export default function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const t = TONE_STYLES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
