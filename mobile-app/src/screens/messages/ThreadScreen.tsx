import React, { useCallback, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../api';
import { Conversation, Message } from '../../types';
import { colors, radius, spacing, typography } from '../../theme/theme';
import { formatTime, formatDate } from '../../utils/dates';
import { MessagesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Thread'>;

export default function ThreadScreen({ route }: Props) {
  const { facultyId } = route.params;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const load = useCallback(async () => {
    const all = await api.getConversations();
    setConversation(all.find((c) => c.facultyId === facultyId) ?? null);
  }, [facultyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onSend = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await api.sendMessage(facultyId, draft.trim());
      setDraft('');
      await load();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={typography.body}>Loading conversation…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <View style={styles.threadHeader}>
          <Text style={styles.threadHeaderName}>{conversation.facultyName}</Text>
          <Text style={styles.threadHeaderRole}>{conversation.facultyRole}</Text>
        </View>

        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.senderName === 'You';
            return (
              <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{item.body}</Text>
                </View>
                <Text style={styles.bubbleTime}>
                  {formatDate(item.createdAt)} · {formatTime(item.createdAt)}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message…"
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={onSend} disabled={sending || !draft.trim()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.offWhite },
  threadHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  threadHeaderName: { ...typography.h3, color: colors.navy },
  threadHeaderRole: { ...typography.caption, color: colors.textMuted },
  list: { padding: spacing.lg, paddingBottom: spacing.xl },
  bubbleRow: { marginBottom: spacing.md, maxWidth: '80%' },
  bubbleRowMine: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowTheirs: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: radius.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  bubbleMine: { backgroundColor: colors.navy, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleText: { ...typography.body, color: colors.textPrimary },
  bubbleTextMine: { color: colors.white },
  bubbleTime: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    marginRight: spacing.sm,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.amber,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  sendButtonText: { ...typography.bodyBold, color: colors.navyDark },
});
