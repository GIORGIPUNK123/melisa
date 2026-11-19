import * as yup from 'yup';
import { usernameExists } from '../services/authService';

/**
 * Username rules shared by registration and settings.
 * The availability check is skipped when the value is the user's current
 * username, and a failed request is reported instead of failing open.
 */
export const usernameField = (currentUsername?: string) =>
  yup
    .string()
    .trim()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .test(
      'username-available',
      'Username already taken',
      async function (value) {
        if (!value) return true;
        if (
          currentUsername &&
          value.toLowerCase() === currentUsername.toLowerCase()
        ) {
          return true;
        }

        try {
          return !(await usernameExists(value));
        } catch {
          return this.createError({
            message: 'Could not verify username. Try again.',
          });
        }
      },
    );
