import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { api } from '../../api';
import { Weekend } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate, isPast } from '../../utils/dates';
import { WeekendsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<WeekendsStackParamList, 'WeekendList'>;

export default function WeekendListScreen({ navigation }: Props) {
  const [weekends, setWeekends] = useState<Weekend[]>([]);

  const load = useCallback(async () => {
    setWeekends(await api.getWeekends());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>In-Person Weekends</Text>
        <Text style={styles.headerSub}>3 mandatory weekends across the 24-week program</Text>
      </View>
      <FlatList
        data={weekends}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const done = item.endDate ? isPast(new Date(item.endDate)) : false;
          return (
            <TouchableOpacity onPress={() => navigation.navigate('WeekendDetail', { weekendId: item.id })}>
              <Card style={styles.card}>
                <View style={styles.rowTop}>
                  <Badge label={item.code} tone="neutral" />
                  <Badge label={done ? 'Completed' : 'Upcoming'} tone={done ? 'success' : 'amber'} />
                </View>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.focus}>{item.focus}</Text>
                <Text style={styles.meta}>
                  Week {item.week} · {formatDate(item.startDate!)} – {formatDate(item.endDate!)} · {item.totalHours}h
                </Text>
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerTitle: { ...typography.h1, color: colors.navy },
  headerSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { ...typography.h3, color: colors.textPrimary, marginBottom: 2 },
  focus: { ...typography.body, color: colors.textSecondary, marginBottom: 6 },
  meta: { ...typography.caption, color: colors.textMuted },
});
