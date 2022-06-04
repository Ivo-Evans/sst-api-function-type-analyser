import File from '../File'
import path from 'path'
import { SSTLocalLambdaRecord } from '../../types'

export default class FunctionsFile extends File {
  public readonly filepathById: Record<string, string> = {}

  private initialiseJSONLFile(): SSTLocalLambdaRecord[] {
    const data = this.readFromDisk()
    return data.split('\n').map((item) => JSON.parse(item))
  }

  constructor(name: string) {
    super(name)
    const functionsFileContents = this.initialiseJSONLFile()
    functionsFileContents.forEach((functionEntry) => {
      this.filepathById[functionEntry.id] = path.join(
        functionEntry.srcPath,
        functionEntry.handler
      )
    })
  }
}
