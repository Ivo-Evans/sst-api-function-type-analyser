import { SSTAPIConstruct, SSTFunctionConstruct } from '../../types'
import File from '../File'

export default class ConstructsFile extends File {
  public readonly functions: SSTFunctionConstruct[] = []
  public readonly apis: SSTAPIConstruct[] = []

  private initialiseJSONFile() {
    const data = this.readFromDisk()
    return JSON.parse(data)
  }

  constructor(name: string) {
    super(name)
    const constructs: { type: unknown }[] = this.initialiseJSONFile()
    constructs.forEach((construct) => {
      if (construct.type === 'Function') {
        this.functions.push(construct as SSTFunctionConstruct)
      } else if (construct.type === 'Api') {
        this.apis.push(construct as SSTAPIConstruct)
      }
    })
  }
}
