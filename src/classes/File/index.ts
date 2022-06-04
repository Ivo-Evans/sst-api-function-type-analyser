import fs from 'fs'

export default class File {
  public content = ''

  constructor(public readonly name: string) {}

  public writeToDisk() {
    return fs.writeFileSync(this.name, this.content)
  }

  public readFromDisk() {
    this.content = fs.readFileSync(this.name, 'utf-8')
    return this.content
  }
}
