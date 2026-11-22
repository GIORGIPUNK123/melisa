import type { AxiosError } from 'axios';
import { api } from '../../../api/instance';
import type { UserT } from '../../../types';

export type SettingsUser = Pick<
  UserT,
  | 'id'
  | 'username'
  | 'nickname'
  | 'email'
  | 'avatar_url'
  | 'status'
  | 'appear_offline'
  | 'created_at'
>;

export type UpdateSettingsPayload = {
  username?: string;
  nickname?: string;
  avatarUrl?: string | null;
  email?: string;
  appearOffline?: boolean;
};

export type ApiErrorData = {
  error?: string;
  code?: string;
  field?: string;
};

export const updateSettings = async (
  payload: UpdateSettingsPayload,
): Promise<SettingsUser | null> => {
  const response = await api.put<{ user?: SettingsUser }>(
    '/settings',
    payload,
  );

  return response.data.user ?? null;
};

export const getApiErrorData = (error: unknown): ApiErrorData | null => {
  const response = (error as AxiosError<ApiErrorData>)?.response;
  return response?.data ?? null;
};
