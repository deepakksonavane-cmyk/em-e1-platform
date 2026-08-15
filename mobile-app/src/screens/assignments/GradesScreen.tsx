import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import { api } from '../../api';
import { Grade } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';

export default function GradesScreen() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [overall, setOverall] = useState<{ score: number; breakdown: { label: string; weight: number; score: number | null }[] } | null>(null);

  const load = useCallback(async () => {
    const [g, o] = await Promise.all([api.getGrades(), api.getOverallScore()]);
    setGrades(g);
    setOverall(o);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen>
      <Text style={styles.headerTitle}>Grades</Text>

      <Card style={styles.overallCard}>
        <Text style={styles.overallLabel}>Projected Overall Score</Text>
        <Text style={styles.overallScore}>{overall?.score ?? 0}%</Text>
        <ProgressBar progress={(overall?.score ?? 0) / 100} height={10} />
        <Text style={styles.overallCaption}>Based on components graded so far, weighted per program rubric.</Text>
      </Card>

      <Text style={styles.sectionTitle}>Weighted Breakdown</Text>
      <Card>
        {overall?.breakdown.map((b) => (
          <View key={b.label} style={styles.breakdownRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.breakdownLabel}>{b.label}</Text>
              <Text style={styles.breakdownWeight}>{b.weight}% of final grade</Text>
            </View>
            <Text style={[styles.breakdownScore, b.score == null && styles.breakdownPending]}>
              {b.score != null ? `${b.score}/100` : 'Pending'}
            </Text>
          </View>
        ))}
      </Card>

      <Text style={styles.sectionTitle}>Category Grades</Text>
      {grades.map((g) => (
        <Card key={g.id} style={{ marginBottom: spacing.md }}>
          <View style={styles.gradeRow}>
            <View>
              <Text style={styles.gradeCategory}>{g.category}</Text>
              {g.comments && <Text style={styles.gradeComments}>{g.comments}</Text>}
            </View>
            <View style={styles.gradeScoreBox}>
              <Text style={styles.gradeLetter}>{g.letterGrade}</Text>
              <Text style={styles.gradeNumeric}>{g.score}/{g.maxScore}</Text>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTitle: { ...typography.h1, color: colors.navy, marginBottom: spacing.lg },
  overallCard: { alignItems: 'center', paddingVertical: spacing.xl },
  overallLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  overallScore: { fontSize: 42, fontWeight: '800', color: colors.amberDark, marginBottom: spacing.md },
  overallCaption: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  sectionTitle: { ...typography.h3, color: colors.navy, marginTop: spacing.xl, marginBottom: spacing.md },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLabel: { ...typography.body, color: colors.textPrimary },
  breakdownWeight: { ...typography.small, color: colors.textMuted },
  breakdownScore: { ...typography.bodyBold, color: colors.textPrimary },
  breakdownPending: { color: colors.textMuted, fontWeight: '400' },
  gradeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gradeCategory: { ...typography.bodyBold, color: colors.textPrimary },
  gradeComments: { ...typography.caption, color: colors.textSecondary, marginTop: 4, maxWidth: 220 },
  gradeScoreBox: { alignItems: 'flex-end' },
  gradeLetter: { fontSize: 22, fontWeight: '800', color: colors.amberDark },
  gradeNumeric: { ...typography.caption, color: colors.textMuted },
});
