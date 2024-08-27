import { useState } from 'react';

export const useFormInput = (
  initialValue: string,
  onValueChange?: () => void // Optional callback function
) => {
  const [value, setValue] = useState(initialValue);
  const reset = () => {
    setValue(initialValue);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (onValueChange) {
      onValueChange();
    }
  };

  return {
    value,
    onChange: handleChange,
    reset,
  };
};
