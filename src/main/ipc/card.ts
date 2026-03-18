/**
 * Card IPC Handlers - Whiteboard card operations
 */
import { ipcMain } from 'electron'
import cardRepository from '../database/repositories/card'
import { createCardSchema, updateCardSchema, idSchema } from 'shared/validators'
import { parseOrThrow } from '../database/utils'

export function registerCardHandlers(): void {
  ipcMain.handle('card:getAll', () => cardRepository.getAll())

  ipcMain.handle('card:create', (_, input: unknown) =>
    cardRepository.create(parseOrThrow(createCardSchema, input))
  )

  ipcMain.handle('card:update', (_, id: string, input: unknown) =>
    cardRepository.update(
      parseOrThrow(idSchema, id),
      parseOrThrow(updateCardSchema, input)
    )
  )

  ipcMain.handle('card:delete', (_, id: string) =>
    cardRepository.delete(parseOrThrow(idSchema, id))
  )
}
