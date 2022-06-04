import {
  SSTAPIConstruct,
  ApiExportSpec,
  Route,
  LambdaExportSpec,
  Method,
  FileExportSpec,
} from '../../types'
import ImportBlock from '../ImportBlock'
import Interface from '../Interface'
import File from '../File'
import ConstructsFile from '../ConstructsFile'
import FunctionsFile from '../FunctionsFile'

export default class API {
  private readonly apiMapping: ApiExportSpec
  private routeInterfaces: Record<string, Interface> = {}

  private mapFunctionAddressToFilepath(
    constructsFile: ConstructsFile,
    functionsFile: FunctionsFile
  ) {
    return constructsFile.functions.reduce(
      (collectedFunctionConstructs, functionConstruct) => {
        const functionFilepath =
          functionsFile.filepathById[functionConstruct.data.localId]

        return {
          ...collectedFunctionConstructs,
          [functionConstruct.addr]: functionFilepath,
        }
      },
      {}
    )
  }

  private splitRouteAndMethod(sstPathString: Route): LambdaExportSpec {
    const [method, route] = <[method: Method, route: string]>(
      sstPathString.split(' ')
    )

    return { method, route }
  }

  private throwMissingFunction(lambdaExportSpec: LambdaExportSpec) {
    throw new Error(
      `Function for route ${lambdaExportSpec.method} ${lambdaExportSpec.route} cannot be found.`
    )
  }

  private separateExportFromFilepath(exportFilePath: string) {
    const dotFollowedByJSBinding = /\.(?=[a-zA-Z$_][a-zA-Z$_0-9]*$)/
    const [filepath, exportedToken] = exportFilePath.split(
      dotFollowedByJSBinding
    )
    return { filepath, exportedToken }
  }

  private getApiMapping(
    apiConstruct: SSTAPIConstruct,
    functionFileByAddress: Record<string, string>
  ): ApiExportSpec {
    return apiConstruct.data.routes.reduce<ApiExportSpec>(
      (routesCollectedByFilepath, route) => {
        const { node } = route.fn
        const exportFilePath = functionFileByAddress[node]
        const lambdaExportSpec = this.splitRouteAndMethod(route.route)
        if (!exportFilePath) {
          this.throwMissingFunction(lambdaExportSpec)
          // integrity is only checked within the constructs file, not between construsts.json and function.json - a problem
        }

        const { filepath, exportedToken } =
          this.separateExportFromFilepath(exportFilePath)

        const fileExportSpec = {
          ...(routesCollectedByFilepath[filepath] || {}),
          [exportedToken]: lambdaExportSpec,
        }

        return {
          ...routesCollectedByFilepath,
          [filepath]: fileExportSpec,
        }
      },
      {}
    )
  }

  constructor(
    private readonly apiConstruct: SSTAPIConstruct,
    functionsFile: FunctionsFile,
    constructsFile: ConstructsFile,
    private readonly file: File
  ) {
    const functionFileByAddress = this.mapFunctionAddressToFilepath(
      constructsFile,
      functionsFile
    )
    this.apiMapping = this.getApiMapping(apiConstruct, functionFileByAddress)
  }

  private sstPathToTsTemplateString(route: string) {
    return '`' + route.replace(/{\S+}/g, '${string}') + '`'
  }

  private registerLambdaFile(
    filename: string,
    fileExportSpec: FileExportSpec,
    importBlock: ImportBlock,
    routesInterface: Interface
  ) {
    Object.entries(fileExportSpec).map(([exportName, lambdaExportSpec]) => {
      importBlock.import(filename, exportName)
      const importedAs = importBlock.getImportNameOf(filename, exportName)

      const routeKey = this.sstPathToTsTemplateString(lambdaExportSpec.route)

      if (!this.routeInterfaces[routeKey]) {
        this.routeInterfaces[routeKey] = new Interface()
      }

      this.routeInterfaces[routeKey].insert(
        lambdaExportSpec.method,
        `ReturnType<typeof ${importedAs}>`
      )
    })

    Object.entries(this.routeInterfaces).map(([routeKey, routeInterface]) =>
      routesInterface.insertIndexSignature(routeKey, routeInterface)
    )
  }

  private createInterfaceString() {
    const importBlock = new ImportBlock()
    const routesInterface = new Interface(this.apiConstruct.id)

    Object.entries(this.apiMapping).forEach(([filepath, fileExportSpec]) => {
      this.registerLambdaFile(
        filepath,
        fileExportSpec,
        importBlock,
        routesInterface
      )
    })

    return [
      importBlock.toString(),
      `export ${routesInterface.toStatementString()}`,
    ].join('\n\n')
  }

  public writeInterface() {
    const interfaceString = this.createInterfaceString()
    this.file.content = interfaceString
    this.file.writeToDisk()
  }
}
