import { IconBell, IconVolume } from '../../../../atoms/Icon';
import { usePreferencesStore } from '../../../../store/usePreferencesStore';
import { SettingsSection } from '../SettingsSection';
import { ToggleRow } from '../ToggleRow';

export const NotificationsSettingsTab = () => {
  const soundsMuted = usePreferencesStore(
    (state) => state.notificationSoundsMuted,
  );
  const setSoundsMuted = usePreferencesStore(
    (state) => state.setNotificationSoundsMuted,
  );

  return (
    <div className='flex flex-col gap-4'>
      <SettingsSection
        title='Notification sounds'
        description='Control the sounds you hear when something happens.'
        icon={IconVolume}
      >
        <ToggleRow
          title='Play notification sounds'
          description='Play a sound for new messages and notifications.'
          checked={!soundsMuted}
          onChange={(checked) => setSoundsMuted(!checked)}
        />
        <p className='text-[11px] leading-5 text-muted'>
          This preference is saved on this device and also silences toasts.
        </p>
      </SettingsSection>

      <SettingsSection
        title='Per-chat sounds'
        description='Fine-tune notifications for individual conversations.'
        icon={IconBell}
      >
        <p className='text-[12px] leading-5 text-muted-foreground'>
          You can mute a specific conversation from its chat info panel. That
          works independently of the global setting above.
        </p>
      </SettingsSection>
    </div>
  );
};
