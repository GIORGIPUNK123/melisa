import { IconMoon } from '../../../../atoms/Icon';
import { SettingsSection } from '../SettingsSection';

export const AppearanceSettingsTab = () => {
  return (
    <SettingsSection
      title='Appearance'
      description='Make Melisa look the way you want.'
      icon={IconMoon}
    >
      <div className='rounded-xl border border-dashed border-border-strong bg-sidebar/40 px-4 py-6 text-center'>
        <p className='text-[13px] font-medium text-muted-foreground'>
          Theme controls are coming soon
        </p>
        <p className='mx-auto mt-1 max-w-[300px] text-[12px] leading-5 text-muted'>
          Light, dark, and display preferences will be available here.
        </p>
      </div>
    </SettingsSection>
  );
};
