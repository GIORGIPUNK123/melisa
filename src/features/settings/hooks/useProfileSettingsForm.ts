import { useEffect, useState } from 'react';
import { useForm } from '../../../shared/hooks/useForm';
import {
  clearAvatarUrlCache,
  deleteAvatarObject,
  uploadAvatar,
  validateAvatarFile,
} from '../../../shared/utils/avatars';
import type { UserT } from '../../../types';
import { createProfileSettingsSchema } from '../schemas/profileSettingsSchema';
import {
  getApiErrorData,
  updateSettings,
  type SettingsUser,
  type UpdateSettingsPayload,
} from '../services/settingsService';
import type { ProfileFormValues } from '../types';

// Backend email updates are disabled until both the auth email and the users
// table can be changed together, so never send this field from the client.
const EMAIL_UPDATES_ENABLED = false;

const toFormValues = (
  profile: UserT,
  fallbackEmail?: string | null,
): ProfileFormValues => ({
  username: profile.username ?? '',
  nickname: profile.nickname ?? '',
  email: profile.email || fallbackEmail || '',
  avatarPath: profile.avatar_url || '',
});

const buildPayload = (
  values: ProfileFormValues,
  baseline: ProfileFormValues,
): UpdateSettingsPayload => {
  const payload: UpdateSettingsPayload = {};
  const username = values.username.trim();
  const nickname = values.nickname.trim();
  const email = values.email.trim();
  const currentUsername = baseline.username.trim();
  const currentNickname = baseline.nickname.trim();
  const currentEmail = baseline.email.trim();

  if (username !== currentUsername) payload.username = username;
  if (nickname !== currentNickname) payload.nickname = nickname;
  if (EMAIL_UPDATES_ENABLED && email !== currentEmail) payload.email = email;

  return payload;
};

const errorMessage = (error: unknown): string => {
  const data = getApiErrorData(error);
  return (
    data?.error ||
    (error instanceof Error ? error.message : 'Failed to update profile photo')
  );
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
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [removeRequested, setRemoveRequested] = useState(false);

  const hasAvatarChange = Boolean(selectedFile || removeRequested);

  useEffect(
    () => () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    },
    [avatarPreviewUrl],
  );

  const clearStagedAvatar = () => {
    setSelectedFile(null);
    setAvatarPreviewUrl(null);
    setRemoveRequested(false);
  };

  const form = useForm<ProfileFormValues>({
    initialValues: toFormValues(profile, fallbackEmail),
    schema: createProfileSettingsSchema(profile.username),
    onSubmit: async (
      values,
      { baseline, setFieldError, setFormError, reset },
    ) => {
      setSuccessMessage(null);
      setAvatarError(null);

      const payload = buildPayload(values, baseline);
      const currentAvatarPath = values.avatarPath.trim();
      const shouldUpload = Boolean(selectedFile);
      const shouldRemove = removeRequested && !selectedFile;

      if (
        Object.keys(payload).length === 0 &&
        !shouldUpload &&
        !shouldRemove
      ) {
        reset(toFormValues(profile, fallbackEmail));
        clearStagedAvatar();
        return;
      }

      let uploadedPath: string | null = null;

      try {
        if (selectedFile) {
          uploadedPath = await uploadAvatar(profile.id, selectedFile);
        }

        const avatarUpdate = shouldUpload
          ? { avatarUrl: uploadedPath }
          : shouldRemove
            ? { avatarUrl: null }
            : {};

        const updated = await updateSettings({ ...payload, ...avatarUpdate });

        if (shouldUpload && uploadedPath) {
          clearAvatarUrlCache(uploadedPath);
        }
        if (shouldRemove && currentAvatarPath) {
          clearAvatarUrlCache(currentAvatarPath);
        }

        const nextAvatarPath = shouldRemove
          ? ''
          : (updated?.avatar_url ?? uploadedPath ?? currentAvatarPath);
        const nextProfile: UserT = {
          ...profile,
          ...(updated ?? {}),
          avatar_url: nextAvatarPath,
        };

        reset(toFormValues(nextProfile, fallbackEmail));
        clearStagedAvatar();

        if (updated) onSaved?.(updated);

        setSuccessMessage(
          shouldUpload
            ? 'Profile photo updated'
            : shouldRemove
              ? 'Profile photo removed'
              : 'Profile updated successfully',
        );

        if (shouldRemove && currentAvatarPath) {
          void deleteAvatarObject(currentAvatarPath, profile.id).catch(
            (error) => {
              console.warn('Could not delete previous avatar:', error);
            },
          );
        }
      } catch (error) {
        // Only remove the object when there was no existing avatar. If the user
        // had one, the failed save still left the newest image at the shared path.
        if (uploadedPath && !currentAvatarPath) {
          void deleteAvatarObject(uploadedPath, profile.id).catch(
            (cleanupError) => {
              console.warn('Could not delete unused avatar:', cleanupError);
            },
          );
        }

        const data = getApiErrorData(error);
        const field = data?.field;

        if (field === 'avatarUrl' || field === 'avatarPath') {
          setAvatarError(data?.error ?? errorMessage(error));
        } else if (field && field in values) {
          setFieldError(
            field as keyof ProfileFormValues,
            data?.error ?? 'Invalid value',
          );
        } else {
          setFormError(errorMessage(error));
        }
      }
    },
  });

  const selectAvatarFile = (file: File) => {
    setAvatarError(null);
    setSuccessMessage(null);

    try {
      validateAvatarFile(file);
    } catch (error) {
      setAvatarError(errorMessage(error));
      return;
    }

    setRemoveRequested(false);
    setSelectedFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const requestAvatarRemoval = () => {
    setAvatarError(null);
    setSuccessMessage(null);
    setSelectedFile(null);
    setAvatarPreviewUrl(null);
    setRemoveRequested(true);
  };

  const cancelAvatarChange = () => {
    setAvatarError(null);
    clearStagedAvatar();
  };

  const resetForm = (nextValues?: ProfileFormValues) => {
    form.reset(nextValues);
    setAvatarError(null);
    setSuccessMessage(null);
    clearStagedAvatar();
  };

  return {
    ...form,
    reset: resetForm,
    isDirty: form.isDirty || hasAvatarChange,
    successMessage,
    avatarError,
    avatarPreviewUrl,
    hasAvatarChange,
    removeRequested,
    selectAvatarFile,
    requestAvatarRemoval,
    cancelAvatarChange,
  };
};
