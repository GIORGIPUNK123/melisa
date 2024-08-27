import React from 'react';

export const TextInput = (props: {
  value: string;
  label?: string;
  placeholder: string;
  type: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required: boolean;
}) => {
  return (
    <div className='w-full max-w-xs mb-4'>
      {props.label && (
        <label className='block mb-2 text-lg font-medium text-gray-900 dark:text-white'>
          {props.label}
        </label>
      )}
      <input
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white'
        placeholder={props.placeholder}
        required={props.required}
      />
    </div>
  );
};
