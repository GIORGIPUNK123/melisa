import { useState } from 'react';
import * as yup from 'yup';
import { useForm } from '../../../shared/hooks/useForm';
import type { UserT } from '../../../types';
import {
  getApiErrorData,
  updateSettings,
  type SettingsUser,
} from '../services/settingsService';
import type { PrivacyFormValues } from '../types';

const privacySchema = yup.object({
  appearOffline: yup.boolean().required(),
});

export const usePrivacySettingsForm = (
  profile: UserT,
  onSaved?: (user: SettingsUser) => void,
) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<PrivacyFormValues>({
    initialValues: { appearOffline: !!profile.appear_offline },
    schema: privacySchema,
    onSubmit: async (values, { setFormError, reset }) => {
      setSuccessMessage(null);

      try {
        const updated = await updateSettings({
          appearOffline: values.appearOffline,
        });

        reset({ appearOffline: values.appearOffline });
        if (updated) onSaved?.(updated);
        setSuccessMessage('Privacy settings updated');
      } catch (error) {
        const data = getApiErrorData(error);
        setFormError(data?.error ?? 'Failed to update privacy settings');
      }
    },
  });

  return { ...form, successMessage };
};
