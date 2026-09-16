import { useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../db/supabase';
import { UserT } from '../../types';
import { api } from '../../api/instance';
import { handleBackdropClick } from '../../shared/utils/modal';

export const SettingsModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profile: UserT | null;
  onProfileUpdated: (profile: UserT) => void;
}) => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [appearOffline, setAppearOffline] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fallbackInitial = useMemo(() => {
    const base = nickname || username || email || 'U';
    return base.trim().charAt(0).toUpperCase();
  }, [nickname, username, email]);

  useEffect(() => {
    if (!props.profile) return;
    setUsername(props.profile.username || '');
    setNickname(props.profile.nickname || '');
    setEmail(props.profile.email || props.user.email || '');
    setAvatarUrl(props.profile.avatar_url || '');
    setAppearOffline(!!props.profile.appear_offline);
  }, [props.profile, props.user.email, props.isOpen]);

  const handleSave = async () => {
    if (!props.profile) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setMessage('Not authenticated');
        setIsSaving(false);
        return;
      }

      const payload: any = {};

      if (username !== props.profile.username) payload.username = username;
      if (nickname !== props.profile.nickname) payload.nickname = nickname;
      if (avatarUrl !== (props.profile.avatar_url || '')) {
        payload.avatarUrl = avatarUrl || null;
      }
      if (appearOffline !== !!props.profile.appear_offline) {
        payload.appearOffline = appearOffline;
      }
      if (email && email !== props.user.email) payload.email = email;
      if (password) payload.password = password;

      const response = await api.put('/friends/settings', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.user) {
        props.onProfileUpdated(response.data.user as UserT);
      }

      setPassword('');
      setMessage(response.data.message || 'Settings updated successfully');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Failed to update settings';
      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClassName =
    'w-full min-w-0 rounded-lg bg-slate-800/70 border border-slate-700 text-white px-3 py-2.5 text-base sm:px-4 sm:py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  if (!props.isOpen) return null;

  if (!props.profile) {
    return (
      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
        onClick={(event) => handleBackdropClick(event, props.onClose)}
      >
        <div className='w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 text-center text-slate-300'>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden border-slate-700/60 bg-slate-900 sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border'>
        <div className='h-1 w-full flex-shrink-0 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500' />
        <div className='flex flex-shrink-0 items-start justify-between gap-3 border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4'>
          <div className='min-w-0'>
            <h2 className='text-lg font-semibold text-white sm:text-xl'>
              Settings
            </h2>
            <p className='text-xs text-slate-400'>
              Personalize your profile and privacy.
            </p>
          </div>
          <button
            onClick={props.onClose}
            className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white'
            aria-label='Close settings'
          >
            ✕
          </button>
        </div>

        <div className='min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:space-y-6 sm:p-6'>
          <div className='rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 sm:p-5'>
            <h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400'>
              Profile
            </h3>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt='Avatar'
                  className='h-16 w-16 flex-shrink-0 rounded-full object-cover border border-slate-700'
                />
              ) : (
                <div className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-500 text-xl font-bold text-white'>
                  {fallbackInitial}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <label className='mb-1 block text-sm text-slate-400'>
                  Avatar URL
                </label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder='https://...'
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='min-w-0'>
                <label className='mb-1 block text-sm text-slate-400'>
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div className='min-w-0'>
                <label className='mb-1 block text-sm text-slate-400'>
                  Nickname
                </label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5'>
              <h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400'>
                Account
              </h3>
              <div className='space-y-4'>
                <div className='min-w-0'>
                  <label className='mb-1 block text-sm text-slate-400'>
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type='email'
                    className={fieldClassName}
                  />
                </div>
                <div className='min-w-0'>
                  <label className='mb-1 block text-sm text-slate-400'>
                    New Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type='password'
                    placeholder='Leave blank to keep current'
                    className={fieldClassName}
                  />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5'>
              <h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400'>
                Presence
              </h3>
              <div className='flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3 sm:px-4 sm:py-4'>
                <div className='min-w-0'>
                  <div className='text-sm font-semibold text-white'>
                    Appear offline
                  </div>
                  <div className='text-xs text-slate-400'>
                    Others will always see you as offline.
                  </div>
                </div>
                <label className='inline-flex flex-shrink-0 cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    className='sr-only'
                    checked={appearOffline}
                    onChange={(e) => setAppearOffline(e.target.checked)}
                  />
                  <span
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      appearOffline ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        appearOffline ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </span>
                </label>
              </div>
            </div>
          </div>

          {message && (
            <div className='rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-sm text-slate-200'>
              {message}
            </div>
          )}
        </div>

        <div className='flex flex-shrink-0 flex-col-reverse gap-2 border-t border-slate-700 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4'>
          <button
            onClick={props.onClose}
            className='w-full rounded-lg px-4 py-2.5 text-slate-300 hover:bg-slate-800 sm:w-auto'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-500 disabled:opacity-50 sm:w-auto'
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
