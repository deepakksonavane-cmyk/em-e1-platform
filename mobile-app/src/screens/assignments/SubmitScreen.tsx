import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { api } from '../../api';
import { colors, radius, spacing, typography } from '../../theme/theme';
import { AssignmentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AssignmentsStackParamList, 'Submit'>;

export default function SubmitScreen({ route, navigation }: Props) {
  const { assessmentId } = route.params;
  const [pickedFile, setPickedFile] = useState<{ uri: string; name: string; size?: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onPickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setPickedFile({ uri: asset.uri, name: asset.name, size: asset.size ?? undefined });
  };

  const onSubmit = async () => {
    if (!pickedFile) {
      Alert.alert('No file selected', 'Please choose a document to submit.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitAssessment(assessmentId, { fileUri: pickedFile.uri, fileName: pickedFile.name });
      Alert.alert('Submitted!', 'Your assignment has been submitted successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('AssignmentDetail', { assessmentId }) },
      ]);
    } catch (err: any) {
      Alert.alert('Submission failed', err?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Submit your work</Text>
      <Text style={styles.subtitle}>Choose a PDF, Word document, or image of your completed assignment.</Text>

      <Card style={styles.pickerCard} onTouchEnd={onPickDocument}>
        {pickedFile ? (
          <>
            <Text style={styles.fileIcon}>📄</Text>
            <Text style={styles.fileName}>{pickedFile.name}</Text>
            {pickedFile.size ? <Text style={styles.fileSize}>{(pickedFile.size / 1024).toFixed(0)} KB</Text> : null}
          </>
        ) : (
          <>
            <Text style={styles.fileIcon}>📎</Text>
            <Text style={styles.filePlaceholder}>Tap to choose a file</Text>
          </>
        )}
      </Card>

      <View style={{ marginTop: spacing.sm }}>
        <Button label={pickedFile ? 'Choose Different File' : 'Choose File'} onPress={onPickDocument} variant="outline" />
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Button label="Submit" onPress={onSubmit} loading={submitting} disabled={!pickedFile} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.navy, marginBottom: spacing.xs },
  subtitle: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xl },
  pickerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  fileIcon: { fontSize: 36, marginBottom: spacing.sm },
  fileName: { ...typography.bodyBold, color: colors.textPrimary },
  fileSize: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  filePlaceholder: { ...typography.body, color: colors.textMuted },
});
