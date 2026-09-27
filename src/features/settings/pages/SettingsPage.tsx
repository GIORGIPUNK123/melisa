import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserT } from '../../../types';
import { api } from '../../../api/instance';
import { Loading } from '../../../components/Loading';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCurrentUserProfile } from '../../friends/hooks/useCurrentUserProfile';
import { passwordError } from '../../auth/passwordPolicy';
import {
  IconArrowLeft,
  IconEyeOff,
  IconLock,
  IconUser,
} from '../../../atoms/Icon';
import { TextInput } from '../../../atoms/TextInput';

const secondaryButtonClassName =
  'inline-flex h-11 w-auto items-center justify-center rounded-xl border border-slate-700 px-4 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50';
const primaryButtonClassName =
  'inline-flex h-11 w-auto items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50';

export const SettingsPage = () => {
  const { user, changeEncryptionPassword } = useAuth();
  const navigate = useNavigate();
  const authenticatedUser = user && user !== 'loading' ? user : null;
  const userId = authenticatedUser?.id;
  const { profile, setProfile } = useCurrentUserProfile(userId);
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
    if (!profile) return;
    setUsername(profile.username || '');
    setNickname(profile.nickname || '');
    setEmail(profile.email || authenticatedUser?.email || '');
    setAvatarUrl(profile.avatar_url || '');
    setAppearOffline(!!profile.appear_offline);
    setPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setMessage(null);
  }, [profile, authenticatedUser?.email]);

  const handleSave = async () => {
    if (!profile || !authenticatedUser) return;
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

      if (username !== profile.username) payload.username = username;
      if (nickname !== profile.nickname) payload.nickname = nickname;
      if (avatarUrl !== (profile.avatar_url || '')) {
        payload.avatarUrl = avatarUrl || null;
      }
      if (appearOffline !== !!profile.appear_offline) {
        payload.appearOffline = appearOffline;
      }
      if (email && email !== authenticatedUser.email) payload.email = email;

      if (Object.keys(payload).length > 0) {
        const response = await api.put('/friends/settings', payload);

        if (response.data.user) {
          setProfile(response.data.user as UserT);
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

  if (user === 'loading') return <Loading />;
  if (!user) return <Navigate to='/login' replace />;

  if (!profile) {
    return (
      <div className='flex items-center justify-center h-full p-6 bg-slate-950 text-slate-300'>
        <div className='w-full max-w-md p-6 text-center border rounded-2xl border-slate-700/50 bg-slate-900'>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className='relative h-full min-w-0 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
      <div className='fixed z-10 flex items-center justify-between w-full px-4 py-3 border-b-2 border-solid from-slate-950 via-slate-900 to-slate-950 bg-gradient-to-br border-slate-800/50 backdrop-blur'>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='flex items-center justify-center w-8 h-8 transition border rounded-md shadow-lg border-slate-700/80 bg-slate-900/90 text-slate-300 backdrop-blur hover:border-slate-600 hover:bg-slate-800 hover:text-white'
          aria-label='Back to chats'
          title='Back to chats'
        >
          <IconArrowLeft size={18} />
        </button>
        <h2 className='text-xl font-semibold tracking-tight text-white'>
          Settings
        </h2>
        <div className='w-8 h-8'></div>
      </div>
      <div className='w-full max-w-3xl min-w-0 min-h-full px-4 pb-6 mx-auto pt-14 sm:px-8 sm:pb-10 sm:pt-12'>
        <div className='min-w-0 py-6 space-y-8 sm:py-8'>
          <section className='min-w-0 border-b border-slate-800'>
            <div className='flex items-center gap-2 mb-4 text-slate-300'>
              <div className='flex items-center justify-center w-12 h-12 text-indigo-300 rounded-lg bg-indigo-500/10'>
                <IconUser size={32} />
              </div>
              <div>
                <h3 className='text-sm font-semibold text-white'>Profile</h3>
                <p className='text-xs text-slate-500'>
                  How other people see you
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 sm:gap-4'>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt='Avatar'
                  className='flex-shrink-0 object-cover border rounded-full h-14 w-14 border-slate-700'
                />
              ) : (
                <div className='flex items-center justify-center flex-shrink-0 text-base font-semibold border rounded-full h-14 w-14 border-slate-700 bg-slate-800 text-slate-100'>
                  {fallbackInitial}
                </div>
              )}
              <div className='flex w-full min-w-0 pb-4'>
                <TextInput
                  label='Avatar URL'
                  type='url'
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder='https://...'
                  required={false}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 mt-2 sm:grid-cols-2'>
              <div className='min-w-0'>
                <TextInput
                  label='Username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='Username'
                  required={false}
                />
              </div>
              <div className='min-w-0'>
                <TextInput
                  label='Nickname'
                  type='text'
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder='Nickname'
                  required={false}
                />
              </div>
            </div>
          </section>

          <section className='min-w-0 border-b border-slate-800'>
            <div>
              <div className='flex items-center gap-2 mb-4 text-slate-300'>
                <div className='flex items-center justify-center w-12 h-12 text-indigo-300 rounded-lg bg-indigo-500/10'>
                  <IconLock size={28} />
                </div>
                <div>
                  <h3 className='text-sm font-semibold text-white'>
                    Account & security
                  </h3>
                  <p className='text-xs text-slate-500'>
                    Keep your account and private chats protected
                  </p>
                </div>
              </div>
            </div>
            <div className='space-y-4'>
              <div className='min-w-0'>
                <TextInput
                  label='Email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email'
                  required={false}
                />
              </div>
              <div className='grid grid-cols-1 gap-3'>
                <div className='min-w-0'>
                  <TextInput
                    label='Current password'
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder='Password'
                    required={false}
                  />
                </div>
                <div className='min-w-0'>
                  <TextInput
                    label='New password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Password'
                    required={false}
                  />
                </div>
                <div className='min-w-0'>
                  <TextInput
                    label='Confirm password'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm password'
                    required={false}
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

          <section className='flex items-center justify-between gap-4'>
            <div className='flex items-center min-w-0 gap-3'>
              <div className='flex items-center justify-center flex-shrink-0 w-12 h-12 border rounded-lg border-slate-700 bg-slate-800/70 text-slate-400'>
                <IconEyeOff size={32} />
              </div>
              <div className='min-w-0'>
                <div className='text-sm font-medium text-white'>
                  Appear offline
                </div>
                <div className='text-xs leading-relaxed text-slate-500'>
                  Hide your online presence from other users.
                </div>
              </div>
            </div>
            <label className='inline-flex items-center flex-shrink-0 cursor-pointer'>
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

        <div className='flex gap-3 border-t border-slate-800 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:justify-end'>
          <button
            onClick={() => navigate('/')}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || password !== confirmPassword}
            className={primaryButtonClassName}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
