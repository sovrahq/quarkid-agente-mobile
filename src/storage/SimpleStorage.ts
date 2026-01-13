// Simple storage implementations for testing
// In a real app, these would use AsyncStorage and SecureStore

export class SimpleStorage {
  private storage: Map<string, any> = new Map();

  constructor(private prefix: string) {}

  async get(key: string): Promise<any> {
    const fullKey = `${this.prefix}:${key}`;
    return this.storage.get(fullKey);
  }

  async add(key: string, value: any): Promise<void> {
    const fullKey = `${this.prefix}:${key}`;
    this.storage.set(fullKey, value);
  }

  async update(key: string, value: any): Promise<void> {
    const fullKey = `${this.prefix}:${key}`;
    this.storage.set(fullKey, value);
  }

  async remove(key: string): Promise<void> {
    const fullKey = `${this.prefix}:${key}`;
    this.storage.delete(fullKey);
  }

  async clear(): Promise<void> {
    const keysToDelete = Array.from(this.storage.keys()).filter(key =>
      key.startsWith(`${this.prefix}:`)
    );
    keysToDelete.forEach(key => this.storage.delete(key));
  }

  async getAll(): Promise<Map<string, any>> {
    const result = new Map<string, any>();
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`${this.prefix}:`)) {
        const cleanKey = key.replace(`${this.prefix}:`, '');
        result.set(cleanKey, value);
      }
    }
    return result;
  }

  async getAllAsRecord(): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(`${this.prefix}:`)) {
        const cleanKey = key.replace(`${this.prefix}:`, '');
        result[cleanKey] = value;
      }
    }
    return result;
  }
}

export class SimpleSecureStorage extends SimpleStorage {
  // In a real implementation, this would use secure storage
  // For testing purposes, it's the same as regular storage
}