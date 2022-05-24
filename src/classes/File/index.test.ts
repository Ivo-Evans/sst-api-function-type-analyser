import File from './index'
import path from 'path'
import fs from 'fs'

describe('File', () => {
  it('Has a name', () => {
    const file = new File('Jonathan')
    expect(file.name).toBe('Jonathan')
  })

  it('Can initialise with an existing file', () => {
    const file = new File(path.join(__dirname, 'testData', 'testFile'))
    expect(file.content).toBe('gobbledygook')
  })

  it('Can initialise with a file that does not exist', () => {
    const file = new File(path.join(__dirname, 'testData', 'fakeFile'))
    expect(file.content).toBe('')
  })

  it('Can save changes to disk', () => {
    const fileName = path.join(__dirname, 'testData', 'Mary')
    const file = new File(fileName)
    file.content = 'Mary had a little lamb'
    file.writeToDisk()
    const fileContent = fs.readFileSync(fileName, 'utf-8')
    expect(fileContent).toBe(file.content)
    fs.unlinkSync(fileName)
  })

  it('Does not save changes to disk until instructed to', () => {
    const fileName = path.join(__dirname, 'testData', 'testFile')
    const file = new File(fileName)
    file.content = 'Mary had a little lamb'
    const fileContent = fs.readFileSync(fileName, 'utf-8')
    expect(fileContent).toBe('gobbledygook')
  })
})
