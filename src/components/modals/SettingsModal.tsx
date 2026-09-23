import { useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserT } from '../../types';
import { api } from '../../api/instance';
import { handleBackdropClick } from '../../shared/utils/modal';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { passwordError } from '../../features/auth/passwordPolicy';
import { IconEyeOff, IconLock, IconUser, IconX } from '../../atoms/Icon';
import { ui } from '../../shared/ui';

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
  const [messageTone, setMessageTone] = useState<'ok' | 'error'>('ok');

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
      if (password || confirmPassword || currentPassword) {
        if (!currentPassword) {
          setMessageTone('error');
          setMessage('Enter your current password to set a new one');
          setIsSaving(false);
          return;
        }
        if (!password) {
          setMessageTone('error');
          setMessage('Enter a new password');
          setIsSaving(false);
          return;
        }
        if (password !== confirmPassword) {
          setMessageTone('error');
          setMessage('New passwords do not match');
          setIsSaving(false);
          return;
        }
        const passwordProblem = passwordError(password);
        if (passwordProblem) {
          setMessageTone('error');
          setMessage(passwordProblem);
          setIsSaving(false);
          return;
        }

        const result = await changeEncryptionPassword(
          currentPassword,
          password,
        );
        if (!result.ok) {
          setMessageTone('error');
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
        const response = await api.put('/friends/settings', payload);

        if (response.data.user) {
          props.onProfileUpdated(response.data.user as UserT);
        }
      }

      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setMessageTone('ok');
      setMessage(
        password
          ? 'Password and encryption key updated successfully'
          : 'Settings updated successfully',
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Failed to update settings';
      setMessageTone('error');
      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClassName = ui.input;
  const labelClassName = ui.label;

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
      <div className='flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border-slate-700/70 bg-slate-900 sm:max-h-[90vh] sm:rounded-2xl sm:border'>
        <div className='flex flex-shrink-0 items-center justify-between border-b border-slate-700 px-4 py-3 sm:px-6 sm:py-3.5'>
          <div className='min-w-0'>
            <h2 className={ui.title}>Settings</h2>
            <p className='mt-0.5 text-[12px] text-slate-500'>
              Manage your profile and account
            </p>
          </div>
          <button
            onClick={props.onClose}
            className={ui.iconBtn}
            aria-label='Close settings'
          >
            <IconX size={18} />
          </button>
        </div>

        <div className='min-h-0 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:space-y-6 sm:px-6 sm:py-5'>
          <section className='rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5'>
            <div className='mb-4 flex items-center gap-2 text-slate-300'>
              <IconUser size={15} />
              <h3 className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                Profile
              </h3>
            </div>

            <div className='flex items-center gap-3 sm:gap-4'>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt='Avatar'
                  className='h-12 w-12 flex-shrink-0 rounded-full border border-slate-700 object-cover sm:h-14 sm:w-14'
                />
              ) : (
                <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-100 sm:h-14 sm:w-14 sm:text-base'>
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

            <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
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

          <section className='rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5'>
            <div className='mb-4 flex items-center gap-2 text-slate-300'>
              <IconLock size={15} />
              <h3 className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
                Account & security
              </h3>
            </div>
            <div className='space-y-3'>
              <div className='min-w-0'>
                <label className={labelClassName}>Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type='email'
                  className={fieldClassName}
                />
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
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
                  <label className={labelClassName}>Confirm password</label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type='password'
                    placeholder='Confirm'
                    className={fieldClassName}
                    autoComplete='new-password'
                  />
                  {password &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p className='mt-1.5 text-xs text-rose-400'>
                        Passwords do not match
                      </p>
                    )}
                </div>
              </div>
              <p className='text-xs leading-relaxed text-slate-500'>
                Changing your password also re-encrypts your private chat key.
              </p>
            </div>
          </section>

          <section className='flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:p-5'>
            <div className='flex min-w-0 items-start gap-3'>
              <div className='mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/70 text-slate-400'>
                <IconEyeOff size={15} />
              </div>
              <div className='min-w-0'>
                <div className='text-sm font-medium text-white'>
                  Appear offline
                </div>
                <div className='mt-0.5 text-xs leading-relaxed text-slate-500'>
                  Hide your online presence from other users.
                </div>
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
                  appearOffline ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    appearOffline ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </span>
            </label>
          </section>

          {message && (
            <div
              className={`rounded-lg border px-3 py-2.5 text-center text-sm ${
                messageTone === 'error'
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        <div className='flex flex-shrink-0 gap-2 border-t border-slate-800 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:justify-end sm:gap-3 sm:px-6 sm:py-4'>
          <button
            onClick={props.onClose}
            className={`${ui.btnSecondary} sm:w-auto`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || password !== confirmPassword}
            className={`${ui.btnPrimary} sm:w-auto`}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
