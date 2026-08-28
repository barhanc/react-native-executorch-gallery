import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { borderWidth, radius, spacing, useTheme } from '@/theme';
import { Icon } from '@/components/Icon';
export interface PromptInputProps {
  /** Controlled input value. */
  value: string;
  /** Callback fired when the user edits the text. */
  onChangeText: (text: string) => void;
  /** Callback fired when the user submits via send or a suggestion chip. */
  onSubmit: () => void;
  /** Optional pre-configured prompts shown as tappable chips above the bubble. */
  suggestions?: string[];
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Disables editing and the submit action. */
  disabled?: boolean;
  /** Whether submitting is currently valid (e.g. not busy, input non-empty). */
  canSubmit?: boolean;
}

/**
 * Minimal, reusable prompt input that floats above the system keyboard.
 *
 * A large rounded text field with an inline send button, pinned above the
 * keyboard via a sticky view so it stays reachable while typing. Supports
 * optional pre-configured suggestion chips that appear above the bubble. Meant
 * to be shared across prompt-driven screens (LLM chat, text-to-image, privacy
 * filter, and so on).
 *
 * @param props Controlled value, edit/submit callbacks, suggestions, and state flags.
 * @returns A keyboard-aware prompt bar with optional suggestions.
 */
export function PromptInput({
  value,
  onChangeText,
  onSubmit,
  suggestions,
  placeholder = 'Type a message…',
  disabled = false,
  canSubmit = false,
}: PromptInputProps) {
  const { colors } = useTheme();

  const active = canSubmit && !disabled;

  const submit = () => {
    if (active && onSubmit) onSubmit();
  };

  return (
    <View style={styles.sticky}>
      <View style={styles.wrapper}>
        {suggestions && suggestions.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestions}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => onChangeText(suggestion)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            editable={!disabled}
            multiline
            onSubmitEditing={submit}
            returnKeyType="send"
          />
          <Pressable
            onPress={submit}
            disabled={!active}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: active ? colors.accent : colors.surfaceSubtle },
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            {disabled ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Icon name="arrowUp" size={20} color={active ? colors.onAccent : colors.textMuted} />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sticky: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  wrapper: {
    gap: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    height: 88,
    paddingVertical: spacing.xs + 2,
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  chip: {
    width: 160,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
