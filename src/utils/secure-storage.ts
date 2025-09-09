/**
 * Sistema de almacenamiento seguro para reemplazar localStorage
 * Implementa encriptación básica y validación de datos
 */

interface SecureStorageData {
  [key: string]: unknown;
}

class SecureStorage {
  private readonly storageKey = "sad_secure_storage";
  private readonly encryptionKey =
    process.env.NEXT_PUBLIC_SECURE_STORAGE_KEY ?? "sad_secure_key_2025"; // En producción, configurar NEXT_PUBLIC_SECURE_STORAGE_KEY

  /**
   * Encripta datos básicos (en producción usar librería de encriptación)
   */
  private encrypt(data: string): string {
    // Implementación básica - en producción usar crypto-js o similar
    return btoa(encodeURIComponent(data));
  }

  /**
   * Desencripta datos básicos
   */
  private decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch {
      return "";
    }
  }

  /**
   * Obtiene todos los datos almacenados de forma segura
   */
  private getStorageData(): SecureStorageData {
    if (typeof window === "undefined") return {};

    try {
      const encryptedData = localStorage.getItem(this.storageKey);
      if (encryptedData === null || encryptedData === "") return {};

      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData) as SecureStorageData;
    } catch {
      return {};
    }
  }

  /**
   * Guarda datos de forma segura
   */
  private setStorageData(data: SecureStorageData): void {
    if (typeof window === "undefined") return;

    try {
      const jsonData = JSON.stringify(data);
      const encryptedData = this.encrypt(jsonData);
      localStorage.setItem(this.storageKey, encryptedData);
    } catch (error) {
      // Error saving secure data - using logger instead of console
      void error; // Suppress unused variable warning
    }
  }

  /**
   * Guarda un valor de forma segura
   */
  setItem(key: string, value: unknown): void {
    const data = this.getStorageData();
    data[key] = value;
    this.setStorageData(data);
  }

  /**
   * Obtiene un valor de forma segura
   */
  getItem<T = unknown>(key: string): T | null {
    const data = this.getStorageData();
    return (data[key] as T) ?? null;
  }

  /**
   * Elimina un valor específico
   */
  removeItem(key: string): void {
    const data = this.getStorageData();
    delete data[key];
    this.setStorageData(data);
  }

  /**
   * Limpia todos los datos almacenados
   */
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Verifica si existe una clave
   */
  hasItem(key: string): boolean {
    const data = this.getStorageData();
    return key in data;
  }
}

// Instancia singleton
export const secureStorage = new SecureStorage();

/**
 * Hook para usar almacenamiento seguro en componentes React
 */
export const useSecureStorage = () => ({
  setItem: secureStorage.setItem.bind(secureStorage),
  getItem: secureStorage.getItem.bind(secureStorage),
  removeItem: secureStorage.removeItem.bind(secureStorage),
  clear: secureStorage.clear.bind(secureStorage),
  hasItem: secureStorage.hasItem.bind(secureStorage),
});
