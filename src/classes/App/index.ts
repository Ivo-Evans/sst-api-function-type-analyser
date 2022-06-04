import path from 'path'
import { Config } from '../../types'
import API from '../API'
import ConstructsFile from '../ConstructsFile'
import FunctionsFile from '../FunctionsFile'
import File from '../File'

export default class App {
  constructor(private readonly config: Config) {}

  public generateTypes() {
    const functionsFile = new FunctionsFile(
      path.join(this.config.srcDir, 'functions.jsonl')
    )
    const constructsFile = new ConstructsFile(
      path.join(this.config.srcDir, 'constructs.json')
    )

    const apis = constructsFile.apis.map(
      (apiConstruct) =>
        new API(
          apiConstruct,
          functionsFile,
          constructsFile,
          new File(path.join(this.config.outDir, `${apiConstruct.id}.d.ts`))
        )
    )

    apis.forEach((api) => api.writeInterface())
  }
}
