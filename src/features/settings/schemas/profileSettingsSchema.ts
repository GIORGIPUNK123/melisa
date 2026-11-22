import * as yup from 'yup';
import { usernameField } from '../../auth/schemas/usernameField';

export const createProfileSettingsSchema = (currentUsername: string) =>
  yup.object({
    username: usernameField(currentUsername),
    nickname: yup
      .string()
      .trim()
      .required('Nickname is required')
      .min(2, 'Nickname must be at least 2 characters')
      .max(100, 'Nickname must be at most 100 characters'),
    email: yup
      .string()
      .trim()
      .required('Email is required')
      .email('Enter a valid email address'),
  });
