import { TextInput } from '../../../../atoms/TextInput';
import { IconUser } from '../../../../atoms/Icon';
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
            disabled={!form.isDirty || form.isBusy}
          />
        }
      >
        <div className='flex items-center gap-3 rounded-xl border border-solid border-border bg-sidebar/60 p-3'>
          {form.values.avatarUrl ? (
            <div
              className='h-14 w-14 shrink-0 rounded-card bg-surface bg-cover bg-center'
              style={{ backgroundImage: `url(${form.values.avatarUrl})` }}
              aria-hidden='true'
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

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <TextInput
            {...form.field('nickname')}
            label='Nickname'
            placeholder='Your nickname'
            type='text'
            autoComplete='nickname'
            required
            error={form.errors.nickname}
            disabled={form.isBusy}
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
            disabled={form.isBusy}
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
            disabled={!EMAIL_CHANGES_ENABLED || form.isBusy}
            hint={EMAIL_CHANGES_ENABLED ? undefined : 'Temporarily unavailable.'}
            focusTone='teal'
          />
          <TextInput
            {...form.field('avatarUrl')}
            label='Avatar URL'
            placeholder='https://...'
            type='url'
            autoComplete='off'
            error={form.errors.avatarUrl}
            disabled={form.isBusy}
            focusTone='teal'
          />
        </div>

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
