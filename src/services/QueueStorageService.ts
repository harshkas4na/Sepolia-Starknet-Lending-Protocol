// src/services/QueueStorageService.ts

import { QueueItem, QueueStatus } from '../types/queue';

export class QueueStorageService {
  private storage: Map<string, QueueItem>;

  constructor() {
    this.storage = new Map();
  }

  async save(item: QueueItem): Promise<void> {
    this.storage.set(item.id, { ...item });
  }

  async get(id: string): Promise<QueueItem | null> {
    return this.storage.get(id) || null;
  }

  async update(id: string, updates: Partial<QueueItem>): Promise<void> {
    const item = this.storage.get(id);
    if (item) {
      this.storage.set(id, { ...item, ...updates });
    }
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async getAllByStatus(status: QueueStatus): Promise<QueueItem[]> {
    return Array.from(this.storage.values()).filter(item => item.status === status);
  }

  async getPendingItems(): Promise<QueueItem[]> {
    return this.getAllByStatus(QueueStatus.PENDING);
  }

  async getProcessingItems(): Promise<QueueItem[]> {
    return this.getAllByStatus(QueueStatus.PROCESSING);
  }

  async clearAll(): Promise<void> {
    this.storage.clear();
  }
}