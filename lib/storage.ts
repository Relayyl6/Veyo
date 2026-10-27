import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEY = '@veyo_saved_credentials';

export interface SavedCredentials {
  email: string;
  password: string;
  name?: string;
  role?: string;
  savedAt: string;
}

/**
 * Persists the user's generated or entered credentials to local storage so they never have to remember it.
 */
export async function saveCredentials(data: {
  email?: string;
  password: string;
  name?: string;
  role?: string;
}): Promise<boolean> {
  try {
    const creds: SavedCredentials = {
      email: data.email || '',
      password: data.password,
      name: data.name || '',
      role: data.role || 'customer',
      savedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(creds);

    // Save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, json);

    // Also persist to SecureStore if native
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.setItemAsync('veyo_saved_password', data.password);
        if (data.email) {
          await SecureStore.setItemAsync('veyo_saved_email', data.email);
        }
      } catch (secErr) {
        // Non-fatal if secure store fails
        console.warn('[Storage] SecureStore write fallback:', secErr);
      }
    }

    return true;
  } catch (error) {
    console.error('[Storage] Failed to save credentials:', error);
    return false;
  }
}

/**
 * Retrieves the saved credentials from local storage.
 */
export async function getSavedCredentials(): Promise<SavedCredentials | null> {
  try {
    // 1. Check AsyncStorage first
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.password) {
        return parsed as SavedCredentials;
      }
    }

    // 2. Fallback to SecureStore
    if (Platform.OS !== 'web') {
      const secPassword = await SecureStore.getItemAsync('veyo_saved_password');
      if (secPassword) {
        const secEmail = (await SecureStore.getItemAsync('veyo_saved_email')) || '';
        return {
          email: secEmail,
          password: secPassword,
          savedAt: new Date().toISOString(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Storage] Failed to retrieve credentials:', error);
    return null;
  }
}

/**
 * Clears saved credentials from this phone.
 */
export async function clearSavedCredentials(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync('veyo_saved_password').catch(() => {});
      await SecureStore.deleteItemAsync('veyo_saved_email').catch(() => {});
    }
  } catch (err) {
    console.warn('[Storage] Error clearing credentials:', err);
  }
}
