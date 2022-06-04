import App from '.'
import path from 'path'
import fs from 'fs'

const outfilePath = path.join(__dirname, 'testData', 'out', 'api.d.ts')
describe('App', () => {
  beforeEach(() => {
    if (fs.existsSync(outfilePath)) {
      fs.unlinkSync(outfilePath)
    }
  })
  it('can create a correct interface for an API', () => {
    const config = {
      srcDir: path.join(__dirname, 'testData', 'in'),
      outDir: path.join(__dirname, 'testData', 'out'),
    }

    const app = new App(config)

    app.generateTypes()

    const fileContents = fs.readFileSync(outfilePath, 'utf-8')
    expect(fileContents).toBe(
      [
        'import { default as default_export } from "backend/functions/users/post";',
        'import { default as default_export_2 } from "backend/functions/users/get";',
        'import { default as default_export_3 } from "backend/functions/users/put";',
        '',
        'export interface api {',
        '  [index: `/users`]: {',
        '    POST: ReturnType<typeof default_export>;',
        '  }',
        '  [index: `/users/${string}`]: {',
        '    GET: ReturnType<typeof default_export_2>;',
        '    PUT: ReturnType<typeof default_export_3>;',
        '  }',
        '}',
      ].join('\n')
    )
  })
})
