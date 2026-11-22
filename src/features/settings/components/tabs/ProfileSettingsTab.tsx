import { useEffect, useRef, useState } from 'react';
import { TextInput } from '../../../../atoms/TextInput';
import { IconUser } from '../../../../atoms/Icon';
import { useAvatarUrl } from '../../../../shared/hooks/useAvatarUrl';
import type { UserT } from '../../../../types';
import { SettingsActions } from '../SettingsActions';
import { SettingsMessage } from '../SettingsMessage';
import { SettingsSection } from '../SettingsSection';
import { useProfileSettingsForm } from '../../hooks/useProfileSettingsForm';
import type { SettingsUser } from '../../services/settingsService';

// Temporarily disabled until email changes are synchronized between
// Supabase Auth and the users table.
const EMAIL_CHANGES_ENABLED = false;

type Props = {
  profile: UserT;
  fallbackEmail?: string | null;
  onSaved?: (user: SettingsUser) => void;
};

export const ProfileSettingsTab = ({
  profile,
  fallbackEmail,
  onSaved,
}: Props) => {
  const form = useProfileSettingsForm({ profile, fallbackEmail, onSaved });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedAvatarSrc = useAvatarUrl(form.values.avatarPath);
  const avatarSrc = form.avatarPreviewUrl ?? savedAvatarSrc;
  const [avatarBroken, setAvatarBroken] = useState(false);
  const busy = form.isBusy;
  const displayName = form.values.nickname.trim() || 'Your profile';
  const displayUsername = form.values.username.trim();
  const fallbackInitial = (
    form.values.nickname ||
    form.values.username ||
    form.values.email ||
    'U'
  )
    .trim()
    .charAt(0)
    .toUpperCase();
  const showAvatar = Boolean(avatarSrc) && !form.removeRequested && !avatarBroken;

  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarSrc, form.removeRequested, form.values.avatarPath]);

  return (
    <form noValidate onSubmit={form.handleSubmit}>
      <SettingsSection
        title='Profile'
        description='How others see you across Melisa.'
        icon={IconUser}
        footer={
          <SettingsActions
            onCancel={() => form.reset()}
            submitLabel='Save changes'
            isSubmitting={form.isSubmitting}
            disabled={!form.isDirty || busy}
          />
        }
      >
        <div className='flex items-center gap-3 rounded-xl border border-solid border-border bg-sidebar/60 p-3'>
          {showAvatar ? (
            <img
              src={avatarSrc ?? undefined}
              alt=''
              onError={() => setAvatarBroken(true)}
              className='h-14 w-14 shrink-0 rounded-card bg-surface object-cover'
            />
          ) : (
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-primary text-lg font-bold text-background'>
              {fallbackInitial}
            </div>
          )}
          <div className='min-w-0 flex-1'>
            <p className='truncate text-[15px] font-semibold text-foreground'>
              {displayName}
            </p>
            <p className='mt-0.5 truncate text-[12px] text-muted'>
              {displayUsername ? `@${displayUsername}` : 'Add a username'}
            </p>
          </div>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/png,image/jpeg,image/webp,image/gif,image/avif'
            className='hidden'
            aria-label='Choose a profile photo'
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) form.selectAvatarFile(file);
            }}
          />
          <div className='flex flex-wrap items-center gap-2'>
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className='focus-ring rounded-lg border border-solid border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60'
            >
              {form.hasAvatarChange || form.values.avatarPath
                ? 'Change photo'
                : 'Upload photo'}
            </button>
            {form.values.avatarPath && !form.removeRequested && (
              <button
                type='button'
                onClick={form.requestAvatarRemoval}
                disabled={busy}
                className='focus-ring rounded-lg px-3 py-1.5 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60'
              >
                Remove
              </button>
            )}
            {form.hasAvatarChange && (
              <button
                type='button'
                onClick={form.cancelAvatarChange}
                disabled={busy}
                className='focus-ring rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60'
              >
                Undo change
              </button>
            )}
            <span className='text-[12px] text-muted'>
              {form.removeRequested
                ? 'Your photo will be removed when you save.'
                : form.avatarPreviewUrl
                  ? 'New photo ready to save.'
                  : 'PNG, JPG, WebP, GIF, or AVIF. Up to 5 MB.'}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <TextInput
            {...form.field('nickname')}
            label='Nickname'
            placeholder='Your nickname'
            type='text'
            autoComplete='nickname'
            required
            error={form.errors.nickname}
            disabled={busy}
            focusTone='teal'
          />
          <TextInput
            {...form.field('username')}
            label='Username'
            placeholder='username'
            type='text'
            autoComplete='username'
            required
            error={form.errors.username}
            disabled={busy}
            focusTone='teal'
            hint={
              form.validatingField === 'username'
                ? 'Checking availability...'
                : '3-50 characters. Can be changed once every 7 days.'
            }
          />
          <TextInput
            {...form.field('email')}
            label='Email'
            placeholder='you@example.com'
            type='email'
            autoComplete='email'
            required
            error={form.errors.email}
            disabled={!EMAIL_CHANGES_ENABLED || busy}
            hint={EMAIL_CHANGES_ENABLED ? undefined : 'Temporarily unavailable.'}
            focusTone='teal'
          />
        </div>

        {form.avatarError && (
          <SettingsMessage tone='error'>{form.avatarError}</SettingsMessage>
        )}
        {form.formError && (
          <SettingsMessage tone='error'>{form.formError}</SettingsMessage>
        )}
        {form.successMessage && (
          <SettingsMessage tone='success'>
            {form.successMessage}
          </SettingsMessage>
        )}
      </SettingsSection>
    </form>
  );
};
