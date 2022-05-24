import {
  APIClass,
  SSTAPIConstruct,
  SSTConstructsFileContents,
  SSTFunctionsFileContents,
} from '../../types'

export default class APIFactory {
  private readonly constructsFileContents: SSTConstructsFileContents
  private readonly functionsFileContents: SSTFunctionsFileContents
  private readonly APIImplementation: APIClass

  constructor(
    constructsFileContents: SSTConstructsFileContents,
    functionsFileContents: SSTFunctionsFileContents,
    APIImplementation: APIClass
  ) {
    this.constructsFileContents = constructsFileContents
    this.functionsFileContents = functionsFileContents
    this.APIImplementation = APIImplementation
  }

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
