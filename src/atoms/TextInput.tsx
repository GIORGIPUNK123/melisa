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
        className={`py-2 px-3 w-full min-w-0 rounded-md border border-slate-700/80 bg-slate-800/80 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px] ${
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
