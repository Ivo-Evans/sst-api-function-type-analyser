import {
  SSTAPIConstruct,
  SSTConstructsFileContents,
  SSTFunctionsFileContents,
} from '../../types'
import API from '../API'
import File from '../File'

export default class APIFactory {
  constructor(
    private readonly constructsFileContents: SSTConstructsFileContents,
    private readonly functionsFileContents: SSTFunctionsFileContents,
    private readonly APIImplementation: typeof API,
    private readonly fileImplementation: File,
    private readonly pathToSSTProject: string
  ) {}

  private apisInFile(): SSTAPIConstruct[] {
    return this.constructsFileContents.filter(
      (construct): construct is SSTAPIConstruct => construct.type === 'Api'
    )
  }

  public getAPIs() {
    return this.apisInFile().map(
      (apiConstruct) =>
        new this.APIImplementation(
          apiConstruct,
          this.functionsFileContents,
          this.constructsFileContents,
          this.pathToSSTProject,
          this.fileImplementation
        )
    )
  }
}
