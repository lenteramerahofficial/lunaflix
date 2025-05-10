// Type definitions for stored data
export interface AuthData {
  username: string;
  isAuthenticated: boolean;
  timestamp: string;
}

export interface OtpData {
  username: string;
  otp: string;
  expiresAt: string;
}

/**
 * Set an item in localStorage with type safety
 */
export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
}

/**
 * Get an item from localStorage with type safety
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return null;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing localStorage item:', error);
  }
}

/**
 * Save authentication state
 */
export function saveAuthState(username: string): void {
  const authData: AuthData = {
    username,
    isAuthenticated: true,
    timestamp: new Date().toISOString()
  };
  
  setItem("lunaflix_auth", authData);
}

/**
 * Clear authentication state (logout)
 */
export function clearAuthState(): void {
  removeItem("lunaflix_auth");
}

/**
 * Get current authenticated username
 */
export function getUsername(): string | null {
  const authData = getItem<AuthData>("lunaflix_auth");
  return authData?.username || null;
}
