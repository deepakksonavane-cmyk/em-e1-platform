import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge, { BadgeTone } from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import { api } from '../../api';
import { Notification, NotificationType } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDateTime } from '../../utils/dates';

const TYPE_TONE: Record<NotificationType, BadgeTone> = {
  SESSION_REMINDER: 'info',
  DEADLINE_REMINDER: 'warning',
  GRADE_POSTED: 'success',
  ANNOUNCEMENT: 'amber',
  ATTENDANCE: 'neutral',
  GENERAL: 'neutral',
};

export default function NotificationsScreen() {
  const [items, setItems] = useState<Notification[]>([]);

  const load = useCallback(async () => {
    setItems(await api.getNotifications());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onPressItem = async (n: Notification) => {
    if (!n.isRead) {
      await api.markNotificationRead(n.id);
      load();
    }
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        ListEmptyComponent={<EmptyState title="No notifications yet" subtitle="Session reminders and updates will appear here." />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onPressItem(item)}>
            <Card style={[styles.card, !item.isRead && styles.unreadCard]}>
              <View style={styles.row}>
                <Badge label={item.type.replace('_', ' ')} tone={TYPE_TONE[item.type]} />
                {!item.isRead && <View style={styles.dot} />}
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  unreadCard: { borderColor: colors.amber, borderWidth: 1.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.amber },
  title: { ...typography.bodyBold, color: colors.textPrimary, marginBottom: 4 },
  body: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  time: { ...typography.small, color: colors.textMuted },
});
