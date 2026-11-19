import * as yup from 'yup';
import { passwordError, passwordRuleMessage } from '../passwordPolicy';
import { usernameField } from './usernameField';

export const registerSchema = yup.object().shape({
  username: usernameField(),
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
