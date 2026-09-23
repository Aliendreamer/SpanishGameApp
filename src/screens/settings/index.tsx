import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CreditsSheet } from '@/components/credits-sheet';
import { LinkRow, RadioRow, Section, SwitchRow } from '@/components/settings-rows';
import type { Settings as GameSettings } from '@/storage/progress-db';
import { colors, fonts, radii, spacing } from '@/theme';
import { isValidUsername, USERNAME_MAX } from '@/utils/username';
import { LEVELS } from '@/vocabulary/levels';

type Props = {
  username: string;
  showTutorial: boolean;
  settings: GameSettings;
  // Called with the trimmed name, only when it is valid.
  onSaveUsername: (name: string) => void;
  onShowTutorialChange: (show: boolean) => void;
  onViewTutorial: () => void;
  onSettingsChange: (changes: Partial<GameSettings>) => void;
  // Clears the swipe log only.
  onResetProgress: () => Promise<void>;
};

type ResetState = 'idle' | 'armed' | 'done' | 'failed';
const RESET_LABELS: Record<ResetState, string> = {
  idle: 'Reset progress',
  armed: 'Tap again to reset',
  done: 'Progress reset',
  failed: 'Reset failed. Tap to try again',
};

// The Settings tab (docs/design/swipe-game-ui/README.md, "Settings tab"). Every change is saved at
// once through the callbacks; the screen keeps the values it shows.
export function Settings({
  username,
  showTutorial: initialShowTutorial,
  settings: initialSettings,
  onSaveUsername,
  onShowTutorialChange,
  onViewTutorial,
  onSettingsChange,
  onResetProgress,
}: Props) {
  const [name, setName] = useState(username);
  const [showTutorial, setShowTutorial] = useState(initialShowTutorial);
  const [settings, setSettings] = useState(initialSettings);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [reset, setReset] = useState<ResetState>('idle');

  const nameValid = isValidUsername(name);
  const saveName = () => {
    if (nameValid) onSaveUsername(name.trim());
  };
  const change = (changes: Partial<GameSettings>) => {
    setSettings({ ...settings, ...changes });
    onSettingsChange(changes);
  };
  // The first tap arms it; the next (or a retry after a failure) resets.
  const pressReset = async () => {
    if (reset !== 'armed' && reset !== 'failed') {
      setReset('armed');
      return;
    }
    try {
      await onResetProgress();
      setReset('done');
    } catch {
      setReset('failed');
    }
  };
  const isFull = settings.level === 'full';

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={styles.title}>
        Settings
      </Text>

      <Section label="PROFILE">
        <View style={styles.profile}>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            accessibilityLabel="Username"
            value={name}
            onChangeText={setName}
            onBlur={saveName}
            onSubmitEditing={saveName}
            maxLength={USERNAME_MAX}
            placeholder="Username"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            style={[styles.input, !nameValid && styles.inputError]}
          />
          <Text style={[styles.note, !nameValid && styles.noteError]}>
            {nameValid ? 'Saved on this phone' : 'Use 2–20 characters'}
          </Text>
        </View>
      </Section>

      <Section label="TUTORIAL">
        <SwitchRow
          label="Show tutorial at start"
          detail='Open "How it works" each time the app starts'
          value={showTutorial}
          onValueChange={(show) => {
            setShowTutorial(show);
            onShowTutorialChange(show);
          }}
        />
        <LinkRow label="View tutorial now" onPress={onViewTutorial} />
      </Section>

      <Section label="LEVEL">
        {LEVELS.map(({ id, label, detail }) => (
          <RadioRow
            key={id}
            label={label}
            detail={detail}
            selected={settings.level === id}
            onPress={() => change({ level: id })}
          />
        ))}
      </Section>

      <Section label="BATCH">
        <SwitchRow
          label="Include lower levels"
          detail={isFull ? 'Not used with Full' : 'Mix in easier words'}
          value={settings.includeLower && !isFull}
          disabled={isFull}
          onValueChange={(includeLower) => change({ includeLower })}
        />
        <SwitchRow
          label="Include known words"
          detail="Review words you already know"
          value={settings.includeKnown}
          onValueChange={(includeKnown) => change({ includeKnown })}
        />
      </Section>

      <Section label="ABOUT">
        <LinkRow label="Credits" onPress={() => setCreditsOpen(true)} />
        <LinkRow label={RESET_LABELS[reset]} tone="danger" onPress={pressReset} />
      </Section>

      {creditsOpen && <CreditsSheet onClose={() => setCreditsOpen(false)} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingTop: 14,
    paddingHorizontal: spacing.screen,
    paddingBottom: 16,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  profile: {
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  input: {
    height: 48,
    borderRadius: radii.tile,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.soft,
    paddingHorizontal: 14,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.ink,
  },
  inputError: {
    borderColor: colors.error,
  },
  note: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  noteError: {
    color: colors.error,
  },
});
