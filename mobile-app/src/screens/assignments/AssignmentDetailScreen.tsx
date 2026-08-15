import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { api } from '../../api';
import { Submission } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate } from '../../utils/dates';
import { AssignmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssignmentsStackParamList, 'AssignmentDetail'>;

export default function AssignmentDetailScreen({ route, navigation }: Props) {
  const { assessmentId } = route.params;
  const [submission, setSubmission] = useState<Submission | null>(null);

  const load = useCallback(async () => {
    const subs = await api.getSubmissions();
    setSubmission(subs.find((s) => s.assessmentId === assessmentId) ?? null);
  }, [assessmentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!submission) {
    return (
      <Screen>
        <Text style={typography.body}>Loading assignment…</Text>
      </Screen>
    );
  }

  const { assessment } = submission;
  const canSubmit = submission.status === 'NOT_SUBMITTED';

  return (
    <Screen>
      <View style={styles.badgeRow}>
        <Badge label={assessment.type.replace('_', ' ')} tone="neutral" />
        {assessment.subjectCode && <Badge label={assessment.subjectCode} tone="info" />}
      </View>
      <Text style={styles.title}>{assessment.title}</Text>
      <Text style={styles.meta}>
        Due {formatDate(assessment.dueDate)} · Weight {assessment.weightagePercent.toFixed(1)}% · Max {assessment.maxScore} pts
      </Text>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.body}>{assessment.description}</Text>
      </Card>

      {assessment.guidelines && (
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.sectionTitle}>Guidelines</Text>
          <Text style={styles.body}>{assessment.guidelines}</Text>
        </Card>
      )}

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.sectionTitle}>Your Submission</Text>
        {submission.status === 'NOT_SUBMITTED' ? (
          <Text style={styles.body}>You haven't submitted this yet.</Text>
        ) : (
          <>
            <Text style={styles.body}>File: {submission.fileName}</Text>
            <Text style={styles.metaSmall}>Submitted {submission.submittedAt ? formatDate(submission.submittedAt) : '—'}</Text>
            {submission.score != null ? (
              <View style={{ marginTop: spacing.md }}>
                <Text style={styles.scoreText}>Score: {submission.score}/{assessment.maxScore}</Text>
                {submission.feedback && <Text style={styles.feedback}>"{submission.feedback}"</Text>}
              </View>
            ) : (
              <Text style={styles.metaSmall}>Awaiting grading.</Text>
            )}
          </>
        )}
      </Card>

      {canSubmit && (
        <View style={{ marginTop: spacing.xl }}>
          <Button label="Submit Assignment" onPress={() => navigation.navigate('Submit', { assessmentId })} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.navy, marginBottom: spacing.xs },
  meta: { ...typography.caption, color: colors.textSecondary },
  sectionTitle: { ...typography.h3, color: colors.navy, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textPrimary },
  metaSmall: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
  scoreText: { ...typography.bodyBold, color: colors.success },
  feedback: { ...typography.caption, color: colors.textSecondary, fontStyle: 'italic', marginTop: 6 },
});
