import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import Badge from '../../components/Badge';
import { api, DashboardSummary } from '../../api';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate, relativeDayLabel } from '../../utils/dates';
import { useAuth } from '../../context/AuthContext';
import { DashboardStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>;

export default function DashboardScreen({ navigation }: Props) {
  const { student } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const summary = await api.getDashboard();
    setData(summary);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <Screen>
        <Text style={typography.body}>Loading your dashboard…</Text>
      </Screen>
    );
  }

  const weeksPct = data.weeksElapsed / data.weeksTotal;
  const hoursPct = data.hoursCompleted / data.hoursTotal;
  const subjectsPct = data.subjectsCompleted / data.subjectsTotal;

  return (
    <Screen refreshing={refreshing} onRefresh={onRefresh}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.studentName}>{data.studentName.split(' ')[0]}</Text>
          <Text style={styles.studentId}>{data.studentIdCode} · {data.program.programName}</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Program progress */}
      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.cardTitle}>Program Progress</Text>

        <ProgressRow label={`Week ${data.weeksElapsed} of ${data.weeksTotal}`} pct={weeksPct} />
        <ProgressRow label={`${data.hoursCompleted} of ${data.hoursTotal} hours`} pct={hoursPct} />
        <ProgressRow label={`${data.subjectsCompleted} of ${data.subjectsTotal} subjects complete`} pct={subjectsPct} />

        <View style={styles.statGrid}>
          <StatTile value={`${data.attendancePercent}%`} label="Attendance" tone={data.attendancePercent >= 80 ? 'success' : 'danger'} />
          <StatTile value={`${data.overallScore}%`} label="Projected Score" tone="amber" />
        </View>
      </Card>

      {/* Next session */}
      <Text style={styles.sectionTitle}>Next Session</Text>
      {data.nextSession ? (
        <Card>
          <View style={styles.badgeRow}>
            <Badge label={data.nextSession.subjectCode} tone="info" />
            <Text style={styles.dateBadge}>{relativeDayLabel(data.nextSession.scheduledDate!)}</Text>
          </View>
          <Text style={styles.itemTitle}>{data.nextSession.topic}</Text>
          <Text style={styles.itemMeta}>
            {formatDate(data.nextSession.scheduledDate!)} · {data.nextSession.startTime}–{data.nextSession.endTime}
          </Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() =>
              (navigation.getParent()?.navigate as any)('Schedule', {
                screen: 'SessionDetail',
                params: { sessionId: data.nextSession!.id },
              })
            }
          >
            <Text style={styles.linkButtonText}>View Session →</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <Card>
          <Text style={styles.itemMeta}>No upcoming sessions scheduled.</Text>
        </Card>
      )}

      {/* Next deadline */}
      <Text style={styles.sectionTitle}>Next Deadline</Text>
      {data.nextDeadline ? (
        <Card>
          <View style={styles.badgeRow}>
            <Badge label={data.nextDeadline.type.replace('_', ' ')} tone="warning" />
            <Text style={styles.dateBadge}>{relativeDayLabel(data.nextDeadline.dueDate)}</Text>
          </View>
          <Text style={styles.itemTitle}>{data.nextDeadline.title}</Text>
          <Text style={styles.itemMeta}>Due {formatDate(data.nextDeadline.dueDate)}</Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() =>
              (navigation.getParent()?.navigate as any)('Assignments', {
                screen: 'AssignmentDetail',
                params: { assessmentId: data.nextDeadline!.id },
              })
            }
          >
            <Text style={styles.linkButtonText}>View Assignment →</Text>
          </TouchableOpacity>
        </Card>
      ) : (
        <Card>
          <Text style={styles.itemMeta}>You're all caught up — no pending deadlines.</Text>
        </Card>
      )}
    </Screen>
  );
}

function ProgressRow({ label, pct }: { label: string; pct: number }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
      </View>
      <ProgressBar progress={pct} />
    </View>
  );
}

function StatTile({ value, label, tone }: { value: string; label: string; tone: 'success' | 'danger' | 'amber' }) {
  const toneColor = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : colors.amberDark;
  return (
    <View style={styles.statTile}>
      <Text style={[styles.statValue, { color: toneColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { ...typography.body, color: colors.textSecondary },
  studentName: { ...typography.h1, color: colors.navy, marginTop: 2 },
  studentId: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellIcon: { fontSize: 18 },
  cardTitle: { ...typography.h3, color: colors.navy, marginBottom: spacing.md },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { ...typography.caption, color: colors.textSecondary },
  progressPct: { ...typography.caption, color: colors.textPrimary, fontWeight: '700' },
  statGrid: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.md },
  statTile: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.h3, color: colors.navy, marginTop: spacing.xl, marginBottom: spacing.md },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  dateBadge: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  itemTitle: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
  itemMeta: { ...typography.caption, color: colors.textSecondary },
  linkButton: { marginTop: spacing.md },
  linkButtonText: { ...typography.caption, color: colors.amberDark, fontWeight: '700' },
});
