import * as path from 'path'
import RouteFileMapper from '.'
import { AppExportSpec } from '../../types'

describe('RouteFileMapper', () => {
  it('Gets mapping when passed a valid project', () => {
    const pathToSSTProject = path.join(__dirname, 'test-data', 'normal')
    const mapping: AppExportSpec = new RouteFileMapper(
      pathToSSTProject
    ).getMapping()

    expect(mapping).toMatchObject({
      Api: {
        [path.join(pathToSSTProject, 'src/lambda')]: {
          handler: {
            method: 'GET',
            route: '/',
          },
        },
      },
    })
  })

  it('throws usefully when path to SST project is invalid', () => {
    const routeFileMapper = new RouteFileMapper('/foo/bar')
    const getMapping = () => routeFileMapper.getMapping()
    expect(getMapping).toThrowError(
      "ENOENT: no such file or directory, open '/foo/bar/.sst/constructs.json'"
    )
  })

  it("throws usefully if a route's function cannot be found", () => {
    const routeFileMapper = new RouteFileMapper(
      path.join(__dirname, 'test-data', 'with-incorrect-data')
    )
    const getMapping = () => routeFileMapper.getMapping()
    expect(getMapping).toThrowError(
      'Function for route GET /foo/bar cannot be found.'
    )
  })
})
