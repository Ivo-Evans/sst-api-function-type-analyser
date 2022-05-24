import JSONLFile from './index'
import path from 'path'

describe('JSONLFile', () => {
  it('Can read a JSONL file as an array of JavaScript objects', () => {
    const file = new JSONLFile<Record<string, string>>(
      path.join(__dirname, 'testData', 'bar.jsonl')
    )
    expect(file.data).toMatchObject([
      { hello: 'world' },
      { goodbye: 'civilisation' },
    ])
  })
})
