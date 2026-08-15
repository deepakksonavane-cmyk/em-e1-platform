import React from 'react';
import { ActivityIndicator, GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/theme';

interface Props {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({ label, onPress, variant = 'primary', disabled, loading, fullWidth = true }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles[variant],
        fullWidth && { alignSelf: 'stretch' },
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.navy : colors.white} />
      ) : (
        <Text style={[styles.label, textVariantStyles[variant]]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodyBold,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.amber },
  secondary: { backgroundColor: colors.navy },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.navy },
  danger: { backgroundColor: colors.danger },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: colors.navyDark },
  secondary: { color: colors.white },
  outline: { color: colors.navy },
  danger: { color: colors.white },
});
