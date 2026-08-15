import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge, { BadgeTone } from '../../components/Badge';
import { api } from '../../api';
import { Attendance, AttendanceStatus } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate } from '../../utils/dates';

const STATUS_TONE: Record<AttendanceStatus, BadgeTone> = {
  PRESENT: 'success',
  LATE: 'warning',
  EXCUSED: 'info',
  ABSENT: 'danger',
};

export default function AttendanceHistoryScreen() {
  const [records, setRecords] = useState<Attendance[]>([]);

  const load = useCallback(async () => {
    const data = await api.getAttendanceHistory();
    data.sort((a, b) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime());
    setRecords(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const presentCount = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const pct = records.length ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <Text style={styles.headerSub}>{records.length} sessions tracked · {pct}% attendance</Text>
      </View>
      <FlatList
        data={records}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionCode}>{item.sessionCode}</Text>
              <Text style={styles.sessionTopic} numberOfLines={1}>
                {item.sessionTopic}
              </Text>
              <Text style={styles.date}>{formatDate(item.markedAt)}</Text>
            </View>
            <Badge label={item.status} tone={STATUS_TONE[item.status]} />
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerTitle: { ...typography.h1, color: colors.navy },
  headerSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sessionCode: { ...typography.small, color: colors.textMuted, fontWeight: '700' },
  sessionTopic: { ...typography.bodyBold, color: colors.textPrimary, marginTop: 2, maxWidth: 220 },
  date: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
