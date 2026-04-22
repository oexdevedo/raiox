import { useState, useEffect } from 'react';
import { CustomButtons, StatusButton } from '@/types/financial';
import { apiGetCustomButtons, apiSaveCustomButtons } from '@/lib/api';

const DEFAULT_BUTTON: StatusButton = { visible: false, label: '', url: '', message: '' };

const DEFAULT: CustomButtons = {
  negative: { ...DEFAULT_BUTTON },
  neutral: { ...DEFAULT_BUTTON },
  positive: { ...DEFAULT_BUTTON },
};

export const useCustomButtons = () => {
  const [buttons, setButtons] = useState<CustomButtons>(DEFAULT);
  const [isLoading, setIsLoading] = useState(true);

  const fetchButtons = async () => {
    try {
      const data = await apiGetCustomButtons();
      if (data && Object.keys(data).length > 0) {
        setButtons(data as unknown as CustomButtons);
      }
    } catch (error) {
      console.error('Error fetching custom buttons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchButtons();
  }, []);

  const saveButtons = async (updated: CustomButtons) => {
    try {
      await apiSaveCustomButtons(updated as unknown as Record<string, unknown>);
      setButtons(updated);
      return { success: true };
    } catch (error) {
      console.error('Error saving custom buttons:', error);
      return { success: false, error };
    }
  };

  return { buttons, saveButtons, isLoading, refresh: fetchButtons };
};
