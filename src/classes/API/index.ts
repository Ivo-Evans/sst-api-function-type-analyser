import {
  SSTAPIConstruct,
  ApiExportSpec,
  Route,
  LambdaExportSpec,
  Method,
  FileExportSpec,
  Config,
} from '../../types'
import ImportBlock from '../ImportBlock'
import Interface from '../Interface'
import File from '../File'
import ConstructsFile from '../ConstructsFile'
import FunctionsFile from '../FunctionsFile'
import path from 'path'

export default class API {
  private readonly apiMapping: ApiExportSpec
  private routeInterfaces: Record<string, Interface> = {}
  private readonly name: string

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

  private splitExportAndFilepath(exportFilePath: string) {
    const dotFollowedByJSBinding = /\.(?=[a-zA-Z$_][a-zA-Z$_0-9]*$)/
    const [filepath, exportedToken] = exportFilePath.split(
      dotFollowedByJSBinding
    )
    return { filepath, exportedToken }
  }

  private throwMissingFunction(lambdaExportSpec: LambdaExportSpec) {
    throw new Error(
      `Function for route ${lambdaExportSpec.method} ${lambdaExportSpec.route} cannot be found.`
    )
  }

  private getApiMapping(
    apiConstruct: SSTAPIConstruct,
    functionFileByAddress: Record<string, string>
  ): ApiExportSpec {
    return apiConstruct.data.routes.reduce<ApiExportSpec>(
      (routesCollectedByFilepath, route) => {
        const exportFilePath = functionFileByAddress[route.fn.node]
        const lambdaExportSpec = this.splitRouteAndMethod(route.route)
        if (!exportFilePath) {
          this.throwMissingFunction(lambdaExportSpec)
          // integrity is only checked within the constructs file, not between constructs.json and function.json - a problem
        }

        const { filepath, exportedToken } =
          this.splitExportAndFilepath(exportFilePath)

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
    apiConstruct: SSTAPIConstruct,
    functionsFile: FunctionsFile,
    constructsFile: ConstructsFile,
    private readonly config: Config,
    private readonly FileImplementation: typeof File
  ) {
    this.name = apiConstruct.id[0].toUpperCase() + apiConstruct.id.slice(1)
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
    const routesInterface = new Interface(this.name)

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
    const outFilePath = path.join(this.config.outDir, `${this.name}.d.ts`)
    const apiDeclarationFile = new this.FileImplementation(outFilePath)
    apiDeclarationFile.content = this.createInterfaceString()
    apiDeclarationFile.writeToDisk()
  }
}
