import {
  SSTAPIConstruct,
  SSTFunctionsFileContents,
  SSTConstructsFileContents,
  ApiExportSpec,
  Route,
  LambdaExportSpec,
  Method,
  FileExportSpec,
} from '../../types'
import path from 'path'
import ImportBlock from '../ImportBlock'
import Interface from '../Interface'
import File from '../File'

export default class API {
  private readonly apiMapping: ApiExportSpec
  private routeInterfaces: Record<string, Interface> = {}

  private mapFunctionLocalIdToFilepath(
    functionsFileContents: SSTFunctionsFileContents
  ): Record<string, string> {
    return functionsFileContents.reduce((collectedFunctions, functionEntry) => {
      return {
        ...collectedFunctions,
        [functionEntry.id]: path.join(
          // how do I actually want to save this filepath (absolute/relative/relative to what)? I'm not sure.
          this.pathToSSTProject,
          functionEntry.srcPath,
          functionEntry.handler
        ),
      }
    }, {})
  }

  private mapFunctionAddressToFilepath(
    constructsFileContents: SSTConstructsFileContents,
    functionFileByLocalId: Record<string, string>
  ) {
    return constructsFileContents.reduce((collectedConstructs, construct) => {
      if (construct.type !== 'Function') {
        return collectedConstructs
      }

      const functionFilepath = functionFileByLocalId[construct.data.localId]

      return { ...collectedConstructs, [construct.addr]: functionFilepath }
    }, {})
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

        //it would probably be cleaner to do this beforehand and change the shape of the earlier hashmaps
        const dotFollowedByJSBinding = /\.(?=[a-zA-Z$_][a-zA-Z$_0-9]*$)/
        const [filepath, exportedToken] = exportFilePath.split(
          dotFollowedByJSBinding
        )

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
    functionsFileContents: SSTFunctionsFileContents,
    constructsFileContents: SSTConstructsFileContents,
    private readonly pathToSSTProject: string,
    private readonly file: File
  ) {
    this.pathToSSTProject = pathToSSTProject
    const functionFileByLocalId = this.mapFunctionLocalIdToFilepath(
      functionsFileContents
    )
    const functionFileByAddress = this.mapFunctionAddressToFilepath(
      constructsFileContents,
      functionFileByLocalId
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
      routesInterface.insert(routeKey, routeInterface)
    )
  }

  private createInterfaceString() {
    const importBlock = new ImportBlock()
    const routesInterface = new Interface()

    Object.entries(this.apiMapping).forEach(([filepath, fileExportSpec]) => {
      this.registerLambdaFile(
        filepath,
        fileExportSpec,
        importBlock,
        routesInterface
      )
    })

    return [importBlock.toString(), routesInterface.toString()].join('\n\n')
  }

  public writeInterface() {
    const interfaceString = this.createInterfaceString()
    this.file.content = interfaceString
    this.file.writeToDisk()
  }
}
