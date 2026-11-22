import { TextInput } from '../../../../atoms/TextInput';
import { IconEyeOff, IconLock } from '../../../../atoms/Icon';
import type { UserT } from '../../../../types';
import { SettingsActions } from '../SettingsActions';
import { SettingsMessage } from '../SettingsMessage';
import { SettingsSection } from '../SettingsSection';
import { ToggleRow } from '../ToggleRow';
import { usePasswordSettingsForm } from '../../hooks/usePasswordSettingsForm';
import { usePrivacySettingsForm } from '../../hooks/usePrivacySettingsForm';
import type { SettingsUser } from '../../services/settingsService';

// Temporarily hidden behind a disabled control until the flow is ready.
const APPEAR_OFFLINE_ENABLED = false;

const PasswordSettingsSection = () => {
  const form = usePasswordSettingsForm();

  return (
    <form noValidate onSubmit={form.handleSubmit}>
      <SettingsSection
        title='Password'
        description='Changing it also re-encrypts your private chat key.'
        icon={IconLock}
        footer={
          <SettingsActions
            onCancel={() => form.reset()}
            submitLabel='Update password'
            isSubmitting={form.isSubmitting}
            disabled={!form.isDirty || form.isBusy}
          />
        }
      >
        <TextInput
          {...form.field('currentPassword')}
          label='Current password'
          placeholder='Current password'
          type='password'
          autoComplete='current-password'
          required
          error={form.errors.currentPassword}
          disabled={form.isBusy}
          focusTone='teal'
        />

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <TextInput
            {...form.field('newPassword')}
            label='New password'
            placeholder='New password'
            type='password'
            autoComplete='new-password'
            required
            error={form.errors.newPassword}
            disabled={form.isBusy}
            focusTone='teal'
          />
          <TextInput
            {...form.field('confirmPassword')}
            label='Confirm new password'
            placeholder='Confirm new password'
            type='password'
            autoComplete='new-password'
            required
            error={form.errors.confirmPassword}
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

const PrivacySettingsSection = (props: {
  profile: UserT;
  onSaved?: (user: SettingsUser) => void;
}) => {
  const form = usePrivacySettingsForm(props.profile, props.onSaved);

  return (
    <form noValidate onSubmit={form.handleSubmit}>
      <SettingsSection
        title='Privacy'
        description='Control how others see your activity.'
        icon={IconEyeOff}
        footer={
          <SettingsActions
            onCancel={() => form.reset()}
            submitLabel='Save privacy'
            isSubmitting={form.isSubmitting}
            disabled={!APPEAR_OFFLINE_ENABLED || !form.isDirty || form.isBusy}
          />
        }
      >
        <ToggleRow
          title='Appear offline'
          description={
            APPEAR_OFFLINE_ENABLED
              ? 'Hide your online presence from other users.'
              : 'Temporarily unavailable.'
          }
          checked={form.values.appearOffline}
          onChange={(checked) => form.setFieldValue('appearOffline', checked)}
          disabled={!APPEAR_OFFLINE_ENABLED || form.isBusy}
        />

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

export const AccountSettingsTab = (props: {
  profile: UserT;
  onSaved?: (user: SettingsUser) => void;
}) => {
  return (
    <div className='flex flex-col gap-4'>
      <PasswordSettingsSection />
      <PrivacySettingsSection
        profile={props.profile}
        onSaved={props.onSaved}
      />
    </div>
  );
};
