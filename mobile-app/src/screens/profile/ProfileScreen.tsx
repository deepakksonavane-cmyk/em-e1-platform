import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { colors, spacing, typography } from '../../theme/theme';
import { formatDate } from '../../utils/dates';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export default function ProfileScreen({ navigation }: Props) {
  const { student, logout } = useAuth();
  const [attendancePct, setAttendancePct] = useState<number | null>(null);

  const load = useCallback(async () => {
    const dashboard = await api.getDashboard();
    setAttendancePct(dashboard.attendancePercent);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!student) return null;

  const onLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const certificateIssued = false; // program in progress in the demo timeline

  return (
    <Screen>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{student.user.name}</Text>
        <Text style={styles.studentId}>{student.studentId} · {student.batch}</Text>
      </View>

      <Card>
        <InfoRow label="Email" value={student.user.email || '—'} />
        <InfoRow label="Phone" value={student.user.phone ?? '—'} />
        <InfoRow label="City" value={[student.city, student.state].filter(Boolean).join(', ') || '—'} />
        <InfoRow label="Registered" value={formatDate(student.registrationDate)} />
        <InfoRow label="Status" value={student.status} last />
      </Card>

      <View style={{ marginTop: spacing.md }}>
        <Button label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} variant="outline" />
      </View>

      <Text style={styles.sectionTitle}>Attendance</Text>
      <TouchableOpacity onPress={() => navigation.navigate('AttendanceHistory')}>
        <Card style={styles.rowCard}>
          <View>
            <Text style={styles.rowCardTitle}>Attendance Rate</Text>
            <Text style={styles.rowCardSub}>Minimum 80% required to remain in good standing</Text>
          </View>
          <Text style={[styles.attendanceValue, { color: (attendancePct ?? 0) >= 80 ? colors.success : colors.danger }]}>
            {attendancePct ?? '—'}%
          </Text>
        </Card>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Certificate</Text>
      <Card style={styles.rowCard}>
        <View>
          <Text style={styles.rowCardTitle}>Diploma Certificate</Text>
          <Text style={styles.rowCardSub}>Issued upon successful completion of all 6 subjects, internship, and capstone.</Text>
        </View>
        <Badge label={certificateIssued ? 'Issued' : 'In Progress'} tone={certificateIssued ? 'success' : 'warning'} />
      </Card>

      <View style={{ marginTop: spacing.xxl }}>
        <Button label="Log Out" onPress={onLogout} variant="danger" />
      </View>
    </Screen>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.amber, fontSize: 28, fontWeight: '800' },
  name: { ...typography.h2, color: colors.navy },
  studentId: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { ...typography.caption, color: colors.textSecondary },
  infoValue: { ...typography.bodyBold, color: colors.textPrimary },
  sectionTitle: { ...typography.h3, color: colors.navy, marginTop: spacing.xl, marginBottom: spacing.md },
  rowCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowCardTitle: { ...typography.bodyBold, color: colors.textPrimary },
  rowCardSub: { ...typography.small, color: colors.textMuted, marginTop: 2, maxWidth: 240 },
  attendanceValue: { fontSize: 22, fontWeight: '800' },
});
