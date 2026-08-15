import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { api } from '../../api';
import { InternshipRecord } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate } from '../../utils/dates';
import { InternshipStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<InternshipStackParamList, 'InternshipHome'>;

const STATUS_LABEL: Record<InternshipRecord['status'], string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  evaluated: 'Evaluated',
};

export default function InternshipScreen({ navigation }: Props) {
  const [record, setRecord] = useState<InternshipRecord | null>(null);

  const load = useCallback(async () => {
    setRecord(await api.getInternship());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!record) {
    return (
      <Screen>
        <Text style={typography.body}>Loading internship logbook…</Text>
      </Screen>
    );
  }

  const pct = Math.min(1, record.loggedHours / record.requiredHours);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Internship Logbook</Text>
        <Badge label={STATUS_LABEL[record.status]} tone={record.status === 'not_started' ? 'neutral' : record.status === 'submitted' ? 'success' : 'info'} />
      </View>

      <Card>
        <View style={styles.progressHeader}>
          <Text style={styles.progressHours}>{record.loggedHours}</Text>
          <Text style={styles.progressTotal}> / {record.requiredHours} hours</Text>
        </View>
        <ProgressBar progress={pct} height={12} />
        <Text style={styles.progressCaption}>
          {record.loggedHours >= record.requiredHours
            ? 'Required hours complete — submit your internship report.'
            : `${Math.max(0, record.requiredHours - record.loggedHours)} hours remaining to meet the requirement.`}
        </Text>
      </Card>

      {record.organization && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Placement</Text>
          <Text style={styles.body}>{record.organization}</Text>
          {record.supervisorName && <Text style={styles.caption}>Supervisor: {record.supervisorName}</Text>}
          {record.supervisorEmail && <Text style={styles.caption}>{record.supervisorEmail}</Text>}
        </Card>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <Button label="+ Add Log Entry" onPress={() => navigation.navigate('AddLogEntry')} />
      </View>

      <Text style={styles.sectionTitleLarge}>Logged Entries</Text>
      {record.logs.length === 0 ? (
        <EmptyState title="No entries yet" subtitle="Log your internship hours as you complete them." />
      ) : (
        record.logs.map((log) => (
          <Card key={log.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.logRow}>
              <Text style={styles.logDate}>{formatDate(log.date)}</Text>
              <Text style={styles.logHours}>{log.hoursLogged}h</Text>
            </View>
            <Text style={styles.logActivity}>{log.activityDescription}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  headerTitle: { ...typography.h1, color: colors.navy },
  progressHeader: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.md },
  progressHours: { fontSize: 34, fontWeight: '800', color: colors.amberDark },
  progressTotal: { ...typography.body, color: colors.textSecondary },
  progressCaption: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.navy, marginBottom: spacing.xs },
  sectionTitleLarge: { ...typography.h3, color: colors.navy, marginTop: spacing.xl, marginBottom: spacing.md },
  body: { ...typography.bodyBold, color: colors.textPrimary },
  caption: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  logDate: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  logHours: { ...typography.caption, color: colors.amberDark, fontWeight: '800' },
  logActivity: { ...typography.body, color: colors.textPrimary },
});
