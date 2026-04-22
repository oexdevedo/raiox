import { useState, useEffect } from 'react';
import { CustomButton, CUSTOM_BUTTON_KEY } from '@/types/financial';

const DEFAULT: CustomButton = { visible: false, label: '', url: '' };

export const useCustomButton = () => {
  const [button, setButton] = useState<CustomButton>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(CUSTOM_BUTTON_KEY);
    if (stored) setButton(JSON.parse(stored));
  }, []);

  const saveButton = (updated: CustomButton) => {
    localStorage.setItem(CUSTOM_BUTTON_KEY, JSON.stringify(updated));
    setButton(updated);
  };

  return { button, saveButton };
};
