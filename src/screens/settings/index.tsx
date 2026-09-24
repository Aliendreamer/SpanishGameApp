import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { CreditsSheet } from '@/components/credits-sheet';
import { LinkRow, RadioRow, Section, SwitchRow } from '@/components/settings-rows';
import { type Language, LANGUAGE_NAMES, LANGUAGES, useT } from '@/i18n';
import type { Settings as GameSettings } from '@/storage/progress-db';
import { colors, fonts, radii, spacing } from '@/theme';
import { isValidUsername, USERNAME_MAX, USERNAME_MIN } from '@/utils/username';
import { levelOptions, wordTypeOptions } from '@/vocabulary/levels';

type Props = {
  language: Language;
  username: string;
  showTutorial: boolean;
  settings: GameSettings;
  // Called with the trimmed name, only when it is valid.
  onLanguageChange: (language: Language) => void;
  onSaveUsername: (name: string) => void;
  onShowTutorialChange: (show: boolean) => void;
  onViewTutorial: () => void;
  onSettingsChange: (changes: Partial<GameSettings>) => void;
  // Clears the swipe log only.
  onResetProgress: () => Promise<void>;
};

type ResetState = 'idle' | 'armed' | 'done' | 'failed';

// The Settings tab (docs/design/swipe-game-ui/README.md, "Settings tab"). Every change is saved at
// once through the callbacks; the screen keeps the values it shows.
export function Settings({
  language,
  username,
  showTutorial: initialShowTutorial,
  settings: initialSettings,
  onLanguageChange,
  onSaveUsername,
  onShowTutorialChange,
  onViewTutorial,
  onSettingsChange,
  onResetProgress,
}: Props) {
  const t = useT();
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
        {t.settings.title}
      </Text>

      {/* Each language is named in itself, so a wrong choice is easy to undo. */}
      <Section label={t.settings.language}>
        {LANGUAGES.map((id) => (
          <RadioRow
            key={id}
            label={LANGUAGE_NAMES[id]}
            selected={language === id}
            onPress={() => onLanguageChange(id)}
          />
        ))}
      </Section>

      <Section label={t.settings.profile}>
        <View style={styles.profile}>
          <Text style={styles.fieldLabel}>{t.common.username}</Text>
          <TextInput
            accessibilityLabel={t.common.username}
            value={name}
            onChangeText={setName}
            onBlur={saveName}
            onSubmitEditing={saveName}
            maxLength={USERNAME_MAX}
            placeholder={t.common.username}
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            style={[styles.input, !nameValid && styles.inputError]}
          />
          <Text style={[styles.note, !nameValid && styles.noteError]}>
            {nameValid ? t.settings.nameSaved : t.settings.nameRule(USERNAME_MIN, USERNAME_MAX)}
          </Text>
        </View>
      </Section>

      <Section label={t.settings.tutorial}>
        <SwitchRow
          label={t.settings.showTutorial}
          detail={t.settings.showTutorialDetail}
          value={showTutorial}
          onValueChange={(show) => {
            setShowTutorial(show);
            onShowTutorialChange(show);
          }}
        />
        <LinkRow label={t.settings.viewTutorial} onPress={onViewTutorial} />
      </Section>

      <Section label={t.settings.level}>
        {levelOptions(t).map(({ id, label, detail }) => (
          <RadioRow
            key={id}
            label={label}
            detail={detail}
            selected={settings.level === id}
            onPress={() => change({ level: id })}
          />
        ))}
      </Section>

      <Section label={t.settings.wordType}>
        {wordTypeOptions(t).map(({ id, label, detail }) => (
          <RadioRow
            key={id}
            label={label}
            detail={detail}
            selected={settings.wordType === id}
            onPress={() => change({ wordType: id })}
          />
        ))}
      </Section>

      <Section label={t.settings.batch}>
        <SwitchRow
          label={t.common.includeLower}
          detail={isFull ? t.settings.lowerNotWithFull : t.settings.lowerDetail}
          value={settings.includeLower && !isFull}
          disabled={isFull}
          onValueChange={(includeLower) => change({ includeLower })}
        />
        <SwitchRow
          label={t.settings.includeKnown}
          detail={t.settings.includeKnownDetail}
          value={settings.includeKnown}
          onValueChange={(includeKnown) => change({ includeKnown })}
        />
      </Section>

      <Section label={t.settings.about}>
        <LinkRow label={t.settings.credits} onPress={() => setCreditsOpen(true)} />
        <LinkRow label={t.settings.reset[reset]} tone="danger" onPress={pressReset} />
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
