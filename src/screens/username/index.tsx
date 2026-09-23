import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { colors, fonts, radii } from '@/theme';

const MAX_LENGTH = 20;
const MIN_LENGTH = 2;

type Props = {
  // Called with the trimmed name, only when it is valid.
  onSubmit: (name: string) => void;
};

// Onboarding step 2 of 4 (docs/design/swipe-game-ui/README.md, "Username").
export function Username({ onSubmit }: Props) {
  const [name, setName] = useState('');
  // The error waits until the user types or presses Continue, as in the prototype.
  const [touched, setTouched] = useState(false);
  const trimmed = name.trim();
  const valid = trimmed.length >= MIN_LENGTH;
  const showError = touched && !valid;

  const submit = () => {
    if (valid) onSubmit(trimmed);
    else setTouched(true);
  };

  return (
    <View style={styles.content}>
      <View style={styles.copy}>
        <Text style={styles.title}>What should we call you?</Text>
        <Text style={styles.body}>Pick a username. It stays on this phone.</Text>
      </View>
      <View style={styles.field}>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setTouched(true);
          }}
          onSubmitEditing={submit}
          maxLength={MAX_LENGTH}
          placeholder="Username"
          placeholderTextColor={colors.placeholder}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          submitBehavior="submit"
          style={[styles.input, showError && styles.inputError]}
        />
        <View style={styles.meta}>
          <Text style={styles.error}>
            {showError ? `Use at least ${MIN_LENGTH} characters` : ''}
          </Text>
          <Text style={styles.count}>{`${name.length} / ${MAX_LENGTH}`}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={submit} dimmed={!valid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 18,
  },
  copy: {
    gap: 8,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    lineHeight: 34,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 23,
    color: colors.bodyMuted,
  },
  field: {
    gap: 8,
  },
  input: {
    height: 58,
    borderRadius: radii.row,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.ink,
  },
  inputError: {
    borderColor: colors.error,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.error,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.label,
  },
  footer: {
    marginTop: 'auto',
  },
});
