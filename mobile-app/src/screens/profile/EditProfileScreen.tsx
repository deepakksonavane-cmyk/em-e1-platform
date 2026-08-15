import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { student } = useAuth();
  const [name, setName] = useState(student?.user.name ?? '');
  const [phone, setPhone] = useState(student?.user.phone ?? '');
  const [city, setCity] = useState(student?.city ?? '');
  const [state, setState] = useState(student?.state ?? '');
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ name, phone, city, state });
      Alert.alert('Saved', 'Your profile has been updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert('Could not save', err?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Input label="Full Name" value={name} onChangeText={setName} />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="State" value={state} onChangeText={setState} />
        <Button label="Save Changes" onPress={onSave} loading={saving} />
      </KeyboardAvoidingView>
    </Screen>
  );
}
