import File from '../File'

export default class JSONFile<T> extends File {
  private _data: T

  get data() {
    return this._data
  }

  private initialiseJSONFile(name: string) {
    return JSON.parse(this.readFromDiskIfExists(name) || '{}')
  }

  constructor(name: string) {
    super(name)
    this._data = this.initialiseJSONFile(name)
  }
}
