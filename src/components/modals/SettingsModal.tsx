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

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
      <div className='w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-slate-700'>
          <h2 className='text-xl font-semibold text-white'>Settings</h2>
          <button
            onClick={props.onClose}
            className='text-slate-400 hover:text-white'
            aria-label='Close settings'
          >
            ✕
          </button>
        </div>

        <div className='p-6 space-y-6'>
          <div className='flex items-center gap-4'>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt='Avatar'
                className='w-16 h-16 rounded-full object-cover border border-slate-700'
              />
            ) : (
              <div className='w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl'>
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
                className='w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm text-slate-400 mb-1'>
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
            <div>
              <label className='block text-sm text-slate-400 mb-1'>
                Nickname
              </label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className='w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
            </div>
            <div>
              <label className='block text-sm text-slate-400 mb-1'>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type='email'
                className='w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
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
                className='w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
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
