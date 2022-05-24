import {
  APIClass,
  SSTAPIConstruct,
  SSTConstructsFileContents,
  SSTFunctionsFileContents,
} from '../../types'

export default class APIFactory {
  constructor(
    private readonly constructsFileContents: SSTConstructsFileContents,
    private readonly functionsFileContents: SSTFunctionsFileContents,
    private readonly APIImplementation: APIClass
  ) {}

  private apisInFile(): SSTAPIConstruct[] {
    return this.constructsFileContents.filter(
      (construct): construct is SSTAPIConstruct => construct.type === 'Api'
    )
  }

  public getAPIs() {
    return this.apisInFile().map(
      (apiConstruct) =>
        new this.APIImplementation(apiConstruct, this.functionsFileContents)
    )
  }
}
