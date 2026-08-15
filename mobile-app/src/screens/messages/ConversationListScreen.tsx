import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { api } from '../../api';
import { Conversation } from '../../types';
import { colors, spacing, typography } from '../../theme/theme';
import { formatShortDate } from '../../utils/dates';
import { MessagesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'ConversationList'>;

export default function ConversationListScreen({ navigation }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const load = useCallback(async () => {
    setConversations(await api.getConversations());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Faculty Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.facultyId}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No conversations yet" subtitle="Message a faculty member with questions about a session or assignment." />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Thread', { facultyId: item.facultyId })}>
            <Card style={styles.card}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{item.facultyName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={styles.rowTop}>
                  <Text style={styles.name}>{item.facultyName}</Text>
                  <Text style={styles.time}>{formatShortDate(item.lastMessage.createdAt)}</Text>
                </View>
                <Text style={styles.role}>{item.facultyRole}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage.senderName === 'You' ? 'You: ' : ''}
                  {item.lastMessage.body}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerTitle: { ...typography.h1, color: colors.navy },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.amber, fontWeight: '800', fontSize: 16 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  time: { ...typography.small, color: colors.textMuted },
  role: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  preview: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
});
