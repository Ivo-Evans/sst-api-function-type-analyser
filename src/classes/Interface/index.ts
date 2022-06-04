type InterfaceEntry = string | Interface

export default class Interface {
  private readonly INDENTATION_STYLE = '  '
  private keyValuePairs: Record<string, InterfaceEntry> = {}

  constructor(private readonly name?: string) {}

  public insert(key: string, value: InterfaceEntry) {
    this.keyValuePairs[key] = value
  }

  public insertIndexSignature(key: string, value: InterfaceEntry) {
    this.insert(`[index: ${key}]`, value)
  }

  private indent(times: number) {
    return new Array(times).fill(this.INDENTATION_STYLE).join('')
  }

  private jsObjectToTsInterface<T extends object>(
    obj: T,
    nestingLevel: number
  ): string {
    const keyNestingLevel = nestingLevel + 1
    return (
      '{\n' +
      Object.entries(obj)
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
    if (!this.name) {
      throw new Error('Cannot create an interface statement without naming it')
    }
    return `interface ${this.name} ${this.toString()}`
  }
}
