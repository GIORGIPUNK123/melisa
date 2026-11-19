import * as yup from 'yup';
import { passwordError, passwordRuleMessage } from '../../auth/passwordPolicy';

type PasswordFields = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const anyPasswordFieldFilled = (values: PasswordFields) =>
  Boolean(
    values.currentPassword || values.newPassword || values.confirmPassword,
  );

export const passwordSettingsSchema = yup.object({
  currentPassword: yup
    .string()
    .test(
      'current-password-required',
      'Enter your current password',
      function (value) {
        return (
          !anyPasswordFieldFilled(this.parent as PasswordFields) ||
          Boolean(value)
        );
      },
    ),
  newPassword: yup
    .string()
    .test(
      'new-password-required',
      'Enter a new password',
      function (value) {
        return (
          !anyPasswordFieldFilled(this.parent as PasswordFields) ||
          Boolean(value)
        );
      },
    )
    .test('new-password-policy', passwordRuleMessage, function (value) {
      const values = this.parent as PasswordFields;
      if (!anyPasswordFieldFilled(values) || !value) return true;
      return passwordError(value) === null;
    }),
  confirmPassword: yup
    .string()
    .test(
      'confirm-password-required',
      'Confirm your new password',
      function (value) {
        return (
          !anyPasswordFieldFilled(this.parent as PasswordFields) ||
          Boolean(value)
        );
      },
    )
    .test('passwords-match', 'Passwords do not match', function (value) {
      const values = this.parent as PasswordFields;
      if (!anyPasswordFieldFilled(values) || !value) return true;
      return value === values.newPassword;
    }),
});
