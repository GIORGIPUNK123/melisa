import { IconBell } from '../../../../atoms/Icon';
import { SettingsSection } from '../SettingsSection';

export const NotificationsSettingsTab = () => {
  return (
    <SettingsSection
      title='Notifications'
      description='Choose what you want to be notified about.'
      icon={IconBell}
    >
      <div className='rounded-xl border border-dashed border-[#243648] bg-[#0A1018]/40 px-4 py-6 text-center'>
        <p className='text-[13px] font-medium text-[#C7D3DF]'>
          Notification controls are coming soon
        </p>
        <p className='mx-auto mt-1 max-w-[300px] text-[12px] leading-5 text-[#8192A4]'>
          You'll be able to manage mentions, friend requests, and notification
          sounds here.
        </p>
      </div>
    </SettingsSection>
  );
};
