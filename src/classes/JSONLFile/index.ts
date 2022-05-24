import File from '../File'

export default class JSONLFile<T> extends File {
  private _data: T[]

  get data() {
    return this._data
  }

  private initialiseJSONLFile(name: string): T[] {
    const items = this.readFromDiskIfExists(name).split('\n') || []
    return items.map((item): T => JSON.parse(item))
  }

  constructor(name: string) {
    super(name)
    this._data = this.initialiseJSONLFile(name)
  }
}
