import { supabase } from '../../../db/supabase';
import type { AccentT, TextSizeT } from '../../../store/usePreferencesStore';

export type PreferencesPatch = {
  accent?: AccentT;
  textSize?: TextSizeT;
  notificationSoundsMuted?: boolean;
};

type PreferencesRow = {
  accent: AccentT;
  text_size: TextSizeT;
  notification_sounds_muted: boolean;
};

/** Reads the signed-in user's preferences. Returns null when no row exists yet. */
export const loadPreferences = async (
  userId: string,
): Promise<PreferencesPatch | null> => {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('accent, text_size, notification_sounds_muted')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load preferences:', error);
    return null;
  }
  if (!data) return null;

  const row = data as PreferencesRow;
  return {
    accent: row.accent,
    textSize: row.text_size,
    notificationSoundsMuted: row.notification_sounds_muted,
  };
};

/** Inserts or updates only the supplied fields, scoped by RLS to the user. */
export const savePreferences = async (
  userId: string,
  patch: PreferencesPatch,
): Promise<void> => {
  const row: Record<string, unknown> = { user_id: userId };
  if (patch.accent !== undefined) row.accent = patch.accent;
  if (patch.textSize !== undefined) row.text_size = patch.textSize;
  if (patch.notificationSoundsMuted !== undefined) {
    row.notification_sounds_muted = patch.notificationSoundsMuted;
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert(row, { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to save preferences:', error);
  }
};
