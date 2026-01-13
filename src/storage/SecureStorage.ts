import { AgentSecureStorage } from '@extrimian/agent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncLock from 'async-lock';

// Simplified secure storage using AsyncStorage
// In production, you'd want to use expo-secure-store or similar
export class SecureStorage implements AgentSecureStorage {
    private lock = new AsyncLock();
    private id: string;

    constructor(id = 'dummyId') {
        this.id = `secure-${id}`;
    }

    private formatKey(key: string): string {
        return `${this.id}-${key}`;
    }

    private async getSecureKeys(): Promise<string[]> {
        try {
            const storageKeys = JSON.parse(await AsyncStorage.getItem(this.id) || '[]');
            return storageKeys || [];
        } catch (error) {
            await AsyncStorage.setItem(this.id, JSON.stringify([]));
            return [];
        }
    }

    private async atomicAdd(key: string, data: string): Promise<void> {
        try {
            key = this.formatKey(key);
            let storageKeys = await this.getSecureKeys();
            await AsyncStorage.setItem(key, JSON.stringify(data));
            await AsyncStorage.setItem(this.id, JSON.stringify([...storageKeys.filter((element) => element !== key), key]));
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async add(key: string, data: string): Promise<void> {
        await this.lock.acquire(this.id, async () => {
            await this.atomicAdd(key, data);
        });
    }

    async get(key: string): Promise<any> {
        let returnVal;
        await this.lock.acquire(this.id, async () => {
            try {
                key = this.formatKey(key);
                const value = await AsyncStorage.getItem(key);
                if (!value) {
                    returnVal = null;
                    return;
                }
                returnVal = JSON.parse(value);
            } catch (error) {
                console.log(error);
                throw error;
            }
        });
        return returnVal;
    }

    async getAll(): Promise<Map<string, any>> {
        let returnMap: Map<string, any>;
        await this.lock.acquire(this.id, async () => {
            const map = new Map<string, any>();
            try {
                const storageKeys = await this.getSecureKeys();
                for (const key of storageKeys) {
                    const fixKey = key.replace(this.id + '-', '');
                    const value = await AsyncStorage.getItem(key);
                    if (value) {
                        map.set(fixKey, JSON.parse(value));
                    }
                }
                returnMap = map;
            } catch (error) {
                returnMap = map;
            }
        });
        return returnMap!;
    }

    async remove(key: string): Promise<void> {
        await this.lock.acquire(this.id, async () => {
            try {
                key = this.formatKey(key);
                await AsyncStorage.removeItem(key);
                const storageKeys = await this.getSecureKeys();
                if (!storageKeys.length) {
                    return;
                }
                await AsyncStorage.setItem(this.id, JSON.stringify(storageKeys.filter((k: string) => k !== key)));
            } catch (error) {
                console.log(error);
                throw error;
            }
        });
    }

    async update(key: string, data: any): Promise<void> {
        await this.lock.acquire(this.id, async () => {
            try {
                key = this.formatKey(key);
                await AsyncStorage.setItem(key, JSON.stringify(data));
            } catch (error) {
                console.log(error);
                throw error;
            }
        });
    }

    async clear(): Promise<void> {
        await this.lock.acquire(this.id, async () => {
            try {
                const storageKeys = await this.getSecureKeys();
                if (storageKeys.length > 0) {
                    for (const key of storageKeys) {
                        await AsyncStorage.removeItem(key);
                    }
                }
                await AsyncStorage.removeItem(this.id);
            } catch (error) {
                console.log('Error in secure storage clear:', error);
                throw error;
            }
        });
    }
}