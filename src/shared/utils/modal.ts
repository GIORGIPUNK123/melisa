import { MouseEvent } from 'react';

export const handleBackdropClick = (
  event: MouseEvent<HTMLElement>,
  onClose: () => void,
) => {
  if (event.target === event.currentTarget) {
    onClose();
  }
};
