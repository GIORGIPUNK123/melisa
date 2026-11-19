import { useState } from 'react';
import { useForm } from '../../../shared/hooks/useForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { passwordSettingsSchema } from '../schemas/passwordSettingsSchema';
import type { PasswordFormValues } from '../types';

const EMPTY_PASSWORD_VALUES: PasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const usePasswordSettingsForm = () => {
  const { changeEncryptionPassword } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<PasswordFormValues>({
    initialValues: EMPTY_PASSWORD_VALUES,
    schema: passwordSettingsSchema,
    onSubmit: async (values, { setFieldError, setFormError, reset }) => {
      setSuccessMessage(null);

      if (
        !values.currentPassword &&
        !values.newPassword &&
        !values.confirmPassword
      ) {
        return;
      }

      const result = await changeEncryptionPassword(
        values.currentPassword,
        values.newPassword,
      );

      if (!result.ok) {
        const message = result.error || 'Failed to update password';

        if (
          result.field === 'password' &&
          (result.code === 'WEAK_PASSWORD' ||
            result.code === 'PASSWORD_UPDATE_FAILED')
        ) {
          setFieldError('newPassword', message);
        } else if (/wrong password/i.test(message)) {
          setFieldError('currentPassword', 'Wrong password');
        } else {
          setFormError(message);
        }
        return;
      }

      reset(EMPTY_PASSWORD_VALUES);
      setSuccessMessage('Password and encryption key updated successfully');
    },
  });

  return { ...form, successMessage };
};
