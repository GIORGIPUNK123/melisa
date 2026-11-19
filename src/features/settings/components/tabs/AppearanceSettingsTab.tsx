import { IconMoon } from '../../../../atoms/Icon';
import { SettingsSection } from '../SettingsSection';

export const AppearanceSettingsTab = () => {
  return (
    <SettingsSection
      title='Appearance'
      description='Make Melisa look the way you want.'
      icon={IconMoon}
    >
      <div className='rounded-xl border border-dashed border-[#243648] bg-[#0A1018]/40 px-4 py-6 text-center'>
        <p className='text-[13px] font-medium text-[#C7D3DF]'>
          Theme controls are coming soon
        </p>
        <p className='mx-auto mt-1 max-w-[300px] text-[12px] leading-5 text-[#8192A4]'>
          Light, dark, and display preferences will be available here.
        </p>
      </div>
    </SettingsSection>
  );
};
