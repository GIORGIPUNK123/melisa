import { useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../db/supabase';
import { UserT } from '../../types';
import { api } from '../../api/instance';
import { handleBackdropClick } from '../../shared/utils/modal';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const SettingsModal = (props: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profile: UserT | null;
  onProfileUpdated: (profile: UserT) => void;
}) => {
  const { changeEncryptionPassword } = useAuth();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
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
    setPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setMessage(null);
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

      if (password || confirmPassword || currentPassword) {
        if (!currentPassword) {
          setMessage('Enter your current password to set a new one');
          setIsSaving(false);
          return;
        }
        if (!password) {
          setMessage('Enter a new password');
          setIsSaving(false);
          return;
        }
        if (password !== confirmPassword) {
          setMessage('New passwords do not match');
          setIsSaving(false);
          return;
        }
        if (password.length < 6) {
          setMessage('New password must be at least 6 characters');
          setIsSaving(false);
          return;
        }

        const result = await changeEncryptionPassword(
          currentPassword,
          password,
        );
        if (!result.ok) {
          setMessage(result.error || 'Failed to update password');
          setIsSaving(false);
          return;
        }
      }

      const payload: Record<string, unknown> = {};

      if (username !== props.profile.username) payload.username = username;
      if (nickname !== props.profile.nickname) payload.nickname = nickname;
      if (avatarUrl !== (props.profile.avatar_url || '')) {
        payload.avatarUrl = avatarUrl || null;
      }
      if (appearOffline !== !!props.profile.appear_offline) {
        payload.appearOffline = appearOffline;
      }
      if (email && email !== props.user.email) payload.email = email;

      if (Object.keys(payload).length > 0) {
        const response = await api.put('/friends/settings', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.user) {
          props.onProfileUpdated(response.data.user as UserT);
        }
      }

      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setMessage(
        password
          ? 'Password and encryption key updated successfully'
          : 'Settings updated successfully',
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Failed to update settings';
      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClassName =
    'w-full min-w-0 rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:rounded-lg sm:px-3 sm:py-2';
  const labelClassName =
    'mb-0.5 block text-[10px] leading-tight text-slate-400 sm:mb-1 sm:text-xs';

  if (!props.isOpen) return null;

  if (!props.profile) {
    return (
      <div
        className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
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
      className='fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='flex max-h-[68dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl border-slate-700/60 bg-slate-900 sm:max-h-[90vh] sm:rounded-2xl sm:border'>
        <div className='flex flex-shrink-0 items-center justify-between border-b border-slate-800 px-3 py-1.5 sm:px-6 sm:py-4'>
          <h2 className='text-sm font-semibold text-white sm:text-xl'>
            Settings
          </h2>
          <button
            onClick={props.onClose}
            className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white sm:h-10 sm:w-10'
            aria-label='Close settings'
          >
            ✕
          </button>
        </div>

        <div className='min-h-0 space-y-1.5 overflow-y-auto overscroll-contain px-3 py-1.5 sm:space-y-6 sm:p-6'>
          <section>
            <h3 className='mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:mb-4 sm:text-sm'>
              Profile
            </h3>
            <div className='flex items-center gap-2 sm:gap-4'>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt='Avatar'
                  className='h-8 w-8 flex-shrink-0 rounded-full border border-slate-700 object-cover sm:h-16 sm:w-16'
                />
              ) : (
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-500 text-xs font-bold text-white sm:h-16 sm:w-16 sm:text-xl'>
                  {fallbackInitial}
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <label className={labelClassName}>Avatar URL</label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder='https://...'
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className='mt-1.5 grid grid-cols-2 gap-1.5 sm:mt-5 sm:gap-4'>
              <div className='min-w-0'>
                <label className={labelClassName}>Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={fieldClassName}
                />
              </div>
              <div className='min-w-0'>
                <label className={labelClassName}>Nickname</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={fieldClassName}
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className='mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:mb-4 sm:text-sm'>
              Account
            </h3>
            <div className='space-y-1.5 sm:space-y-4'>
              <div className='min-w-0'>
                <label className={labelClassName}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type='email'
                  className={fieldClassName}
                />
              </div>
              <div className='grid grid-cols-1 gap-1.5 sm:grid-cols-3 sm:gap-3'>
                <div className='min-w-0'>
                  <label className={labelClassName}>Current password</label>
                  <input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    type='password'
                    placeholder='Current'
                    className={fieldClassName}
                    autoComplete='current-password'
                  />
                </div>
                <div className='min-w-0'>
                  <label className={labelClassName}>New password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type='password'
                    placeholder='New'
                    className={fieldClassName}
                    autoComplete='new-password'
                  />
                </div>
                <div className='min-w-0'>
                  <label className={labelClassName}>Repeat new</label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type='password'
                    placeholder='Repeat'
                    className={fieldClassName}
                    autoComplete='new-password'
                  />
                  {password &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p className='mt-0.5 text-[10px] text-rose-400'>
                        Passwords do not match
                      </p>
                    )}
                </div>
              </div>
            </div>
          </section>

          <section className='flex items-center justify-between gap-2 border-t border-slate-800 pt-1.5 sm:rounded-2xl sm:border sm:border-slate-800 sm:bg-slate-900/80 sm:p-5 sm:pt-5'>
            <div className='min-w-0'>
              <div className='text-xs font-medium text-white sm:text-sm'>
                Appear offline
              </div>
              <div className='hidden text-xs text-slate-400 sm:block'>
                Others always see you offline.
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
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors sm:h-6 sm:w-11 ${
                  appearOffline ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform sm:h-5 sm:w-5 ${
                    appearOffline
                      ? 'translate-x-4 sm:translate-x-5'
                      : 'translate-x-0.5 sm:translate-x-1'
                  }`}
                />
              </span>
            </label>
          </section>

          {message && (
            <div className='rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-center text-[11px] text-slate-200 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm'>
              {message}
            </div>
          )}
        </div>

        <div className='flex flex-shrink-0 gap-2 border-t border-slate-700 px-3 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4'>
          <button
            onClick={props.onClose}
            className='w-full rounded-md px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 sm:w-auto sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-base'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || password !== confirmPassword}
            className='w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-50 sm:w-auto sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-base'
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
