import JSONFile from '.'
import * as path from 'path'

describe('JSONFile', () => {
  it('Can read the contents of a JSON file as JavaScript', () => {
    const file = new JSONFile<Record<string, string>>(
      path.join(__dirname, 'testData', 'foo.json')
    )
    expect(file.data).toMatchObject({ Hi: 'there' })
  })
})
