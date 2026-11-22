import type { ReactNode } from 'react';
import { IconCheck, IconMoon } from '../../../../atoms/Icon';
import {
  usePreferencesStore,
  type AccentT,
  type TextSizeT,
} from '../../../../store/usePreferencesStore';
import { SettingsSection } from '../SettingsSection';

const ACCENTS: { value: AccentT; label: string; swatch: string }[] = [
  { value: 'teal', label: 'Teal', swatch: '#65e0c1' },
  { value: 'blue', label: 'Blue', swatch: '#6cb8ff' },
  { value: 'violet', label: 'Violet', swatch: '#b79cff' },
  { value: 'rose', label: 'Rose', swatch: '#ff8fa8' },
];

const TEXT_SIZES: { value: TextSizeT; label: string; preview: number }[] = [
  { value: 'small', label: 'Small', preview: 13 },
  { value: 'default', label: 'Default', preview: 16 },
  { value: 'large', label: 'Large', preview: 20 },
];

const OptionButton = (props: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type='button'
    aria-pressed={props.selected}
    onClick={props.onClick}
    className={`flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-solid px-2 py-3 text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
      props.selected
        ? 'border-primary/50 bg-primary-soft text-primary'
        : 'border-border-strong bg-sidebar/50 text-muted-foreground cursor-pointer hover:bg-surface-hover hover:text-foreground'
    }`}
  >
    {props.children}
    <span>{props.label}</span>
  </button>
);

export const AppearanceSettingsTab = () => {
  const accent = usePreferencesStore((state) => state.accent);
  const textSize = usePreferencesStore((state) => state.textSize);
  const setAccent = usePreferencesStore((state) => state.setAccent);
  const setTextSize = usePreferencesStore((state) => state.setTextSize);

  return (
    <div className='flex flex-col gap-4'>
      <SettingsSection
        title='Accent color'
        description='The highlight color used for buttons, links, and active states.'
        icon={IconMoon}
      >
        <div className='flex gap-2'>
          {ACCENTS.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              selected={accent === option.value}
              onClick={() => setAccent(option.value)}
            >
              <span
                className='flex h-5 w-5 items-center justify-center rounded-full'
                style={{ backgroundColor: option.swatch }}
              >
                {accent === option.value && (
                  <IconCheck size={12} className='text-background' />
                )}
              </span>
            </OptionButton>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title='Text size'
        description='Adjust how large text appears across the app.'
      >
        <div className='flex gap-2'>
          {TEXT_SIZES.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              selected={textSize === option.value}
              onClick={() => setTextSize(option.value)}
            >
              <span
                className='font-semibold leading-none'
                style={{ fontSize: option.preview }}
              >
                Aa
              </span>
            </OptionButton>
          ))}
        </div>
        <p className='text-[11px] text-muted'>
          Appearance settings are saved on this device.
        </p>
      </SettingsSection>
    </div>
  );
};
