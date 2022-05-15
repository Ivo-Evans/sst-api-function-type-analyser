import * as path from 'path'
import RouteFileMapper from '.'
import { AppExportSpec } from '../../types'

describe('RouteFileMapper', () => {
  it('Gets correct mapping when a file exports one route with a named exports', () => {
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

  it('Gets correct mapping when a file exports multiple lambdas for different routes', () => {
    const pathToSSTProject = path.join(__dirname, 'test-data', 'normal')
    const files = {
      [pathToSSTProject +
      '/.sst/constructs.json']: `[{"id":"api","addr":"c85699106b8ea9cf9522e7bb0b278f906872e2d8df","stack":"test-my-sst-app-MyStack","type":"Api","data":{"graphql":false,"url":"https://\${Token[TOKEN.200]}.execute-api.us-east-1.\${Token[AWS.URLSuffix.4]}/","httpApiId":"\${Token[TOKEN.200]}","routes":[{"route":"POST /users","fn":{"node":"c8d995cc7cedebfe35506bf4497d03bd158bcbec08","stack":"test-my-sst-app-MyStack"}},{"route":"GET /users/{id}","fn":{"node":"c8289eabd2f6b117c41265f71f33fe01708bf809a2","stack":"test-my-sst-app-MyStack"}},{"route":"PUT /users/{id}","fn":{"node":"c8cb0ac5c919bd6f04ff6238435897cb5ab73da5d8","stack":"test-my-sst-app-MyStack"}}]}},{"id":"Lambda_POST_--users","addr":"c8d995cc7cedebfe35506bf4497d03bd158bcbec08","stack":"test-my-sst-app-MyStack","type":"Function","data":{"localId":"test-my-sst-app-MyStack-api-Lambda_POST_-users","arn":"\${Token[TOKEN.229]}"}},{"id":"Lambda_GET_--users--{id}","addr":"c8289eabd2f6b117c41265f71f33fe01708bf809a2","stack":"test-my-sst-app-MyStack","type":"Function","data":{"localId":"test-my-sst-app-MyStack-api-Lambda_GET_-users-{id}","arn":"\${Token[TOKEN.261]}"}},{"id":"Lambda_PUT_--users--{id}","addr":"c8cb0ac5c919bd6f04ff6238435897cb5ab73da5d8","stack":"test-my-sst-app-MyStack","type":"Function","data":{"localId":"test-my-sst-app-MyStack-api-Lambda_PUT_-users-{id}","arn":"\${Token[TOKEN.293]}"}}]
      `,
      [pathToSSTProject +
      '/.sst/functions.jsonl']: `{"id":"test-my-sst-app-MyStack-api-Lambda_POST_-users","handler":"functions/users.postUser","runtime":"nodejs16.x","srcPath":"backend","bundle":{"format":"esm"},"root":"/home/ivo-evans/Tortoise/fake-sst/my-sst-app"}
      {"id":"test-my-sst-app-MyStack-api-Lambda_GET_-users-{id}","handler":"functions/users.getUser","runtime":"nodejs16.x","srcPath":"backend","bundle":{"format":"esm"},"root":"/home/ivo-evans/Tortoise/fake-sst/my-sst-app"}
      {"id":"test-my-sst-app-MyStack-api-Lambda_PUT_-users-{id}","handler":"functions/users.putUser","runtime":"nodejs16.x","srcPath":"backend","bundle":{"format":"esm"},"root":"/home/ivo-evans/Tortoise/fake-sst/my-sst-app"}
      `,
    }
    const readFile = (filepath) => files[filepath]
    const mapping: AppExportSpec = new RouteFileMapper(
      pathToSSTProject,
      readFile
    ).getMapping()

    expect(mapping).toMatchObject({
      api: {
        [path.join(pathToSSTProject, 'backend/functions/users')]: {
          postUser: {
            method: 'POST',
            route: '/users',
          },
          getUser: {
            method: 'GET',
            route: '/users/{id}',
          },
          putUser: {
            method: 'PUT',
            route: '/users/{id}',
          },
        },
      },
    })
  })

  it('Gets correct mapping when multiple files default export lambdas for different routes', () => {
    const pathToSSTProject = path.join(__dirname, 'test-data', 'normal')
    const files = {
      [pathToSSTProject +
      '/.sst/constructs.json']: `[{"id":"api","addr":"c85699106b8ea9cf9522e7bb0b278f906872e2d8df","stack":"test-my-sst-app-MyStack","type":"Api","data":{"graphql":false,"url":"https://\${Token[TOKEN.206]}.execute-api.us-east-1.\${Token[AWS.URLSuffix.10]}/","httpApiId":"\${Token[TOKEN.206]}","routes":[{"route":"POST /users","fn":{"node":"c8d995cc7cedebfe35506bf4497d03bd158bcbec08","stack":"test-my-sst-app-MyStack"}},{"route":"GET /users/{id}","fn":{"node":"c8289eabd2f6b117c41265f71f33fe01708bf809a2","stack":"test-my-sst-app-MyStack"}},{"route":"PUT /users/{id}","fn":{"node":"c8cb0ac5c919bd6f04ff6238435897cb5ab73da5d8","stack":"test-my-sst-app-MyStack"}}]}},{"id":"Lambda_POST_--users","addr":"c8d995cc7cedebfe35506bf4497d03bd158bcbec08","stack":"test-my-sst-app-MyStack","type":"Function","data":{"localId":"test-my-sst-app-MyStack-api-Lambda_POST_-users","arn":"\${Token[TOKEN.235]}"}},{"id":"Lambda_GET_--users--{id}","addr":"c8289eabd2f6b117c41265f71f33fe01708bf809a2","stack":"test-my-sst-app-MyStack","type":"Function","data":{"localId":"test-my-sst-app-MyStack-api-Lambda_GET_-users-{id}","arn":"\${Token[TOKEN.267]}"}},{"id":"Lambda_PUT_--users--{id}","addr":"c8cb0ac5c919bd6f04ff6238435897cb5ab73da5d8","stack":"test-my-sst-app-MyStack","type":"Function","data":{"localId":"test-my-sst-app-MyStack-api-Lambda_PUT_-users-{id}","arn":"\${Token[TOKEN.299]}"}}]`,
      [pathToSSTProject +
      '/.sst/functions.jsonl']: `{"id":"test-my-sst-app-MyStack-api-Lambda_POST_-users","handler":"functions/users/post.default","runtime":"nodejs16.x","srcPath":"backend","bundle":{"format":"esm"},"root":"/home/ivo-evans/Tortoise/fake-sst/my-sst-app"}
      {"id":"test-my-sst-app-MyStack-api-Lambda_GET_-users-{id}","handler":"functions/users/get.default","runtime":"nodejs16.x","srcPath":"backend","bundle":{"format":"esm"},"root":"/home/ivo-evans/Tortoise/fake-sst/my-sst-app"}
      {"id":"test-my-sst-app-MyStack-api-Lambda_PUT_-users-{id}","handler":"functions/users/put.default","runtime":"nodejs16.x","srcPath":"backend","bundle":{"format":"esm"},"root":"/home/ivo-evans/Tortoise/fake-sst/my-sst-app"}`,
    }
    const readFile = (filepath) => files[filepath]
    const mapping: AppExportSpec = new RouteFileMapper(
      pathToSSTProject,
      readFile
    ).getMapping()

    expect(mapping).toMatchObject({
      api: {
        [path.join(pathToSSTProject, 'backend/functions/users/get')]: {
          default: {
            method: 'GET',
            route: '/users/{id}',
          },
        },
        [path.join(pathToSSTProject, 'backend/functions/users/post')]: {
          default: {
            method: 'POST',
            route: '/users',
          },
        },
        [path.join(pathToSSTProject, 'backend/functions/users/put')]: {
          default: {
            method: 'PUT',
            route: '/users/{id}',
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
