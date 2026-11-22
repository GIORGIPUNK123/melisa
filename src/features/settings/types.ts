export type SettingsTabT = 'profile' | 'account' | 'notifications' | 'appearance';

export type ProfileFormValues = {
  username: string;
  nickname: string;
  email: string;
  avatarPath: string;
};

export type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type PrivacyFormValues = {
  appearOffline: boolean;
};
