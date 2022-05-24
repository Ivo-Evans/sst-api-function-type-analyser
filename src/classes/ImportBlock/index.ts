export default class ImportBlock {
  private usedNames: Record<string, number> = {}
  private imports = new Map<
    string,
    { importName: string; exportName: string }[]
  >()

  private chooseAvailableImportName(desiredName: string) {
    const viableName =
      desiredName === 'default' ? 'default_export' : desiredName
    const lastCount = this.usedNames[viableName] || 0
    if (!lastCount) {
      this.usedNames[viableName] = 1
      return viableName
    }
    this.usedNames[viableName]++
    return `${viableName}_${this.usedNames[viableName]}`
  }

  public import(filepath: string, exportName: string) {
    const importName = this.chooseAvailableImportName(exportName)
    const fileImports = this.imports.get(filepath) || []
    this.imports.set(filepath, [...fileImports, { importName, exportName }])
  }

  public toString() {
    const importStatements: string[] = []
    for (const [filepath, exports] of this.imports) {
      const importAsExpression = exports
        .map(({ importName, exportName }) =>
          exportName === importName
            ? exportName
            : `${exportName} as ${importName}`
        )
        .join(', ')
      importStatements.push(
        `import { ${importAsExpression} } from "${filepath}";`
      )
    }
    return importStatements.join('\n')
  }

  public getImportNameOf(filename: string, exportName: string) {
    const notFoundError = new Error(
      `export binding ${exportName} not imported from ${filename}`
    )
    const fileImports = this.imports.get(filename)
    if (!fileImports) {
      throw notFoundError
    }

    const { importName } =
      fileImports.find((fileImport) => fileImport.exportName === exportName) ||
      {}

    if (!importName) {
      throw notFoundError
    }

    return importName
  }
}
