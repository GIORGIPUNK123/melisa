import { useState } from 'react';
import { useForm } from '../../../shared/hooks/useForm';
import type { UserT } from '../../../types';
import { createProfileSettingsSchema } from '../schemas/profileSettingsSchema';
import {
  getApiErrorData,
  updateSettings,
  type SettingsUser,
  type UpdateSettingsPayload,
} from '../services/settingsService';
import type { ProfileFormValues } from '../types';

const toFormValues = (
  profile: UserT,
  fallbackEmail?: string | null,
): ProfileFormValues => ({
  username: profile.username ?? '',
  nickname: profile.nickname ?? '',
  email: profile.email || fallbackEmail || '',
  avatarUrl: profile.avatar_url || '',
});

const buildPayload = (
  values: ProfileFormValues,
  baseline: ProfileFormValues,
): UpdateSettingsPayload => {
  const payload: UpdateSettingsPayload = {};
  const username = values.username.trim();
  const nickname = values.nickname.trim();
  const email = values.email.trim();
  const avatarUrl = values.avatarUrl.trim();
  const currentUsername = baseline.username.trim();
  const currentNickname = baseline.nickname.trim();
  const currentEmail = baseline.email.trim();
  const currentAvatarUrl = baseline.avatarUrl.trim();

  if (username !== currentUsername) payload.username = username;
  if (nickname !== currentNickname) payload.nickname = nickname;
  if (email !== currentEmail) payload.email = email;
  if (avatarUrl !== currentAvatarUrl) {
    payload.avatarUrl = avatarUrl || null;
  }

  return payload;
};

type Params = {
  profile: UserT;
  fallbackEmail?: string | null;
  onSaved?: (user: SettingsUser) => void;
};

export const useProfileSettingsForm = ({
  profile,
  fallbackEmail,
  onSaved,
}: Params) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    initialValues: toFormValues(profile, fallbackEmail),
    schema: createProfileSettingsSchema(profile.username),
    onSubmit: async (
      values,
      { baseline, setFieldError, setFormError, reset },
    ) => {
      setSuccessMessage(null);

      const payload = buildPayload(values, baseline);

      if (Object.keys(payload).length === 0) {
        reset(toFormValues(profile, fallbackEmail));
        return;
      }

      try {
        const updated = await updateSettings(payload);

        if (updated) {
          const nextProfile = { ...profile, ...updated };
          reset(toFormValues(nextProfile, fallbackEmail));
          onSaved?.(updated);
        } else {
          reset(toFormValues(profile, fallbackEmail));
        }

        setSuccessMessage('Profile updated successfully');
      } catch (error) {
        const data = getApiErrorData(error);
        const field = data?.field as keyof ProfileFormValues | undefined;

        if (field && field in values) {
          setFieldError(field, data?.error ?? 'Invalid value');
        } else {
          setFormError(data?.error ?? 'Failed to update profile');
        }
      }
    },
  });

  return { ...form, successMessage };
};
