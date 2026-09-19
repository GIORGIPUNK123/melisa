import { ui } from '../shared/ui';

export const TextInput = (props: {
  value: string;
  label?: string;
  placeholder: string;
  type: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required: boolean;
  error?: string;
}) => {
  return (
    <div className='w-full'>
      {props.label && <label className={ui.label}>{props.label}</label>}
      <input
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        className={`${ui.input} ${
          props.error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
            : ''
        }`}
        placeholder={props.placeholder}
        required={props.required}
      />
      {props.error ? (
        <p className='mt-1.5 text-[12px] text-rose-400'>{props.error}</p>
      ) : null}
    </div>
  );
};
