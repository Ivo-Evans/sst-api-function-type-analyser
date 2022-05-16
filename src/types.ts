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
