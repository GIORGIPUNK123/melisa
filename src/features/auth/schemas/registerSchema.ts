import * as yup from 'yup';
import { checkUsername } from '../../friends/api/checkUsername';
import { passwordError, passwordRuleMessage } from '../passwordPolicy';

export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .test('username-available', 'Username is already taken', async (value) => {
      if (!value) return true;
      const exists = await checkUsername(value);
      return !exists;
    }),
  nickname: yup
    .string()
    .required('Nickname is required')
    .min(2, 'Nickname must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  password: yup
    .string()
    .required('Password is required')
    .test('password-rule', passwordRuleMessage, (value) => {
      if (!value) return true;
      return passwordError(value) === null;
    }),
  repeatPassword: yup
    .string()
    .required('Please repeat your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});
