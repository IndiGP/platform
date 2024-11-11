import { type MeasureContext, type WorkspaceId } from '@hcengineering/core'
import { type ContentTextAdapter } from '@hcengineering/server-core'
import { pmNodeToText, yDocContentToNodes } from '@hcengineering/text'
import { Buffer } from 'node:buffer'
import { Readable } from 'node:stream'

/**
 * @public
 */
export async function createYDocAdapter (_url: string): Promise<ContentTextAdapter> {
  return {
    content: async (
      ctx: MeasureContext,
      workspace: WorkspaceId,
      _name: string,
      _type: string,
      data: Readable | Buffer | string
    ): Promise<string> => {
      const chunks: any[] = []

      if (data instanceof Readable) {
        await new Promise((resolve) => {
          data.on('readable', () => {
            let chunk: any
            while ((chunk = data.read()) !== null) {
              const b = chunk as Buffer
              chunks.push(b)
            }
          })

          data.on('end', () => {
            resolve(null)
          })
        })
      } else if (data instanceof Buffer) {
        chunks.push(data)
      } else {
        console.warn('ydoc content adapter does not support string content')
      }

      if (chunks.length > 0) {
        const nodes = yDocContentToNodes(Buffer.concat(chunks))
        return nodes.map(pmNodeToText).join('\n')
      }

      return ''
    }
  }
}
