type InterfaceEntry = string | Interface

export default class Interface {
  private readonly INDENTATION_STYLE = '  '
  private keyValuePairs: Record<string, InterfaceEntry> = {}

  public insert(key: string, value: InterfaceEntry) {
    this.keyValuePairs[key] = value
  }

  public insertIndexSignature(key: string, value: InterfaceEntry) {
    this.insert(`[index: \`${key}\`]`, value)
  }

  private indent(times: number) {
    return new Array(times).fill(this.INDENTATION_STYLE).join('')
  }

  private jsObjectToTsInterface<T>(object: T, nestingLevel: number): string {
    const keyNestingLevel = nestingLevel + 1
    return (
      '{\n' +
      Object.entries(object)
        .map(([key, value]) => {
          return `${this.indent(keyNestingLevel)}${key}: ${
            value instanceof Interface
              ? value.toString(keyNestingLevel)
              : value + ';'
          }\n`
        })
        .join('') +
      this.indent(nestingLevel) +
      '}'
    )
  }

  public toString(nestingLevel = 0) {
    return this.jsObjectToTsInterface(this.keyValuePairs, nestingLevel)
  }

  public toStatementString() {
    return `interface ${this.toString()}`
  }
}
