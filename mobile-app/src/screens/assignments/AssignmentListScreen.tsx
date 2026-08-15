import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge, { BadgeTone } from '../../components/Badge';
import { api } from '../../api';
import { Submission } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate, relativeDayLabel } from '../../utils/dates';
import { AssignmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssignmentsStackParamList, 'AssignmentList'>;

const STATUS_TONE: Record<Submission['status'], BadgeTone> = {
  NOT_SUBMITTED: 'danger',
  SUBMITTED: 'info',
  LATE: 'warning',
  GRADED: 'success',
  RETURNED: 'warning',
};

const STATUS_LABEL: Record<Submission['status'], string> = {
  NOT_SUBMITTED: 'Not Submitted',
  SUBMITTED: 'Submitted',
  LATE: 'Submitted Late',
  GRADED: 'Graded',
  RETURNED: 'Returned',
};

export default function AssignmentListScreen({ navigation }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const load = useCallback(async () => {
    const subs = await api.getSubmissions();
    subs.sort((a, b) => new Date(a.assessment.dueDate).getTime() - new Date(b.assessment.dueDate).getTime());
    setSubmissions(subs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assignments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Grades')}>
          <Text style={styles.gradesLink}>View Grades →</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={submissions}
        keyExtractor={(s) => s.assessmentId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('AssignmentDetail', { assessmentId: item.assessmentId })}>
            <Card style={styles.card}>
              <View style={styles.rowTop}>
                <Badge label={item.assessment.type.replace('_', ' ')} tone="neutral" />
                <Badge label={STATUS_LABEL[item.status]} tone={STATUS_TONE[item.status]} />
              </View>
              <Text style={styles.title}>{item.assessment.title}</Text>
              <Text style={styles.meta}>
                Due {formatDate(item.assessment.dueDate)} · {relativeDayLabel(item.assessment.dueDate)}
              </Text>
              {item.score != null && <Text style={styles.score}>Score: {item.score}/100</Text>}
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { ...typography.h1, color: colors.navy },
  gradesLink: { ...typography.caption, color: colors.amberDark, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
  meta: { ...typography.caption, color: colors.textSecondary },
  score: { ...typography.caption, color: colors.success, fontWeight: '700', marginTop: 6 },
});
