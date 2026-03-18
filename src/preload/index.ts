import { contextBridge, ipcRenderer } from 'electron'
import type {
  Item,
  CreateItemInput,
  UpdateItemInput,
  Card,
  CreateCardInput,
  UpdateCardInput,
} from 'shared/validators'

declare global {
  interface Window {
    api: typeof API
  }
}

const API = {
  // ==================== Item (Example) ====================
  item: {
    getAll: (): Promise<Item[]> => ipcRenderer.invoke('item:getAll'),
    getById: (id: string): Promise<Item | null> =>
      ipcRenderer.invoke('item:getById', id),
    create: (input: CreateItemInput): Promise<Item> =>
      ipcRenderer.invoke('item:create', input),
    update: (id: string, input: UpdateItemInput): Promise<Item | null> =>
      ipcRenderer.invoke('item:update', id, input),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('item:delete', id),
  },

  // ==================== Card ====================
  card: {
    getAll: (): Promise<Card[]> => ipcRenderer.invoke('card:getAll'),
    create: (input: CreateCardInput): Promise<Card> =>
      ipcRenderer.invoke('card:create', input),
    update: (id: string, input: UpdateCardInput): Promise<Card | null> =>
      ipcRenderer.invoke('card:update', id, input),
    delete: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('card:delete', id),
  },
}

contextBridge.exposeInMainWorld('api', API)
