import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

export function useSecureStore<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await SecureStore.getItemAsync(key);
        if (stored !== null) {
          setValue(JSON.parse(stored) as T);
        }
      } catch (e) {
        console.error("Failed to load from SecureStore:", e);
      }
    };
    loadValue();
  }, [key]);

  const setSecureValue = async (newValue: T) => {
    setValue(newValue);
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(newValue));
    } catch (e) {
      console.error("Failed to save to SecureStore:", e);
    }
  };

  return [value, setSecureValue] as const;
}
