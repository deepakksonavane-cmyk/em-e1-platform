import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { api } from '../../api';
import { Weekend } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate } from '../../utils/dates';
import { WeekendsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WeekendsStackParamList, 'WeekendDetail'>;

export default function WeekendDetailScreen({ route }: Props) {
  const { weekendId } = route.params;
  const [weekend, setWeekend] = useState<Weekend | null>(null);

  const load = useCallback(async () => {
    const all = await api.getWeekends();
    setWeekend(all.find((w) => w.id === weekendId) ?? null);
  }, [weekendId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!weekend) {
    return (
      <Screen>
        <Text style={typography.body}>Loading weekend details…</Text>
      </Screen>
    );
  }

  const onOpenMap = () => {
    if (weekend.venueMapUrl) Linking.openURL(weekend.venueMapUrl);
  };

  return (
    <Screen>
      <Text style={styles.title}>{weekend.name}</Text>
      <Text style={styles.focus}>{weekend.focus}</Text>
      <Text style={styles.meta}>
        {formatDate(weekend.startDate!)} – {formatDate(weekend.endDate!)} · Week {weekend.week} · {weekend.totalHours} total hours
      </Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        {weekend.days.map((d) => (
          <View key={d.day} style={styles.scheduleRow}>
            <Text style={styles.scheduleDay}>{d.day}</Text>
            <Text style={styles.scheduleHours}>{d.hours} hours</Text>
          </View>
        ))}
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Venue</Text>
        <Text style={styles.body}>{weekend.venueName}</Text>
        <Text style={styles.caption}>{weekend.venueAddress}</Text>
        <View style={{ marginTop: spacing.md }}>
          <Button label="Open in Google Maps" onPress={onOpenMap} variant="outline" />
        </View>
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Activities</Text>
        {weekend.activities.map((a) => (
          <View key={a} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{a}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.navy, marginBottom: 4 },
  focus: { ...typography.body, color: colors.textSecondary, marginBottom: 4 },
  meta: { ...typography.caption, color: colors.textMuted },
  sectionTitle: { ...typography.h3, color: colors.navy, marginBottom: spacing.sm },
  body: { ...typography.bodyBold, color: colors.textPrimary },
  caption: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  scheduleDay: { ...typography.body, color: colors.textPrimary },
  scheduleHours: { ...typography.body, color: colors.textSecondary },
  bulletRow: { flexDirection: 'row', marginBottom: 6 },
  bulletDot: { color: colors.amberDark, marginRight: 8, fontWeight: '700' },
  bulletText: { ...typography.body, color: colors.textPrimary, flex: 1 },
});
