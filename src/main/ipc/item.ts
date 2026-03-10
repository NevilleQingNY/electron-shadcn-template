/**
 * Item IPC Handlers - Example
 */
import { ipcMain } from 'electron'
import itemRepository from '../database/repositories/item'
import { createItemSchema, updateItemSchema, idSchema } from 'shared/validators'
import { parseOrThrow } from '../database/utils'

export function registerItemHandlers(): void {
  ipcMain.handle('item:getAll', () => itemRepository.getAll())

  ipcMain.handle('item:getById', (_, id: string) =>
    itemRepository.getById(parseOrThrow(idSchema, id))
  )

  ipcMain.handle('item:create', (_, input: unknown) =>
    itemRepository.create(parseOrThrow(createItemSchema, input))
  )

  ipcMain.handle('item:update', (_, id: string, input: unknown) =>
    itemRepository.update(
      parseOrThrow(idSchema, id),
      parseOrThrow(updateItemSchema, input)
    )
  )

  ipcMain.handle('item:delete', (_, id: string) =>
    itemRepository.delete(parseOrThrow(idSchema, id))
  )
}
