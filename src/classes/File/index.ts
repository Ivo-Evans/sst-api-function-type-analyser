import fs from 'fs'

export default class File {
  public readonly name: string
  public content: string

  constructor(name: string) {
    this.name = name
    this.content = this.readFromDiskIfExists(name)
  }

  protected readFromDiskIfExists(name: string) {
    try {
      return fs.readFileSync(name, 'utf-8')
    } catch (error: unknown) {
      const isError = error instanceof Error
      const isFileMissing =
        (error as Error).message ===
        `ENOENT: no such file or directory, open '${name}'`

      if (!(isError || isFileMissing)) {
        throw error
      }

      return ''
    }
  }

  public writeToDisk() {
    return fs.writeFileSync(this.name, this.content)
  }
}
