import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { api } from '../../api';
import { colors, radius, spacing, typography } from '../../theme/theme';
import { formatDate } from '../../utils/dates';
import { InternshipStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<InternshipStackParamList, 'AddLogEntry'>;

export default function AddLogEntryScreen({ navigation }: Props) {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [hours, setHours] = useState('');
  const [activity, setActivity] = useState('');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    const hoursNum = parseFloat(hours);
    if (!hoursNum || hoursNum <= 0 || hoursNum > 24) {
      Alert.alert('Invalid hours', 'Enter a number of hours between 0 and 24.');
      return;
    }
    if (!activity.trim()) {
      Alert.alert('Missing activity', 'Describe what you worked on.');
      return;
    }
    setSaving(true);
    try {
      await api.addInternshipLog({ date: date.toISOString(), hoursLogged: hoursNum, activityDescription: activity.trim() });
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Could not save entry', err?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Log Internship Hours</Text>
      <Text style={styles.subtitle}>Track real-world event experience toward your 30-hour requirement.</Text>

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selected) => {
            setShowPicker(Platform.OS === 'ios');
            if (selected) setDate(selected);
          }}
        />
      )}

      <Input
        label="Hours Worked"
        value={hours}
        onChangeText={setHours}
        keyboardType="decimal-pad"
        placeholder="e.g. 3.5"
      />

      <Input
        label="Activity Description"
        value={activity}
        onChangeText={setActivity}
        placeholder="What did you work on?"
        multiline
        numberOfLines={4}
        style={{ height: 100, textAlignVertical: 'top' }}
      />

      <Button label="Save Entry" onPress={onSave} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.navy, marginBottom: spacing.xs },
  subtitle: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xl },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '600' },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
  },
  dateButtonText: { ...typography.body, color: colors.textPrimary },
});
