import * as path from 'path'
import {
  ApiExportSpec,
  AppExportSpec,
  LambdaExportSpec,
  Method,
} from '../../types'

export default class RouteFileMapper {
  private pathToSSTProject: string
  private readFile: (filepath: string) => string
  private constructsFileContents: any[]
  private functionsFileContents: any[]
  private functionFileByLocalId: Record<string, string>
  private functionFileByAddress: Record<string, string>
  private appExportSpec: AppExportSpec

  constructor(
    pathToSSTProject: string,
    readFile: (filepath: string) => string
  ) {
    this.pathToSSTProject = pathToSSTProject
    this.readFile = readFile
  }

  private mapFunctionLocalIdToFilepath() {
    this.functionFileByLocalId = this.functionsFileContents.reduce(
      (collectedFunctions, functionEntry) => {
        return {
          ...collectedFunctions,
          [functionEntry.id]: path.join(
            // how do I actually want to save this filepath (absolute/relative/relative to what)? I'm not sure.
            this.pathToSSTProject,
            functionEntry.srcPath,
            functionEntry.handler
          ),
        }
      },
      []
    )
  }

  private mapFunctionAddressToFilepath() {
    this.functionFileByAddress = this.constructsFileContents.reduce(
      (collectedConstructs, construct) => {
        if (construct.type !== 'Function') {
          return collectedConstructs
        }

        const functionFilepath =
          this.functionFileByLocalId[construct.data.localId]

        return { ...collectedConstructs, [construct.addr]: functionFilepath }
      },
      {}
    )
  }

  private splitRouteAndMethod(
    sstPathString: `${Method} /${string}`
  ): LambdaExportSpec {
    const [method, route] = <[method: Method, route: string]>(
      sstPathString.split(' ')
    )

    return { method, route }
  }

  private getApiMapping(apiConstruct): ApiExportSpec {
    return apiConstruct.data.routes.reduce(
      (routesCollectedByFilepath, route) => {
        const { node } = route.fn
        const exportFilePath = this.functionFileByAddress[node]
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

  private loadConstructsFileIntoMemory() {
    this.constructsFileContents = JSON.parse(
      this.readFile(
        path.resolve(this.pathToSSTProject, '.sst', 'constructs.json')
      )
    )
  }

  private loadFunctionsFileIntoMemory() {
    const fileString = this.readFile(
      path.resolve(this.pathToSSTProject, '.sst', 'functions.jsonl')
    )

    this.functionsFileContents = fileString
      .trim()
      .split('\n')
      .map((jsonValue) => JSON.parse(jsonValue))
  }

  private throwMissingFunction(lambdaExportSpec: LambdaExportSpec) {
    throw new Error(
      `Function for route ${lambdaExportSpec.method} ${lambdaExportSpec.route} cannot be found.`
    )
  }

  private mapApiIdsToApiSpecs() {
    this.appExportSpec = this.constructsFileContents.reduce<AppExportSpec>(
      (collectedApis, construct) => {
        if (construct.type !== 'Api') {
          return collectedApis
        }
        return {
          ...collectedApis,
          [construct.id]: this.getApiMapping(construct),
        }
      },
      {}
    )
  }

  public getMapping(): AppExportSpec {
    this.loadConstructsFileIntoMemory()
    this.loadFunctionsFileIntoMemory()

    this.mapFunctionLocalIdToFilepath()
    this.mapFunctionAddressToFilepath()
    this.mapApiIdsToApiSpecs()

    return this.appExportSpec
  }
}
