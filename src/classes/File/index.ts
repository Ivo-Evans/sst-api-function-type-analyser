import fs from 'fs'

export default class File {
  public content: string

  constructor(public readonly name: string) {
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
