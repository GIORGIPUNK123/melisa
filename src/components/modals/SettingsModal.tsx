import { useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../db/supabase';
import { UserT } from '../../types';
import { api } from '../../functions/instance';

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

  if (!props.isOpen) return null;

  if (!props.profile) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
        <div className='w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 text-center text-slate-300'>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/70 via-slate-900/70 to-black/70 backdrop-blur-sm p-4'>
      <div className='w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl'>
        <div className='h-1 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500' />
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-800'>
          <div>
            <h2 className='text-xl font-semibold text-white'>Settings</h2>
            <p className='text-xs text-slate-400'>
              Personalize your profile and privacy.
            </p>
          </div>
          <button
            onClick={props.onClose}
            className='text-slate-400 hover:text-white'
            aria-label='Close settings'
          >
            ✕
          </button>
        </div>

        <div className='p-6 space-y-6'>
          <div className='rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-5'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-sm font-semibold uppercase tracking-wider text-slate-400'>
                Profile
              </h3>
            </div>
            <div className='flex flex-col gap-4 md:flex-row md:items-center'>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt='Avatar'
                  className='h-16 w-16 rounded-full object-cover border border-slate-700'
                />
              ) : (
                <div className='h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl'>
                  {fallbackInitial}
                </div>
              )}
              <div className='flex-1'>
                <label className='block text-sm text-slate-400 mb-1'>
                  Avatar URL
                </label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder='https://...'
                  className='w-full rounded-lg bg-slate-800/70 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
              </div>
            </div>

            <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-slate-400 mb-1'>
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='w-full rounded-lg bg-slate-800/70 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
              </div>
              <div>
                <label className='block text-sm text-slate-400 mb-1'>
                  Nickname
                </label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className='w-full rounded-lg bg-slate-800/70 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='rounded-2xl border border-slate-800 bg-slate-900/80 p-5'>
              <h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400'>
                Account
              </h3>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm text-slate-400 mb-1'>
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type='email'
                    className='w-full rounded-lg bg-slate-800/70 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
                <div>
                  <label className='block text-sm text-slate-400 mb-1'>
                    New Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type='password'
                    placeholder='Leave blank to keep current'
                    className='w-full rounded-lg bg-slate-800/70 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-800 bg-slate-900/80 p-5'>
              <h3 className='mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400'>
                Presence
              </h3>
              <div className='flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-4'>
                <div>
                  <div className='text-sm font-semibold text-white'>
                    Appear offline
                  </div>
                  <div className='text-xs text-slate-400'>
                    Others will always see you as offline.
                  </div>
                </div>
                <label className='inline-flex cursor-pointer items-center'>
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
            <div className='text-sm text-center text-slate-200 bg-slate-800 border border-slate-700 rounded-lg py-2'>
              {message}
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700'>
          <button
            onClick={props.onClose}
            className='px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50'
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
