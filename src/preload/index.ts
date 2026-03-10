import { contextBridge, ipcRenderer } from 'electron'
import type { Item, CreateItemInput, UpdateItemInput } from 'shared/validators'

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

  // TODO: Add your API namespaces here
}

contextBridge.exposeInMainWorld('api', API)
