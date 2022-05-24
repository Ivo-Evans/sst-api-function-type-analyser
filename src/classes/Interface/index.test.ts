import Interface from '.'

const INDENTATION_LEVEL = '  '

describe('Interface', () => {
  it('When strings are used to insert entries, they are interpreted as TypeScript values', () => {
    const interfaceInstance = new Interface()
    interfaceInstance.insert('foo', 'bar')
    expect(interfaceInstance.toString()).toBe(
      ['{', `${INDENTATION_LEVEL}foo: bar;`, '}'].join('\n')
    )
  })
  it('can insert a template string index signature', () => {
    const interfaceInstance = new Interface()
    interfaceInstance.insertIndexSignature('foo/${string}/bar', 'bar')
    expect(interfaceInstance.toString()).toBe(
      [
        '{',
        `${INDENTATION_LEVEL}[index: \`foo/$\{string}/bar\`]: bar;`,
        '}',
      ].join('\n')
    )
  })

  it('can insert an Interface object as a value', () => {
    const interfaceInstance = new Interface()
    const secondInterfaceInstance = new Interface()
    secondInterfaceInstance.insert('foo', 'bar')
    interfaceInstance.insert('baz', secondInterfaceInstance)
    expect(interfaceInstance.toString()).toBe(
      [
        '{',
        INDENTATION_LEVEL + 'baz: {',
        INDENTATION_LEVEL + INDENTATION_LEVEL + 'foo: bar;',
        INDENTATION_LEVEL + '}',
        '}',
      ].join('\n')
    )
  })

  it('can create an interface statement', () => {
    const interfaceInstance = new Interface()
    interfaceInstance.insert('foo', 'bar')
    expect(interfaceInstance.toStatementString()).toBe(
      ['interface {', `${INDENTATION_LEVEL}foo: bar;`, '}'].join('\n')
    )
  })
})
