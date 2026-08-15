import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/Screen';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme/theme';
import { AuthStackParamList } from '../../navigation/types';
import { DEMO_ACCOUNTS } from '../../data/mockData';
import { USE_MOCK_DATA } from '../../api/config';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState(USE_MOCK_DATA ? DEMO_ACCOUNTS[0].credentials.email : '');
  const [password, setPassword] = useState(USE_MOCK_DATA ? DEMO_ACCOUNTS[0].credentials.password : '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      Alert.alert('Login failed', err?.message ?? 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll style={{ flexGrow: 1, justifyContent: 'center' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>E1</Text>
          </View>
          <Text style={styles.programName}>Event Management &{'\n'}Team Leadership</Text>
          <Text style={styles.programSub}>Student Portal · Diploma Program</Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        <Button label="Log In" onPress={onSubmit} loading={loading} />

        <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>
            New here? <Text style={styles.registerTextBold}>Create an account</Text>
          </Text>
        </TouchableOpacity>

        {USE_MOCK_DATA && (
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo mode — sample accounts</Text>
            {DEMO_ACCOUNTS.slice(0, 2).map((a) => (
              <Text key={a.credentials.email} style={styles.demoLine}>
                {a.credentials.email} / {a.credentials.password}
              </Text>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    color: colors.amber,
    fontSize: 22,
    fontWeight: '800',
  },
  programName: {
    ...typography.h2,
    textAlign: 'center',
    color: colors.navy,
  },
  programSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  registerLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  registerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  registerTextBold: {
    color: colors.amberDark,
    fontWeight: '700',
  },
  demoBox: {
    marginTop: spacing.xxl,
    padding: spacing.md,
    backgroundColor: colors.amberLight,
    borderRadius: 10,
  },
  demoTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.amberDark,
    marginBottom: spacing.xs,
  },
  demoLine: {
    ...typography.caption,
    color: colors.navyDark,
  },
});
