import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { api } from '../../api';
import { Session, Subject } from '../../types';
import { colors, radius, spacing, typography } from '../../theme/theme';
import { formatShortDate } from '../../utils/dates';
import { ScheduleStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ScheduleStackParamList, 'SessionList'>;

export default function SessionListScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [weekFilter, setWeekFilter] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [s, subj] = await Promise.all([api.getSessions(), api.getSubjects()]);
    setSessions(s);
    setSubjects(subj);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const weeks = useMemo(() => Array.from(new Set(sessions.map((s) => s.week))).sort((a, b) => a - b), [sessions]);

  const filtered = useMemo(
    () =>
      sessions.filter(
        (s) => (!subjectFilter || s.subjectCode === subjectFilter) && (!weekFilter || s.week === weekFilter)
      ),
    [sessions, subjectFilter, weekFilter]
  );

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Schedule</Text>
        <Text style={styles.headerSub}>{sessions.length} sessions · {filtered.length} shown</Text>
      </View>

      <FlatList
        horizontal
        data={[{ code: null, name: 'All Subjects' } as any, ...subjects]}
        keyExtractor={(s) => s.code ?? 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, subjectFilter === item.code && styles.chipActive]}
            onPress={() => setSubjectFilter(item.code)}
          >
            <Text style={[styles.chipText, subjectFilter === item.code && styles.chipTextActive]}>
              {item.code ?? item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        horizontal
        data={[null, ...weeks]}
        keyExtractor={(w) => (w === null ? 'all-weeks' : `w-${w}`)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipsRow, { paddingTop: 0 }]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.weekChip, weekFilter === item && styles.chipActive]}
            onPress={() => setWeekFilter(item)}
          >
            <Text style={[styles.chipText, weekFilter === item && styles.chipTextActive]}>
              {item === null ? 'All Weeks' : `Wk ${item}`}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}>
            <Card style={styles.sessionCard}>
              <View style={styles.sessionRow}>
                <View style={styles.sessionDateBox}>
                  <Text style={styles.sessionDateDay}>{formatShortDate(item.scheduledDate!).split(' ')[1]}</Text>
                  <Text style={styles.sessionDateMonth}>{formatShortDate(item.scheduledDate!).split(' ')[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRow}>
                    <Badge label={item.code} tone="neutral" />
                    <Badge
                      label={item.status}
                      tone={item.status === 'completed' ? 'success' : item.status === 'live' ? 'danger' : 'info'}
                    />
                  </View>
                  <Text style={styles.sessionTopic} numberOfLines={2}>
                    {item.topic}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {item.subjectCode} · Week {item.week} · {item.day} · {item.startTime}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  headerTitle: { ...typography.h1, color: colors.navy },
  headerSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  chipsRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  weekChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sessionCard: { marginBottom: spacing.md },
  sessionRow: { flexDirection: 'row', gap: spacing.md },
  sessionDateBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionDateDay: { color: colors.white, fontWeight: '800', fontSize: 18 },
  sessionDateMonth: { color: colors.amber, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: 6 },
  sessionTopic: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
  sessionMeta: { ...typography.small, color: colors.textMuted },
});
