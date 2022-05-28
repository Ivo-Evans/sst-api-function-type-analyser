type CaseInsensitiveMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS' /// support other methods

export type Method =
  | Uppercase<CaseInsensitiveMethod>
  | Lowercase<CaseInsensitiveMethod>

export interface LambdaExportSpec {
  method: Method
  route: string
}

export interface FileExportSpec {
  [index: string]: LambdaExportSpec
}

export interface ApiExportSpec {
  [index: string]: FileExportSpec
}

export interface AppExportSpec {
  [index: string]: ApiExportSpec
}

export interface SSTLocalLambdaRecord {
  id: string
  handler: string
  runtime: string
  srcPath: string
  root: string
}

export type SSTFunctionsFileContents = SSTLocalLambdaRecord[]

export type Route = `${Method} /${string}`

export interface SSTRoute {
  route: Route
  fn: {
    node: string
    stack: string
  }
}

export interface SSTAPIConstruct {
  type: 'Api'
  id: string
  addr: string
  stack: string
  data: {
    [index: string]: unknown
    routes: SSTRoute[]
  }
}

export interface SSTFunctionConstruct {
  type: 'Function'
  id: string
  addr: string
  stack: string
  data: {
    localId: string
    arn: string
  }
}

export type SSTConstruct = SSTAPIConstruct | SSTFunctionConstruct
// | { type: unknown }
// maybe edit the class to only export these?

export type SSTConstructsFileContents = SSTConstruct[]
