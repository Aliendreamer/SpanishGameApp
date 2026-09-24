import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useT } from '@/i18n';
import { PrimaryButton } from '@/components/primary-button';
import { StepHeading } from '@/components/step-heading';
import { colors, fonts, radii } from '@/theme';
import { isValidUsername, USERNAME_MAX, USERNAME_MIN } from '@/utils/username';

type Props = {
  // Called with the trimmed name, only when it is valid.
  onSubmit: (name: string) => void | Promise<void>;
};

// Onboarding step 2 of 4 (docs/design/swipe-game-ui/README.md, "Username").
export function Username({ onSubmit }: Props) {
  const t = useT();
  const [name, setName] = useState('');
  // The error waits until the user types or presses Continue, as in the prototype.
  const [touched, setTouched] = useState(false);
  const trimmed = name.trim();
  const valid = isValidUsername(name);
  const showError = touched && !valid;

  // Returns the submit promise so the button can ignore presses until it settles.
  const submit = () => {
    if (valid) return onSubmit(trimmed);
    setTouched(true);
  };

  return (
    <View style={styles.content}>
      <StepHeading title={t.username.title} body={t.username.body} />
      <View style={styles.field}>
        <TextInput
          value={name}
          onChangeText={(text) => {
            setName(text);
            setTouched(true);
          }}
          onSubmitEditing={submit}
          maxLength={USERNAME_MAX}
          placeholder={t.common.username}
          placeholderTextColor={colors.placeholder}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          submitBehavior="submit"
          style={[styles.input, showError && styles.inputError]}
        />
        <View style={styles.meta}>
          <Text style={styles.error}>{showError ? t.username.tooShort(USERNAME_MIN) : ''}</Text>
          <Text style={styles.count}>{`${name.length} / ${USERNAME_MAX}`}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label={t.common.continue} onPress={submit} dimmed={!valid} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 18,
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
