import path from 'path'
import ConstructsFile from '.'

describe('Constructs file', () => {
  it('Returns the Api and Function constructs in a given file', () => {
    const constructsFile = new ConstructsFile(
      path.join(__dirname, 'testData', 'constructs.json')
    )
    expect(constructsFile.apis).toMatchObject([
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
    ])
    expect(constructsFile.functions).toMatchObject([
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
    ])
  })

  it('Throws helpfully if the file does not exist', () => {
    const makeConstructsFile = () => new ConstructsFile('foobar')
    expect(makeConstructsFile).toThrowError(
      "ENOENT: no such file or directory, open 'foobar'"
    )
  })
})
