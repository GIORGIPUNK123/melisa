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
    <div className='w-full mb-4'>
      {props.label && (
        <label className='block mb-2 text-lg font-medium text-gray-900 dark:text-white'>
          {props.label}
        </label>
      )}
      <input
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        className={`bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white ${
          props.error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        placeholder={props.placeholder}
        required={props.required}
      />
      {props.error ? (
        <p className='ml-1 text-sm text-rose-500'>{props.error}</p>
      ) : null}
    </div>
  );
};
