import ImportBlock from '.'

describe('ImportBlock', () => {
  it('can import a default export', () => {
    const importBlock = new ImportBlock()
    importBlock.import('/foo/bar', 'default')
    expect(importBlock.toString()).toBe(
      'import { default as default_export } from "/foo/bar";'
    )
  })

  it('can import a named export', () => {
    const importBlock = new ImportBlock()
    importBlock.import('/foo/bar', 'post')
    expect(importBlock.toString()).toBe('import { post } from "/foo/bar";')
  })

  it('can import from a file that has both named and default exports', () => {
    const importBlock = new ImportBlock()
    importBlock.import('/foo/bar', 'default')
    importBlock.import('/foo/bar', 'post')
    expect(importBlock.toString()).toBe(
      'import { default as default_export, post } from "/foo/bar";'
    )
  })

  it('can import from multiple files', () => {
    const importBlock = new ImportBlock()
    importBlock.import('/foo/bar', 'default')
    importBlock.import('/foo/baz', 'post')
    expect(importBlock.toString()).toBe(
      [
        'import { default as default_export } from "/foo/bar";',
        'import { post } from "/foo/baz";',
      ].join('\n')
    )
  })

  it('avoids name collisions when importing from multiple files', () => {
    const importBlock = new ImportBlock()
    importBlock.import('/foo/bar', 'default')
    importBlock.import('/foo/bar', 'post')
    importBlock.import('/foo/baz', 'post')
    importBlock.import('/foo/luhrman', 'default')
    expect(importBlock.toString()).toBe(
      [
        'import { default as default_export, post } from "/foo/bar";',
        'import { post as post_2 } from "/foo/baz";',
        'import { default as default_export_2 } from "/foo/luhrman";',
      ].join('\n')
    )
  })

  it('keeps a record of how exports from imported files correspond to import names', () => {
    const importBlock = new ImportBlock()
    importBlock.import('/foo/bar', 'default')
    importBlock.import('/foo/luhrman', 'default')
    expect(importBlock.getImportNameOf('/foo/bar', 'default')).toBe(
      'default_export'
    )
    expect(importBlock.getImportNameOf('/foo/luhrman', 'default')).toBe(
      'default_export_2'
    )
  })
})
