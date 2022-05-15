import * as path from 'path'
import RouteFileMapper from '.'
import { AppExportSpec } from '../../types'

describe('RouteFileMapper', () => {
  it('Gets mapping when passed a valid project', () => {
    const pathToSSTProject = path.join(__dirname, 'test-data', 'normal')
    const files = {
      [pathToSSTProject + '/.sst/constructs.json']: `[
          {
            "id": "Api",
            "addr": "c866c84547dcf63f3d1a1eb947106f11d26f37079f",
            "stack": "test-normal-my-stack",
            "type": "Api",
            "data": {
              "graphql": false,
              "url": "https://\${Token[TOKEN.202]}.execute-api.us-east-1.\${Token[AWS.URLSuffix.6]}/",
              "httpApiId": "\${Token[TOKEN.202]}",
              "routes": [
                {
                  "route": "GET /",
                  "fn": {
                    "node": "c8051e09aed4d95ddb9273a62f569334ad86dd2852",
                    "stack": "test-normal-my-stack"
                  }
                }
              ]
            }
          },
          {
            "id": "Lambda_GET_--",
            "addr": "c8051e09aed4d95ddb9273a62f569334ad86dd2852",
            "stack": "test-normal-my-stack",
            "type": "Function",
            "data": {
              "localId": "test-normal-my-stack-Api-Lambda_GET_-",
              "arn": "\${Token[TOKEN.226]}"
            }
          }
        ]
        `,
      [pathToSSTProject +
      '/.sst/functions.jsonl']: `{"id":"test-normal-my-stack-Api-Lambda_GET_-","handler":"src/lambda.handler","runtime":"nodejs14.x","srcPath":".","root":"/home/ivo-evans/Tortoise/api-docs/src/classes/RouteFileMapper/test-projects/normal"}`,
    }
    const readFile = (filepath) => files[filepath]
    const mapping: AppExportSpec = new RouteFileMapper(
      pathToSSTProject,
      readFile
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

  it("throws usefully if a route's function cannot be found", () => {
    const pathToSSTProject = path.join(
      __dirname,
      'test-data',
      'with-incorrect-data'
    )
    const files = {
      [pathToSSTProject + '/.sst/constructs.json']: `[
          {
            "id": "Api",
            "addr": "c866c84547dcf63f3d1a1eb947106f11d26f37079f",
            "stack": "test-normal-my-stack",
            "type": "Api",
            "data": {
              "graphql": false,
              "url": "https://\${Token[TOKEN.202]}.execute-api.us-east-1.\${Token[AWS.URLSuffix.6]}/",
              "httpApiId": "\${Token[TOKEN.202]}",
              "routes": [
                {
                  "route": "GET /",
                  "fn": {
                    "node": "c8051e09aed4d95ddb9273a62f569334ad86dd2852",
                    "stack": "test-normal-my-stack"
                  }
                },
                {
                  "route": "GET /foo/bar",
                  "fn": {
                    "node": "c8051e09ae273a62f569334ad86dd2852",
                    "stack": "test-normal-my-stack"
                  }
                }
              ]
            }
          },
          {
            "id": "Lambda_GET_--",
            "addr": "c8051e09aed4d95ddb9273a62f569334ad86dd2852",
            "stack": "test-normal-my-stack",
            "type": "Function",
            "data": {
              "localId": "test-normal-my-stack-Api-Lambda_GET_-",
              "arn": "\${Token[TOKEN.226]}"
            }
          }
        ]`,
      [pathToSSTProject +
      '/.sst/functions.jsonl']: `{"id":"test-normal-my-stack-Api-Lambda_GET_-","handler":"src/lambda.handler","runtime":"nodejs14.x","srcPath":".","root":"/home/ivo-evans/Tortoise/api-docs/src/classes/RouteFileMapper/test-projects/normal"}`,
    }
    const readFile = (filepath) => files[filepath]
    const routeFileMapper = new RouteFileMapper(pathToSSTProject, readFile)
    const getMapping = () => routeFileMapper.getMapping()
    expect(getMapping).toThrowError(
      'Function for route GET /foo/bar cannot be found.'
    )
  })
})
