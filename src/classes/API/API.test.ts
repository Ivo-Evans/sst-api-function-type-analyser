import { SSTAPIConstruct, SSTFunctionConstruct } from '../../types'
import API from './'

describe('API', () => {
  it('Should be able to create a declaration file exporting an interface from valid SST files', () => {
    const disk: Record<string, string> = {}
    class MockedFile {
      private readonly name: string
      public content: string
      constructor(name: string) {
        this.name = name
        this.content = ''
      }
      public writeToDisk() {
        disk[this.name] = this.content
      }
    }

    const apiConstruct: SSTAPIConstruct = {
      id: 'api',
      addr: 'c85699106b8ea9cf9522e7bb0b278f906872e2d8df',
      stack: 'test-my-sst-app-MyStack',
      type: 'Api',
      data: {
        routes: [
          {
            route: 'POST /users',
            fn: {
              node: 'c8d995cc7cedebfe35506bf4497d03bd158bcbec08',
              stack: 'test-my-sst-app-MyStack',
            },
          },
          {
            route: 'GET /users/{id}',
            fn: {
              node: 'c8289eabd2f6b117c41265f71f33fe01708bf809a2',
              stack: 'test-my-sst-app-MyStack',
            },
          },
          {
            route: 'PUT /users/{id}',
            fn: {
              node: 'c8cb0ac5c919bd6f04ff6238435897cb5ab73da5d8',
              stack: 'test-my-sst-app-MyStack',
            },
          },
        ],
      },
    }

    const constructsFileContents: [
      SSTAPIConstruct,
      SSTFunctionConstruct,
      SSTFunctionConstruct,
      SSTFunctionConstruct
    ] = [
      {
        id: 'api',
        addr: 'c85699106b8ea9cf9522e7bb0b278f906872e2d8df',
        stack: 'test-my-sst-app-MyStack',
        type: 'Api',
        data: {
          routes: [
            {
              route: 'POST /users',
              fn: {
                node: 'c8d995cc7cedebfe35506bf4497d03bd158bcbec08',
                stack: 'test-my-sst-app-MyStack',
              },
            },
            {
              route: 'GET /users/{id}',
              fn: {
                node: 'c8289eabd2f6b117c41265f71f33fe01708bf809a2',
                stack: 'test-my-sst-app-MyStack',
              },
            },
            {
              route: 'PUT /users/{id}',
              fn: {
                node: 'c8cb0ac5c919bd6f04ff6238435897cb5ab73da5d8',
                stack: 'test-my-sst-app-MyStack',
              },
            },
          ],
        },
      },
      {
        id: 'Lambda_POST_--users',
        addr: 'c8d995cc7cedebfe35506bf4497d03bd158bcbec08',
        stack: 'test-my-sst-app-MyStack',
        type: 'Function',
        data: {
          localId: 'test-my-sst-app-MyStack-api-Lambda_POST_-users',
          arn: '${Token[TOKEN.235]}',
        },
      },
      {
        id: 'Lambda_GET_--users--{id}',
        addr: 'c8289eabd2f6b117c41265f71f33fe01708bf809a2',
        stack: 'test-my-sst-app-MyStack',
        type: 'Function',
        data: {
          localId: 'test-my-sst-app-MyStack-api-Lambda_GET_-users-{id}',
          arn: '${Token[TOKEN.267]}',
        },
      },
      {
        id: 'Lambda_PUT_--users--{id}',
        addr: 'c8cb0ac5c919bd6f04ff6238435897cb5ab73da5d8',
        stack: 'test-my-sst-app-MyStack',
        type: 'Function',
        data: {
          localId: 'test-my-sst-app-MyStack-api-Lambda_PUT_-users-{id}',
          arn: '${Token[TOKEN.299]}',
        },
      },
    ]

    const functionsFileContents = [
      {
        id: 'test-my-sst-app-MyStack-api-Lambda_POST_-users',
        handler: 'functions/users/post.default',
        runtime: 'nodejs16.x',
        srcPath: 'backend',
        bundle: { format: 'esm' },
        root: '/home/ivo-evans/Tortoise/fake-sst/my-sst-app',
      },
      {
        id: 'test-my-sst-app-MyStack-api-Lambda_GET_-users-{id}',
        handler: 'functions/users/get.default',
        runtime: 'nodejs16.x',
        srcPath: 'backend',
        bundle: { format: 'esm' },
        root: '/home/ivo-evans/Tortoise/fake-sst/my-sst-app',
      },
      {
        id: 'test-my-sst-app-MyStack-api-Lambda_PUT_-users-{id}',
        handler: 'functions/users/put.default',
        runtime: 'nodejs16.x',
        srcPath: 'backend',
        bundle: { format: 'esm' },
        root: '/home/ivo-evans/Tortoise/fake-sst/my-sst-app',
      },
    ]

    const pathToSSTProject = './random/filepath/'
    const file = new MockedFile('ApiRoutes.d.ts')
    const api = new API(
      apiConstruct,
      functionsFileContents,
      constructsFileContents,
      pathToSSTProject,
      file
    )
    api.writeInterface()
    expect(disk).toMatchObject({
      'ApiRoutes.d.ts':
        'import { default as default_export } from "random/filepath/backend/functions/users/post";\n' +
        'import { default as default_export_2 } from "random/filepath/backend/functions/users/get";\n' +
        'import { default as default_export_3 } from "random/filepath/backend/functions/users/put";\n' +
        '\n' +
        '{\n' +
        '  `/users`: {\n' +
        '    POST: ReturnType<typeof default_export>;\n' +
        '  }\n' +
        '  `/users/${string}`: {\n' +
        '    GET: ReturnType<typeof default_export_2>;\n' +
        '    PUT: ReturnType<typeof default_export_3>;\n' +
        '  }\n' +
        '}',
    })
  })
})
