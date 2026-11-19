import { useId } from 'react';

type TextInputProps = {
  value: string;
  label?: string;
  placeholder: string;
  type: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  required?: boolean;
  error?: string;
  hint?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  autoComplete?: string;
  focusTone?: 'indigo' | 'teal';
  variant?: 'default' | 'plain';
};

export const TextInput = (props: TextInputProps) => {
  const generatedId = useId();
  const inputId = props.id ?? props.name ?? generatedId;
  const metaId = `${inputId}-meta`;
  const isPlain = props.variant === 'plain';

  const focusClasses =
    props.focusTone === 'teal'
      ? 'focus:border-primary/70 focus:ring-2 focus:ring-primary/15'
      : 'focus:border-primary focus:ring-2 focus:ring-primary/20';

  const inputClasses = isPlain
    ? 'py-2 px-3 w-full min-w-0 rounded-md border border-border-strong bg-sidebar/80 text-sm text-foreground placeholder:text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]'
    : `h-11 w-full min-w-0 rounded-xl border bg-sidebar/70 px-3.5 text-[16px] text-foreground placeholder:text-subtle outline-none transition disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]`;

  const errorClasses = isPlain
    ? 'border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/25'
    : 'border-destructive/70 focus:border-destructive focus:ring-2 focus:ring-destructive/20';

  return (
    <div className={isPlain ? 'w-full' : 'w-full min-w-0'}>
      {props.label && (
        <label
          htmlFor={inputId}
          className='mb-1.5 block text-[12px] font-medium text-muted'
        >
          {props.label}
        </label>
      )}
      <input
        id={inputId}
        name={props.name}
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        disabled={props.disabled}
        autoComplete={props.autoComplete}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error || props.hint ? metaId : undefined}
        className={`${inputClasses} ${
          props.error
            ? errorClasses
            : isPlain
              ? ''
              : `border-border-strong ${focusClasses}`
        }`}
        placeholder={props.placeholder}
        required={props.required ?? false}
      />
      {props.error ? (
        <p
          id={metaId}
          className={
            isPlain
              ? 'mt-1.5 text-[12px] text-destructive'
              : 'mt-1.5 text-[12px] leading-4 text-destructive'
          }
        >
          {props.error}
        </p>
      ) : props.hint ? (
        <p id={metaId} className='mt-1.5 text-[11px] leading-4 text-muted'>
          {props.hint}
        </p>
      ) : null}
    </div>
  );
};
