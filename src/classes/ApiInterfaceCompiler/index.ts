import { ApiExportSpec, FileExportSpec, Method } from '../../types'
import * as path from 'path'

export default class RouteInterfaceWriter {
  private apiExportSpec: ApiExportSpec
  private apiName: string
  private outDir: string
  private writeFile: (filepath: string, content: string) => void
  private usedNames: Record<string, number>
  private importStatements: string[]
  private fileString
  private interfaceRepresentation: Record<string, Record<string, string>>

  private readonly INDENTATION_STYLE = '    '

  constructor(
    apiName: string,
    apiExportSpec: ApiExportSpec,
    outDir: string,
    writeFile: (filepath: string, content: string) => void
  ) {
    this.apiName = apiName
    this.apiExportSpec = apiExportSpec
    this.outDir = outDir
    this.writeFile = writeFile
    this.usedNames = {}
    this.importStatements = []
    this.interfaceRepresentation = {}
  }

  private createApiInterfaceName() {
    return this.apiName[0].toUpperCase() + this.apiName.slice(1) + 'Routes'
  }

  private chooseAvailableImportName(desiredName: string) {
    const viableName = desiredName === 'default' ? 'lambda' : desiredName
    const lastCount = this.usedNames[viableName] || 0
    if (!lastCount) {
      this.usedNames[viableName] = 1
      return viableName
    }
    this.usedNames[viableName]++
    return `${viableName}_${this.usedNames[viableName]}`
  }

  private createInterfaceKey(route: string) {
    return '`' + route.replace(/{\S+}/g, '${string}') + '`'
  }

  private indent(times: number) {
    return new Array(times).fill(this.INDENTATION_STYLE).join('')
  }

  private jsObjectToTsInterface<T>(object: T, nestingLevel: number) {
    return (
      '{\n' +
      Object.entries(object)
        .map(
          ([key, value]) =>
            `${this.indent(nestingLevel)}${key}: ${
              typeof value === 'object'
                ? this.jsObjectToTsInterface(value, nestingLevel + 1)
                : value
            };\n`
        )
        .join('') +
      this.indent(nestingLevel) +
      '}'
    )
  }

  private assembleFileString() {
    this.fileString =
      this.importStatements.join('\n') +
      '\n\n' +
      'export interface ' +
      this.createApiInterfaceName() +
      ' ' +
      this.jsObjectToTsInterface(this.interfaceRepresentation, 1) +
      '\n'
  }

  private registerLambdaFile(fileExportSpec: FileExportSpec, filepath: string) {
    const importFilefunctionImports = []
    Object.entries(fileExportSpec).map(([exportName, lambdaExportSpec]) => {
      const importName = this.chooseAvailableImportName(exportName)
      const importAs =
        exportName === importName
          ? exportName
          : `${exportName} as ${importName}`
      importFilefunctionImports.push(importAs)

      const interfaceKey = `[index: ${this.createInterfaceKey(
        lambdaExportSpec.route
      )}]`
      if (!this.interfaceRepresentation[interfaceKey]) {
        this.interfaceRepresentation[interfaceKey] = {}
      }

      this.interfaceRepresentation[interfaceKey][
        lambdaExportSpec.method
      ] = `ReturnType<typeof ${importName}>`
    })

    this.importStatements.push(
      `import { ${importFilefunctionImports.join(', ')} } from "${filepath}";`
    )
  }

  private writeToFile() {
    this.writeFile(
      path.join(this.outDir, `${this.apiName}.d.ts`),
      this.fileString
    )
  }

  public compile() {
    Object.entries(this.apiExportSpec).forEach(([filepath, fileExportSpec]) => {
      this.registerLambdaFile(fileExportSpec, filepath)
    })

    this.assembleFileString()
    this.writeToFile()
  }
}
