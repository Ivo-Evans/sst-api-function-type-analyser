import * as fs from 'fs'
import * as path from 'path'
import { AppExportSpec, LambdaExportSpec, Method } from '../../types'

export default class RouteFileMapper {
  private pathToSSTProject: string
  private constructsFileContents: any[]
  private functionsFileContents: any[]
  private functionFileByLocalId: Record<string, string>
  private functionFileByAddress: Record<string, string>
  private appExportSpec: AppExportSpec

  constructor(pathToSSTProject: string) {
    this.pathToSSTProject = pathToSSTProject
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

  private getApiMapping(apiConstruct) {
    return apiConstruct.data.routes.reduce(
      (routesCollectedByFilepath, route) => {
        const { node } = route.fn
        const filepath = this.functionFileByAddress[node]
        const lambdaExportSpec = this.splitRouteAndMethod(route.route)
        if (!filepath) {
          this.throwMissingFunction(lambdaExportSpec)
        }
        return { ...routesCollectedByFilepath, [filepath]: lambdaExportSpec }
      },
      {}
    )
  }

  private parseConstructsFile() {
    this.constructsFileContents = JSON.parse(
      fs.readFileSync(
        path.resolve(this.pathToSSTProject, '.sst', 'constructs.json'),
        'utf-8'
      )
    )
  }

  private parseFunctionsFile() {
    const fileString = fs.readFileSync(
      path.resolve(this.pathToSSTProject, '.sst', 'functions.jsonl'),
      'utf-8'
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
    this.appExportSpec = this.constructsFileContents.reduce(
      (collectedApis, construct) => {
        if (construct.type !== 'Api') {
          return collectedApis
        }
        return {
          ...collectedApis,
          [construct.id]: this.getApiMapping(construct),
        }
      },
      []
    )
  }

  public getMapping(): AppExportSpec {
    this.parseConstructsFile()
    this.parseFunctionsFile()

    this.mapFunctionLocalIdToFilepath()
    this.mapFunctionAddressToFilepath()

    this.mapApiIdsToApiSpecs()

    return this.appExportSpec
  }
}
